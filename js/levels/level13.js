/* Seviye 13 – Yüksek kule: tekerlekle tırman, yayın önünde Boşluk tuşuyla zıpla. Tepede Robi'nin kafası var. */
(function () {
  'use strict';
  var FO = window.FO;
  var WORLD = 2862, MAXC = WORLD - 1080;                  // bg_tower 848x1264 → 1920 genişliğe ölçekli
  var BARRIERS = [480, 1100, 1680];                       // kamera değerleri
  var RX = 900, RFLOOR = 900, RW = 190, RH = RW * 512 / 488;
  var SPX = 1120, SPW = 150, SPH = SPW * 512 / 361;       // yay x merkezi ve boyutu

  FO.levels.define(13, {
    bg: null, assets: ['bg/bg_tower.jpg', 'items/item_spring.png', 'items/item_worker_robot.png', 'items/robi_head.png'],
    intro: 'lv13_intro', hint: 'lv13_hint', hintMs: 10000,
    build: function (L) {
      var cam = 0, target = 0, cleared = 0, jumping = false, atTop = false, blockedSaid = false;
      var world = FO.el('div', { class: 'climb-world', style: { height: WORLD + 'px' } });
      world.append(FO.el('img', { class: 'tower-img', src: FO.A('bg/bg_tower.jpg'), alt: '', draggable: 'false' }));
      /* yaylar kule yüzünde; kamera B iken robotun ayağı hizasında olur */
      var springs = BARRIERS.map(function (b) {
        var feet = RFLOOR - b + MAXC;                       // dünya y (ayak hizası)
        var s = FO.el('img', { class: 'lv-sprite climb-spring', src: FO.A('items/item_spring.png'), alt: '', draggable: 'false' });
        s.style.width = SPW + 'px'; s.style.left = (SPX - SPW / 2) + 'px'; s.style.top = (feet - SPH) + 'px';
        s.style.opacity = '0'; s.style.transition = 'opacity .4s';
        world.append(s); return s;
      });
      springs[0].style.opacity = '1';
      L.root.append(world);
      var robot = FO.el('img', { class: 'lv-sprite walker-fixed', src: FO.A('items/item_worker_robot.png'), alt: '', draggable: 'false' });
      robot.style.width = RW + 'px'; robot.style.left = (RX - RW / 2) + 'px'; robot.style.top = (RFLOOR - RH) + 'px'; L.root.append(robot);

      var key = FO.el('button', { class: 'space-key', type: 'button', 'aria-label': 'Zıpla', hidden: true });
      key.innerHTML = '<svg viewBox="0 0 220 70" aria-hidden="true"><path d="M60 28v14h100V28" fill="none" stroke="#23304a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      L.root.append(key);

      var bar = FO.el('div', { class: 'climb-bar' }, FO.el('div', { class: 'climb-track' }), FO.el('img', { class: 'climb-robi', src: FO.A('items/robi_head.png'), alt: '', draggable: 'false' }));
      L.root.append(bar); var marker = bar.querySelector('.climb-robi');

      function cap() { return cleared < BARRIERS.length ? BARRIERS[cleared] : MAXC; }

      /* Robot yayın TAM ÜSTÜNE konar, yay ezilir, robot daha yükseğe sıçrayıp yerine döner. */
      function jump() {
        if (L.finished() || jumping) return;
        var blocked = cleared < BARRIERS.length && target >= BARRIERS[cleared] - 2;
        jumping = true; FO.audio.sfx('swoosh');
        var dx = SPX - RX, land = -(SPH * 0.62);
        var a = robot.animate([
          { transform: 'translate(0,0)' },
          { transform: 'translate(' + dx / 2 + 'px,-360px)', offset: .5 },
          { transform: 'translate(' + dx + 'px,' + land + 'px)' }
        ], { duration: 650, easing: 'ease-in-out', fill: 'forwards' });
        a.onfinish = function () {
          if (blocked) {
            var sp = springs[cleared]; cleared++;
            sp.classList.add('boing'); FO.audio.sfx('ok'); FO.audio.sfx('swoosh');
            target = Math.min(cap(), target + 420);          // yay seni yukarı fırlatır
            setTimeout(function () { sp.style.opacity = '0'; }, 900);
            key.hidden = true; blockedSaid = false; L.touch();
            L.say('match_ok_' + (cleared + 1), { pose: 'happy', after: 'idle' });
          }
          var b = robot.animate([
            { transform: 'translate(' + dx + 'px,' + land + 'px)' },
            { transform: 'translate(' + dx / 2 + 'px,-460px)', offset: .5 },
            { transform: 'translate(0,0)' }
          ], { duration: 700, easing: 'ease-in-out', fill: 'forwards' });
          b.onfinish = function () { a.cancel(); b.cancel(); jumping = false; };
        };
      }
      L.keys(function (k) { if (k === 'Space') jump(); });
      key.addEventListener('click', jump);

      L.listen(L.root, 'wheel', function (e) {
        if (L.finished()) return;
        var d = -e.deltaY * (e.deltaMode === 1 ? 32 : 1);
        var before = target;
        target = Math.max(0, Math.min(cap(), target + d * 1.4));
        if (target !== before) { L.touch(); if (Math.random() < .2) FO.audio.sfx('swoosh'); }
        if (cleared < BARRIERS.length && target >= BARRIERS[cleared] - 2 && d > 0 && !blockedSaid) {
          blockedSaid = true; key.hidden = false; FO.audio.sfx('wrong');
          L.say('lv13_block', { pose: 'think', after: 'idle' });
          L.setHint('lv13_block');
        }
      }, { passive: true });

      L.loop(function () {
        cam += (target - cam) * 0.16; if (Math.abs(target - cam) < .4) cam = target;
        world.style.transform = 'translateY(' + (cam - MAXC) + 'px)';
        if (cleared < BARRIERS.length && cam >= BARRIERS[cleared] - 560) springs[cleared].style.opacity = '1';
        marker.style.top = (740 - (cam / MAXC) * 700) + 'px';
        if (!atTop && cleared >= BARRIERS.length && cam >= MAXC - 4) { atTop = true; L.reward('robi_head', 'lv13_done'); }
      });
    }
  });
})();
