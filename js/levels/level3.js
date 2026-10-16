/* Seviye 3 – Hediyeyi aç: çift tık. Tek tıkta Robi ipucu verir. */
(function () {
  'use strict';
  var FO = window.FO, TOTAL = 3, GAP = 650;
  var XS = [420, 860, 1300];

  FO.levels.define(3, {
    bg: 'bg_room', assets: ['items/item_gift_closed.png', 'items/item_gift_open.png', 'items/item_star.png'], intro: 'lv3_intro', hint: 'lv3_hint', hintMs: 12000,
    build: function (L) {
      var prog = L.progress(TOTAL), singles = 0;
      XS.forEach(function (cx, i) {
        var box = FO.el('button', { class: 'gift', type: 'button', 'aria-label': 'Hediye',
          style: { left: (cx - 150) + 'px', top: '470px', width: '300px', height: '340px' } },
          FO.el('img', { src: FO.A('items/item_gift_closed.png'), alt: '', draggable: 'false' }));
        var last = 0, opened = false, lx = 0, ly = 0;
        box.addEventListener('pointerdown', function (e) {
          if (opened || e.button !== 0) return;
          e.preventDefault();
          var now = performance.now();
          if (now - last < GAP) {
            opened = true; last = 0;
            box.querySelector('img').src = FO.A('items/item_gift_open.png');
            FO.audio.sfx('win'); FO.flash(box, 'bump', 500);
            var star = L.sprite('items/item_star.png', { x: cx, y: 520, w: 130, cls: 'gift-star' });
            setTimeout(function () { star.remove(); FO.audio.sfx('star'); }, 900);
            if (prog.inc()) L.done();
          } else {
            last = now;
            FO.audio.sfx('click'); FO.flash(box, 'bump', 400);
            singles++;
            if (singles === 2 || (singles > 2 && singles % 4 === 0)) L.say('lv3_single', { pose: 'think', after: 'idle' });
          }
        });
        L.root.append(box);
      });
    }
  });
})();
