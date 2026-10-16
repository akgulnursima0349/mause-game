/* Seviye 15 – Robot ordusu: yardımcı robotu kopyala, yapıştır, fabrikayı doldur. */
(function () {
  'use strict';
  var FO = window.FO;
  FO.levels.define(15, {
    bg: 'bg_factory', assets: ['items/item_worker_robot.png'], next: 'cert', intro: 'lv15_intro', hint: 'lv15_hint',
    build: function (L) {
      FO.cpGame(L, {
        items: [{ id: 'robot', file: 'items/item_worker_robot.png', x: 420 }], size: 300, y: 640, total: 5, pasteW: 170,
        field: { x0: 880, x1: 1560, y0: 560, y1: 900 },
        copyPos: { x: 300, y: 820 }, pastePos: { x: 640, y: 820 },
        say: { hint: 'lv15_hint', copied: 'lv15_copied', pasted: 'lv15_pasted' },
        onDone: function (L) { L.done('lv15_done'); }
      });
    }
  });
})();
