/* Seviye 6 – Dağa tırman: fare tekerleği ile yukarı kaydır, bulutların üstündeki hazineye ulaş. */
(function () {
  'use strict';
  var FO = window.FO;
  var WORLD = 3600, MAXC = WORLD - 1080;                 // kamera 0..MAXC (0 = en alt)

  FO.levels.define(6, {
    bg: null, assets: ['bg/bg_clouds.jpg', 'items/item_cloud.png', 'items/item_chest.png', 'items/robi_head.png', 'items/item_gift_open.png'], intro: 'lv6_intro', hint: 'lv6_hint', hintMs: 9000,
    build: function (L) {
      var cam = 0, target = 0, raf = 0, downSpins = 0, atTop = false;
      var world = FO.el('div', { class: 'climb-world', style: { height: WORLD + 'px' } });
      world.append(FO.el('div', { class: 'climb-sky' }));
      var ground = FO.el('img', { class: 'climb-ground', src: FO.A('bg/bg_clouds.jpg'), alt: '', draggable: 'false' });
      world.append(ground);
      /* bulutlar: aşağıdan yukarıya dağılmış */
      for (var i = 0; i < 16; i++) {
        var y = 700 + i * (WORLD - 1100) / 16 + Math.random() * 60;
        var x = (i % 2 ? 1250 : 330) + (Math.random() - .5) * 400;
        var w = 260 + Math.random() * 160;
        var c = FO.el('img', { class: 'lv-sprite climb-cloud', src: FO.A('items/item_cloud.png'), alt: '', draggable: 'false' });
        c.style.width = w + 'px'; c.style.left = (x - w / 2) + 'px'; c.style.top = (WORLD - y) + 'px';
        c.style.opacity = '.95';
        world.append(c);
      }
      var chest = FO.el('button', { class: 'climb-chest', type: 'button', 'aria-label': 'Hazine sandığı', style: { left: '810px', top: '120px' } },
        FO.el('img', { src: FO.A('items/item_chest.png'), alt: '', draggable: 'false' }));
      world.append(chest);
      L.root.append(world);

      /* sağ kenarda ilerleme şeridi */
      var bar = FO.el('div', { class: 'climb-bar' }, FO.el('div', { class: 'climb-track' }),
        FO.el('img', { class: 'climb-robi', src: FO.A('items/robi_head.png'), alt: '', draggable: 'false' }));
      L.root.append(bar);
      var robi = bar.querySelector('.climb-robi');

      function render() {
        raf = 0;
        cam += (target - cam) * 0.18;
        if (Math.abs(target - cam) < 0.5) cam = target;
        world.style.transform = 'translateY(' + (cam - MAXC) + 'px)';
        robi.style.top = (740 - (cam / MAXC) * 700) + 'px';
        if (cam !== target) raf = requestAnimationFrame(render);
      }
      function kick() { if (!raf) raf = requestAnimationFrame(render); }
      render();

      var lastTick = 0;
      L.root.addEventListener('wheel', function (e) {
        if (L.finished()) return;
        var d = -e.deltaY;
        if (e.deltaMode === 1) d *= 32;
        if (d > 0) { downSpins = 0; } else if (d < 0 && target <= 0) {
          downSpins++;
          if (downSpins === 3) L.say('lv6_hint', { pose: 'think', after: 'idle' });
        }
        var before = target;
        target = Math.max(0, Math.min(MAXC, target + d * 1.4));
        if (target !== before) {
          L.touch();
          var now = performance.now();
          if (now - lastTick > 140) { FO.audio.sfx('swoosh'); lastTick = now; }
        }
        kick();
        if (!atTop && target >= MAXC - 5) {
          atTop = true;
          chest.classList.add('ready');
          FO.audio.sfx('star');
          L.say('lv6_top', { pose: 'happy', after: 'idle' });
        }
      }, { passive: true });

      chest.addEventListener('click', function () {
        if (!atTop || L.finished()) { FO.audio.sfx('click'); return; }
        FO.audio.sfx('win'); FO.flash(chest, 'bump', 500);
        chest.querySelector('img').src = FO.A('items/item_gift_open.png');
        L.done();
      });
    }
  });
})();
