/* Seviye 10 – Nehir köprüsü: 3 tahtayı sürükleyip köprü kur. */
(function () {
  'use strict';
  var FO = window.FO;
  var SLOTS = [{ x: 600 }, { x: 960 }, { x: 1320 }], SY = 520, PW = 340, PH = PW * 167 / 512;
  var TRAY = [{ x: 420, y: 880 }, { x: 800, y: 880 }, { x: 1180, y: 880 }];

  FO.levels.define(10, {
    bg: 'bg_river', assets: ['items/item_plank.png', 'items/item_worker_robot.png', 'items/robi_leg.png'], intro: 'lv10_intro', hint: 'lv10_hint',
    build: function (L) {
      var prog = L.progress(3), placed = 0, dragging = null;
      SLOTS.forEach(function (s) {
        s.el = FO.el('div', { class: 'plank-slot', style: { left: (s.x - PW / 2 - 8) + 'px', top: (SY - PH / 2 - 8) + 'px', width: PW + 16 + 'px', height: PH + 16 + 'px' } });
        L.root.append(s.el);
      });
      var walker = L.sprite('items/item_worker_robot.png', { x: 230, y: SY - 40, w: 170, h: 178, cls: 'walker' });

      TRAY.forEach(function (t) {
        var hx = t.x - PW / 2, hy = t.y - PH / 2;
        var it = FO.el('div', { class: 'drag plank', style: { left: hx + 'px', top: hy + 'px', width: PW + 'px', height: PH + 'px' } },
          FO.el('img', { src: FO.A('items/item_plank.png'), alt: '', draggable: 'false' }));
        it._x = hx; it._y = hy; it._home = { x: hx, y: hy }; it._done = false;
        it.addEventListener('pointerdown', function (e) {
          if (it._done || dragging || e.button !== 0) return;
          e.preventDefault(); try { it.setPointerCapture(e.pointerId); } catch (err) {}
          var p = FO.stage.toStage(e.clientX, e.clientY);
          dragging = { it: it, dx: p.x - it._x, dy: p.y - it._y };
          it.classList.remove('ret'); it.classList.add('dragging'); FO.audio.sfx('click');
        });
        it.addEventListener('pointermove', function (e) {
          if (!dragging || dragging.it !== it) return;
          var p = FO.stage.toStage(e.clientX, e.clientY);
          it._x = p.x - dragging.dx; it._y = p.y - dragging.dy;
          it.style.left = it._x + 'px'; it.style.top = it._y + 'px';
        });
        function end() {
          if (!dragging || dragging.it !== it) return;
          dragging = null; it.classList.remove('dragging');
          var cx = it._x + PW / 2, cy = it._y + PH / 2, best = null, bd = 1e9;
          /* dikeyde cömert: nehrin herhangi bir yerine bırakılan tahta en yakın boş yere oturur */
          SLOTS.forEach(function (s) { if (s.full) return; var d = Math.hypot(cx - s.x, (cy - SY) * 0.45); if (d < bd) { bd = d; best = s; } });
          if (best && bd < 260 && cy > 200 && cy < 820) {
            best.full = true; it._done = true; it.classList.add('snap');
            it._x = best.x - PW / 2; it._y = SY - PH / 2; it.style.left = it._x + 'px'; it.style.top = it._y + 'px';
            best.el.classList.add('filled');
            FO.audio.sfx('drop'); setTimeout(function () { FO.audio.sfx('ok'); }, 140);
            placed++;
            if (prog.inc()) cross(); else L.say('match_ok_' + (placed + 1), { pose: 'happy', after: 'idle' });
          } else {
            it.classList.add('ret'); it._x = it._home.x; it._y = it._home.y;
            it.style.left = it._x + 'px'; it.style.top = it._y + 'px'; FO.audio.sfx('drop');
            if (Math.hypot(cx - it._home.x - PW / 2, cy - it._home.y - PH / 2) > 280) L.say('lv10_wrong', { pose: 'think', after: 'idle' });
          }
        }
        it.addEventListener('pointerup', end); it.addEventListener('pointercancel', end);
        L.root.append(it);
      });

      function cross() {
        L.say('lv10_cross', { pose: 'happy', after: 'idle' });
        var dx = 1500 - 230;
        walker.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + dx + 'px)' }], { duration: 2400, easing: 'ease-in-out', fill: 'forwards' });
        setTimeout(function () { if (L.alive()) L.reward('robi_leg', 'lv10_done'); }, 2500);
      }
    }
  });
})();
