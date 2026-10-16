/* Seviye 4 – Meyve sepeti: sürükle-bırak. */
(function () {
  'use strict';
  var FO = window.FO;
  var FRUITS = ['apple', 'banana', 'strawberry', 'grapes', 'apple', 'banana'];
  var BASKET = { x: 1180, y: 640, w: 420 };            // merkez
  var ITEM = 170;

  FO.levels.define(4, {
    bg: 'bg_farm',
    assets: ['items/item_basket.png'].concat(['apple', 'banana', 'strawberry', 'grapes'].map(function (f) { return 'items/item_' + f + '.png'; })),
    intro: 'lv4_intro', hint: 'lv4_hint',
    build: function (L) {
      var prog = L.progress(FRUITS.length), dragging = null;
      L.sprite('items/item_basket.png', { x: BASKET.x, y: BASKET.y, w: BASKET.w, h: BASKET.w, cls: 'basket' });

      var xs = [200, 400, 600, 800, 330, 700];
      var ys = [330, 330, 330, 330, 720, 720];
      FRUITS.forEach(function (f, i) {
        var hx = xs[i] - ITEM / 2, hy = ys[i] - ITEM / 2;
        var it = FO.el('div', { class: 'drag fruit', style: { left: hx + 'px', top: hy + 'px', width: ITEM + 'px', height: ITEM + 'px' } },
          FO.el('img', { src: FO.A('items/item_' + f + '.png'), alt: '', draggable: 'false' }));
        it._x = hx; it._y = hy; it._home = { x: hx, y: hy }; it._done = false;
        it.addEventListener('pointerdown', function (e) {
          if (it._done || dragging || e.button !== 0) return;
          e.preventDefault();
          try { it.setPointerCapture(e.pointerId); } catch (err) {}
          var p = FO.stage.toStage(e.clientX, e.clientY);
          dragging = { it: it, dx: p.x - it._x, dy: p.y - it._y };
          it.classList.remove('ret'); it.classList.add('dragging');
          FO.audio.sfx('click');
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
          var cx = it._x + ITEM / 2, cy = it._y + ITEM / 2;
          if (Math.hypot(cx - BASKET.x, cy - BASKET.y + 30) < 190) {
            it._done = true; it.classList.add('snap');
            it._x = BASKET.x - ITEM / 2 + (Math.random() - .5) * 80; it._y = BASKET.y - ITEM / 2 - 10 + (Math.random() - .5) * 40;
            it.style.left = it._x + 'px'; it.style.top = it._y + 'px';
            it.style.zIndex = 8;
            FO.audio.sfx('drop'); setTimeout(function () { FO.audio.sfx('ok'); }, 140);
            if (prog.inc()) L.done();
          } else {
            it.classList.add('ret'); it._x = it._home.x; it._y = it._home.y;
            it.style.left = it._x + 'px'; it.style.top = it._y + 'px';
            FO.audio.sfx('drop');
            if (Math.hypot(cx - it._home.x, cy - it._home.y) > 260) L.say('lv4_wrong', { pose: 'think', after: 'idle' });
          }
        }
        it.addEventListener('pointerup', end); it.addEventListener('pointercancel', end);
        L.root.append(it);
      });
    }
  });
})();
