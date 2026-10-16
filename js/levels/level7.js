/* Seviye 7 – Kopyala / yapıştır: hayvana tıkla → Kopyala → Yapıştır. */
(function () {
  'use strict';
  var FO = window.FO;
  var ANIMALS = [
    { id: 'cow', file: 'items/item_cow.png', x: 270 },
    { id: 'sheep', file: 'items/item_sheep.png', x: 520 },
    { id: 'chicken', file: 'items/item_chicken.png', x: 770 }
  ];
  FO.levels.define(7, {
    bg: 'bg_farm', assets: ANIMALS.map(function (a) { return a.file; }), intro: 'lv7_intro', hint: 'lv7_hint',
    build: function (L) {
      FO.cpGame(L, {
        items: ANIMALS, size: 230, y: 535, total: 3, pasteW: 190,
        field: { x0: 980, x1: 1540, y0: 380, y1: 760 },
        copyPos: { x: 480, y: 700 }, pastePos: { x: 1170, y: 810 },
        say: { hint: 'lv7_hint', copied: 'lv7_copied', pasted: 'lv7_pasted' },
        onDone: function (L) { L.done(); }
      });
    }
  });
})();
