/* Fare tuşlarını tanıma: sol tuş, sağ tuş, tekerlek.
 * Çocuk GERÇEK farenin tuşuna basar; ekrandaki fare o tuşu yakar. İmleç nerede olursa olsun sayılır. */
(function () {
  'use strict';
  var FO = window.FO;

  /* mouse_base.png 576x800 – bölgeler görsele göre yüzde olarak */
  var ZONES = {
    left:  { l: 8.5,  t: 6.5, w: 40.5, h: 41,  r: '70% 6% 6% 45% / 80% 6% 6% 30%' },
    right: { l: 51,   t: 6.5, w: 40.5, h: 41,  r: '6% 70% 45% 6% / 6% 80% 30% 6%' },
    wheel: { l: 42.5, t: 16,  w: 15,  h: 21,  r: '50%' }
  };
  var ORDER = ['left', 'right', 'wheel'];

  FO.router.register('buttons', function () {
    var root, mouseBox, zoneEl = {}, stars = [], stageIdx = 0, done = false, alive = true, wheelAcc = 0, accept = false, nextBtn;

    function light(name) {
      var z = zoneEl[name]; if (!z) return;
      z.classList.remove('lit'); void z.offsetWidth; z.classList.add('lit');
      setTimeout(function () { z.classList.remove('lit'); }, 380);
    }
    function target() { return done ? null : ORDER[stageIdx]; }
    function setTarget() {
      ORDER.forEach(function (n) { zoneEl[n].classList.toggle('target', n === target()); });
    }

    function say(id, pose) { return FO.mascot.say(id, { pose: pose || 'idle', after: 'idle' }); }

    function success() {
      var name = ORDER[stageIdx];
      accept = false;
      FO.audio.sfx('ok');
      setTimeout(function () { FO.audio.sfx('star'); }, 150);
      stars[stageIdx].src = FO.A('ui/star_full.png');
      stars[stageIdx].classList.add('got');
      FO.confetti(8);
      stageIdx++;
      zoneEl[name].classList.remove('target');
      var ok = say('buttons_' + name + '_ok', 'happy');
      if (stageIdx >= ORDER.length) {
        done = true; setTarget();
        FO.state.markDone('buttons');
        ok.then(function () { if (!alive) return; return say('buttons_done', 'cheer'); })
          .then(function () { if (alive) showNext(); });
        setTimeout(function () { if (alive) showNext(); }, 3500);
        return;
      }
      ok.then(function () {
        if (!alive) return;
        setTarget(); accept = true;
        FO.mascot.say('buttons_' + ORDER[stageIdx]);
      });
    }

    function showNext() {
      if (nextBtn) return;
      FO.audio.sfx('win');
      nextBtn = FO.el('button', { class: 'nav-btn next-btn pulse', type: 'button', 'aria-label': 'Devam' },
        FO.el('img', { src: FO.A('ui/btn_next.png'), alt: '' }));
      nextBtn.addEventListener('click', function () { FO.audio.sfx('swoosh'); FO.router.go('map'); });
      root.append(nextBtn);
    }

    function onDown(e) {
      if (e.target.closest && e.target.closest('.nav-btn')) return;
      var name = e.button === 0 ? 'left' : e.button === 2 ? 'right' : e.button === 1 ? 'wheel' : null;
      if (!name) return;
      FO.audio.sfx('click');
      light(name);
      if (!accept || done) return;
      var want = ORDER[stageIdx];
      if (name === want) { success(); return; }
      if (want === 'left' && name === 'right') say('buttons_try_left', 'think');
      else if (want === 'right' && name === 'left') say('buttons_try_right', 'think');
      else if (want === 'wheel') { /* sol/sağ basıldı: sessizce tekerleği hatırlat */ }
    }

    function onWheel(e) {
      light('wheel');
      zoneEl.wheel.classList.add('spin'); setTimeout(function () { zoneEl.wheel.classList.remove('spin'); }, 250);
      if (!accept || done || ORDER[stageIdx] !== 'wheel') return;
      wheelAcc += Math.abs(e.deltaY) + Math.abs(e.deltaX);
      if (wheelAcc > 120) success();
    }

    return {
      assets: ['bg/bg_room.jpg', 'mouse/mouse_base.png', 'ui/star_full.png', 'ui/star_empty.png', 'ui/btn_next.png', 'ui/btn_prev.png'],

      mount: function (r) {
        root = r;
        root.append(FO.el('img', { class: 'bg', src: FO.A('bg/bg_room.jpg'), alt: '', draggable: 'false' }));
        mouseBox = FO.el('div', { class: 'btn-mouse' },
          FO.el('img', { src: FO.A('mouse/mouse_base.png'), alt: 'Fare', draggable: 'false' }));
        ORDER.forEach(function (n) {
          var z = ZONES[n];
          var d = FO.el('div', { class: 'zone zone-' + n, style: {
            left: z.l + '%', top: z.t + '%', width: z.w + '%', height: z.h + '%', borderRadius: z.r } });
          zoneEl[n] = d; mouseBox.append(d);
        });
        root.append(mouseBox);

        var row = FO.el('div', { class: 'star-row' });
        ORDER.forEach(function () {
          var s = FO.el('img', { src: FO.A('ui/star_empty.png'), alt: '', draggable: 'false' });
          stars.push(s); row.append(s);
        });
        root.append(row);

        var prev = FO.el('button', { class: 'nav-btn prev-btn', type: 'button', 'aria-label': 'Geri' },
          FO.el('img', { src: FO.A('ui/btn_prev.png'), alt: '' }));
        prev.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('customize'); });
        root.append(prev);

        root.addEventListener('pointerdown', onDown);
        root.addEventListener('wheel', onWheel, { passive: true });
        if (FO.state.get('unlockAll') || FO.state.isDone('buttons')) { /* tekrar oynayabilir; ileri butonu hemen gelir */ setTimeout(showNext, 0); }
      },

      start: function () {
        FO.mascot.show('corner');
        setTarget(); accept = true;
        FO.mascot.say('buttons_intro').then(function () {
          if (!alive || stageIdx !== 0 || done) return;
          return FO.mascot.say('buttons_left');
        });
      },

      unmount: function () { alive = false; accept = false; }
    };
  });
})();
