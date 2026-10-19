/* Seviye çatısı. Her seviye ayrı dosyada: FO.levels.define(n, { bg, assets, intro, hint, build(L) })
 * build(L) içinde L.root, L.sprite(), L.progress(), L.say(), L.hint(), L.done() vardır. */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});

  /* Harita sırası ve simgeleri. built=false olanlar sonraki fazda yapılacak. */
  var META = [
    { n: 1,  icon: 'items/item_star.png' },
    { n: 2,  icon: 'items/item_balloon_red.png' },
    { n: 3,  icon: 'items/item_gift_closed.png' },
    { n: 4,  icon: 'items/item_apple.png' },
    { n: 5,  icon: 'items/item_ball_blue.png' },
    { n: 6,  icon: 'items/item_cloud.png' },
    { n: 7,  icon: 'items/item_cow.png' },
    { n: 8,  icon: 'items/robi_head.png' },
    { n: 9,  icon: 'items/item_flag.png' },
    { n: 10, icon: 'items/item_plank.png' },
    { n: 11, icon: 'items/item_stone.png' },
    { n: 12, icon: 'items/item_wrench.png' },
    { n: 13, icon: 'items/item_beacon.png' },
    { n: 14, icon: 'mascot/mascot_happy.png' },
    { n: 15, icon: 'items/item_worker_robot.png' }
  ];
  var built = {};
  /* Hikaye: hangi seviye Robi'nin hangi parçasını verir. */
  var PARTS = { 9: 'robi_arm', 10: 'robi_leg', 11: 'robi_antenna', 12: 'robi_body', 13: 'robi_head' };
  var PART_ORDER = [9, 10, 11, 12, 13];

  var DONE_LINES = ['lv_done_1', 'lv_done_2', 'lv_done_3'];
  var doneIdx = 0;

  FO.levels = {
    meta: META,
    has: function (n) { return !!built[n]; },
    parts: PARTS,
    allDone: function () { for (var i = 1; i <= 15; i++) if (!FO.state.isDone('level' + i)) return false; return true; },
    isOpen: function (n) { return n === 1 || FO.state.get('unlockAll') || FO.state.isDone('level' + (n - 1)); },

    define: function (n, cfg) {
      built[n] = true;
      FO.router.register('level' + n, function () {
        var t0 = performance.now(), cleanups = [], root, alive = true, finished = false, hintT = 0, nextBtn, hintId = cfg.hint, hintMs = cfg.hintMs || 11000;

        var L = {
          n: n,
          get root() { return root; },
          alive: function () { return alive; },
          finished: function () { return finished; },

          /* Merkez noktası (x,y) ve genişliği (w) ile görsel koyar. */
          sprite: function (file, o) {
            o = o || {};
            var im = FO.el('img', { class: 'lv-sprite ' + (o.cls || ''), src: FO.A(file), alt: '', draggable: 'false' });
            im.style.width = o.w + 'px';
            if (o.x != null) { im.style.left = (o.x - o.w / 2) + 'px'; im.style.top = (o.y - (o.h || o.w) / 2) + 'px'; }
            (o.parent || root).append(im);
            return im;
          },

          say: function (id, opts) {
            if (opts && opts.pose === 'think') FO.profiles.levelHelp(n);     // Robi yönlendirdi = yardım sayılır
            return FO.mascot.say(id, opts || {});
          },

          /* Dinleyiciler seviyeden çıkınca otomatik kaldırılır. */
          listen: function (target, type, fn, opts) {
            target.addEventListener(type, fn, opts);
            cleanups.push(function () { target.removeEventListener(type, fn, opts); });
          },
          /* Her karede fn(dt saniye) çağrılır. */
          loop: function (fn) {
            var last = performance.now(), id = 0, stop = false;
            function tick(t) {
              if (stop || !alive) return;
              var dt = Math.min(0.05, (t - last) / 1000); last = t;
              fn(dt);
              id = requestAnimationFrame(tick);
            }
            id = requestAnimationFrame(tick);
            cleanups.push(function () { stop = true; cancelAnimationFrame(id); });
          },
          /* Çift tık algılama: iki basış arası GAP ms içindeyse true. Çocuklar için cömert. */
          dbl: function (gap) {
            var last = 0;
            return function () {
              var now = performance.now();
              if (now - last < (gap || 650)) { last = 0; return true; }
              last = now; return false;
            };
          },
          /* Ok/boşluk/Enter tuşları (yalnızca bunlar). */
          keys: function (onDown, onUp) {
            var held = {};
            function norm(e) {
              return e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.code === 'Space' ? (e.key === ' ' ? 'Space' : e.key) : null;
            }
            L.listen(window, 'keydown', function (e) {
              var k = norm(e); if (!k) return;
              e.preventDefault();
              if (e.repeat) return;
              held[k] = true; if (onDown) onDown(k);
            });
            L.listen(window, 'keyup', function (e) {
              var k = norm(e); if (!k) return;
              held[k] = false; if (onUp) onUp(k);
            });
            L.listen(window, 'blur', function () { held = {}; });
            return { held: function (k) { return !!held[k]; }, set: function (k, v) { held[k] = v; } };
          },

          /* Ders boyunca çalışan ipucu: ilerleme olmadan süre dolarsa Robi ipucunu söyler. */
          touch: function () {
            clearTimeout(hintT);
            if (finished || !hintId) return;
            hintT = setTimeout(function () {
              if (!alive || finished) return;
              FO.profiles.levelHelp(n);
              FO.mascot.say(hintId, { pose: 'think', after: 'idle' });
              L.touch();
            }, hintMs);
          },
          setHint: function (id) { hintId = id; L.touch(); },

          /* Üstte yıldız sayacı. */
          progress: function (total) {
            var row = FO.el('div', { class: 'lv-progress' }), imgs = [], got = 0;
            for (var i = 0; i < total; i++) {
              var im = FO.el('img', { src: FO.A('ui/star_empty.png'), alt: '', draggable: 'false' });
              imgs.push(im); row.append(im);
            }
            root.append(row);
            return {
              inc: function () {
                if (got >= total) return true;
                imgs[got].src = FO.A('ui/star_full.png'); FO.flash(imgs[got], 'got', 600);
                if (FO.fx) { var r = imgs[got].getBoundingClientRect(), q = FO.stage.toStage(r.left + r.width / 2, r.top + r.height / 2); FO.fx.burst(q.x, q.y, 10, 110); }
                FO.audio.sfx('step', got);
                got++; L.touch();
                return got >= total;
              },
              count: function () { return got; }
            };
          },

          /* Robi'nin parçası bulundu: ortada büyür, sonra seviye biter. */
          reward: function (file, line) {
            if (finished) return;
            var big = L.sprite('items/' + file + '.png', { x: 960, y: 520, w: 320, h: 320, cls: 'part-reward' });
            FO.audio.sfx('star');
            setTimeout(function () { if (alive) FO.audio.sfx('win'); }, 350);
            L.done(line);
          },

          /* Seviye bitti: kutlama + devam butonu. */
          done: function (line) {
            if (finished) return;
            finished = true; clearTimeout(hintT);
            FO.state.markDone('level' + n);
            FO.profiles.levelDone(n, (performance.now() - t0) / 1000);
            FO.audio.sfx('win');
            FO.confetti(20);
            doneIdx = doneIdx % DONE_LINES.length;
            FO.mascot.say(line || DONE_LINES[doneIdx++], { pose: 'cheer', after: 'idle' });
            setTimeout(function () {
              if (!alive || nextBtn) return;
              nextBtn = FO.el('button', { class: 'nav-btn next-btn pulse', type: 'button', 'aria-label': 'Devam' },
                FO.el('img', { src: FO.A('ui/btn_next.png'), alt: '' }));
              nextBtn.addEventListener('click', function () { FO.audio.sfx('swoosh'); FO.router.go(cfg.next || 'map'); });
              root.append(nextBtn);
            }, 900);
          }
        };

        return {
          assets: (n >= 9 && n <= 13 ? PART_ORDER.map(function (lv) { return 'items/' + PARTS[lv] + '.png'; }) : []).concat(['ui/star_empty.png', 'ui/star_full.png', 'ui/btn_next.png', 'ui/btn_prev.png']).concat(cfg.bg ? ['bg/' + cfg.bg + '.jpg'] : [], cfg.assets || []),
          mount: function (r) {
            root = r;
            FO.profiles.levelStart(n);
            if (cfg.bg) root.append(FO.el('img', { class: 'bg', src: FO.A('bg/' + cfg.bg + '.jpg'), alt: '', draggable: 'false' }));
            cfg.build(L);
            if (n >= 9 && n <= 13) {
              var tray = FO.el('div', { class: 'parts-tray', 'aria-hidden': 'true' });
              PART_ORDER.forEach(function (lv) {
                var got = FO.state.isDone('level' + lv) && lv !== n;
                tray.append(FO.el('img', { class: got ? 'got' : '', src: FO.A('items/' + PARTS[lv] + '.png'), alt: '', draggable: 'false' }));
              });
              root.append(tray);
            }
            var back = FO.el('button', { class: 'nav-btn prev-btn', type: 'button', 'aria-label': 'Harita' },
              FO.el('img', { src: FO.A('ui/btn_prev.png'), alt: '' }));
            back.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('map'); });
            root.append(back);
          },
          start: function () {
            t0 = performance.now();
            FO.mascot.show('corner');
            if (cfg.intro) FO.mascot.say(cfg.intro);
            if (PARTS[n]) {
              /* hikâye kartı: hangi parçayı aradığımız net görünsün */
              var seek = FO.el('div', { class: 'seek-card' },
                FO.el('img', { src: FO.A('items/' + PARTS[n] + '.png'), alt: '', draggable: 'false' }),
                FO.el('span', null, '?'));
              L.root.append(seek);
              setTimeout(function () { seek.classList.add('out'); setTimeout(function () { seek.remove(); }, 700); }, 5500);
            }
            L.touch();
            if (cfg.start) cfg.start(L);
          },
          unmount: function () { alive = false; clearTimeout(hintT); cleanups.forEach(function (f) { try { f(); } catch (e) {} }); if (cfg.unmount) cfg.unmount(L); }
        };
      });
    }
  };
})();
