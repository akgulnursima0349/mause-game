/* Seviye 8 – Robi'nin kazası (hikaye girişi): 3 ışığa tıkla, parçaların yolunu göster. */
(function () {
  'use strict';
  var FO = window.FO;
  var POS = [[430, 600], [960, 470], [1430, 620]];
  var PARTS = ['robi_head', 'robi_body', 'robi_arm', 'robi_leg', 'robi_antenna'];

  FO.levels.define(8, {
    bg: 'bg_forest', assets: ['items/item_beacon.png'].concat(PARTS.map(function (p) { return 'items/' + p + '.png'; })),
    intro: 'lv8_intro', hint: 'lv8_hint', hintMs: 12000,
    build: function (L) {
      var prog = L.progress(3), lit = 0;
      POS.forEach(function (p, i) {
        var b = FO.el('button', { class: 'beacon', type: 'button', 'aria-label': 'Işık',
          style: { left: (p[0] - 120) + 'px', top: (p[1] - 120) + 'px', width: '240px', height: '240px' } },
          FO.el('img', { src: FO.A('items/item_beacon.png'), alt: '', draggable: 'false' }));
        b.addEventListener('pointerdown', function (e) {
          if (e.button !== 0 || b._lit || L.finished()) return;
          e.preventDefault();
          b._lit = true; b.classList.add('lit');
          FO.audio.sfx('star'); FO.flash(b, 'bump', 500);
          lit++;
          if (prog.inc()) finale(); else L.say('match_ok_' + (lit % 3 + 1), { pose: 'happy', after: 'idle' });
        });
        L.root.append(b);
      });

      function finale() {
        /* parçalar gökyüzünde parlayıp dağılır: hikâyenin özeti */
        PARTS.forEach(function (f, i) {
          var s = L.sprite('items/' + f + '.png', { x: 560 + i * 200, y: 230, w: 130, h: 130, cls: 'part-float' });
          s.style.animationDelay = (i * 0.2) + 's';
        });
        L.done('lv8_done');
      }
    }
  });
})();
