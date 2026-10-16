/* Seviye 11 – Gizli mağara: taşlara çift tıkla, altından hazine çıkar. Son taşın altında Robi'nin anteni var. */
(function () {
  'use strict';
  var FO = window.FO;
  var STONES = [{ x: 470, y: 700, w: 300 }, { x: 960, y: 760, w: 340 }, { x: 1400, y: 690, w: 300 }];

  FO.levels.define(11, {
    bg: 'bg_cave', assets: ['items/item_stone.png', 'items/item_crystal.png', 'items/robi_antenna.png'], intro: 'lv11_intro', hint: 'lv11_hint', hintMs: 12000,
    build: function (L) {
      var prog = L.progress(3), singles = 0, opened = 0;
      STONES.forEach(function (s) {
        var h = s.w * 435 / 512;
        var st = FO.el('button', { class: 'stone', type: 'button', 'aria-label': 'Taş',
          style: { left: (s.x - s.w / 2) + 'px', top: (s.y - h / 2) + 'px', width: s.w + 'px', height: h + 'px' } },
          FO.el('img', { src: FO.A('items/item_stone.png'), alt: '', draggable: 'false' }));
        var isDbl = L.dbl(650), open = false;
        st.addEventListener('pointerdown', function (e) {
          if (open || e.button !== 0 || L.finished()) return;
          e.preventDefault();
          if (!isDbl()) {
            FO.audio.sfx('click'); FO.flash(st, 'bump', 400); singles++;
            if (singles === 2 || (singles > 2 && singles % 4 === 0)) L.say('lv3_single', { pose: 'think', after: 'idle' });
            return;
          }
          open = true; opened++;
          var last = opened === STONES.length;
          var under = L.sprite(last ? 'items/robi_antenna.png' : 'items/item_crystal.png', { x: s.x, y: s.y, w: 150, h: 190, cls: 'under pop-in' });
          FO.audio.sfx('drop'); st.classList.add('roll');
          setTimeout(function () { FO.audio.sfx('star'); }, 250);
          prog.inc();
          if (last) setTimeout(function () { if (L.alive()) { under.remove(); L.reward('robi_antenna', 'lv11_done'); } }, 800);
          else L.say('match_ok_' + (opened + 1), { pose: 'happy', after: 'idle' });
        });
        L.root.append(st);
      });
    }
  });
})();
