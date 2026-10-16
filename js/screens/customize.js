/* Fareni özelleştir: çocuk bir tema seçer; seçim kaydedilir ve imleç yerine kullanılır. */
(function () {
  'use strict';
  var FO = window.FO;

  var COL_X = [940, 1160, 1380, 1600];       // 4 sütun, 190 genişlik + 30 boşluk
  var ROW_Y = [210, 500];                     // 2 satır, 250 yükseklik + 40 boşluk

  FO.router.register('customize', function () {
    var preview, cards = {}, pickIdx = 0, nextBtn, picked = false;

    function paintPreview(animate) {
      var skin = FO.skins.byId(FO.state.get('skin'));
      preview.innerHTML = '';
      var im = FO.el('img', { src: FO.A(skin.file), alt: skin.label, draggable: 'false' });
      if (animate && !FO.reducedMotion()) im.classList.add('pop-in');
      preview.append(im);
      Object.keys(cards).forEach(function (id) { cards[id].classList.toggle('sel', id === skin.id); });
    }

    return {
      assets: (function () {
        var l = ['bg/bg_room.jpg', 'ui/btn_next.png', 'ui/btn_prev.png', 'ui/icon_check.png'];
        FO.skins.list.forEach(function (s) { l.push(s.file); });
        return l;
      })(),

      mount: function (root) {
        root.append(
          FO.el('img', { class: 'bg', src: FO.A('bg/bg_room.jpg'), alt: '', draggable: 'false' }),
          FO.el('div', { class: 'pedestal' }));
        preview = FO.el('div', { class: 'preview', 'aria-live': 'polite' });
        root.append(preview);

        FO.skins.list.forEach(function (skin, i) {
          var card = FO.el('button', { class: 'skin-card', type: 'button', 'aria-label': skin.label,
            style: { left: COL_X[i % 4] + 'px', top: ROW_Y[Math.floor(i / 4)] + 'px' } },
            FO.el('img', { class: 'skin', src: FO.A(skin.file), alt: '', draggable: 'false' }),
            FO.el('img', { class: 'tick', src: FO.A('ui/icon_check.png'), alt: '' }));
          card.addEventListener('click', function () {
            FO.audio.sfx('select');
            FO.state.set('skin', skin.id);
            paintPreview(true);
            pickIdx = pickIdx % 3 + 1;
            FO.mascot.say('customize_pick_' + pickIdx, { pose: 'happy', after: 'idle' });
            FO.state.markDone('customize');
            if (!picked) { picked = true; nextBtn.classList.add('pulse'); }
          });
          cards[skin.id] = card;
          root.append(card);
        });

        var prev = FO.el('button', { class: 'nav-btn prev-btn', type: 'button', 'aria-label': 'Geri' },
          FO.el('img', { src: FO.A('ui/btn_prev.png'), alt: '' }));
        prev.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('parts'); });

        nextBtn = FO.el('button', { class: 'nav-btn next-btn', type: 'button', 'aria-label': 'Devam' },
          FO.el('img', { src: FO.A('ui/btn_next.png'), alt: '' }));
        nextBtn.addEventListener('click', function () {
          FO.audio.sfx('swoosh');
          FO.state.markDone('customize');
          FO.router.go('buttons');
        });
        root.append(prev, nextBtn);
        paintPreview(false);
      },

      start: function () {
        FO.mascot.show('corner');
        FO.mascot.say('customize_intro');
      }
    };
  });
})();
