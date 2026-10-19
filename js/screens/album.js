/* Çıkartma albümü: bitirilen her seviye bir çıkartma verir. Kazanımlar ilerlemeden türetilir (ayrı veri yok). */
(function () {
  'use strict';
  var FO = window.FO;
  var NAMES = ['Yıldız', 'Balon', 'Hediye', 'Elma', 'Top', 'Bulut', 'İnek', 'Robi', 'Bayrak', 'Tahta', 'Taş', 'Anahtar', 'Fener', 'Gövde', 'Robot'];

  FO.router.register('album', function () {
    return {
      assets: ['bg/bg_map.jpg', 'ui/btn_prev.png', 'ui/star_full.png'].concat(FO.levels.meta.map(function (m) { return m.icon; })),
      mount: function (root) {
        root.append(FO.el('img', { class: 'bg', src: FO.A('bg/bg_map.jpg'), alt: '', draggable: 'false' }));
        var earned = 0, p = FO.profiles.current(), seen = (p && p.seen) || 0;
        root.append(FO.el('div', { class: 'album-title' }, 'Çıkartma Albümüm'));
        var grid = FO.el('div', { class: 'album-grid' });
        FO.levels.meta.forEach(function (m, i) {
          var got = FO.state.isDone('level' + m.n); if (got) earned++;
          var isNew = got && earned > seen;
          var card = FO.el('div', { class: 'sticker ' + (got ? 'got' : 'empty') + (isNew ? ' new' : '') },
            FO.el('img', { src: FO.A(m.icon), alt: '', draggable: 'false' }),
            FO.el('span', {}, got ? NAMES[i] : '?'));
          card.style.setProperty('--tilt', ((i % 3) - 1) * 2.2 + 'deg');
          card.style.animationDelay = (i * 60) + 'ms';
          grid.append(card);
        });
        root.append(grid);
        root.append(FO.el('div', { class: 'album-count' }, FO.el('img', { src: FO.A('ui/star_full.png'), alt: '' }), earned + ' / ' + FO.levels.meta.length));
        this._earned = earned; this._hasNew = earned > seen;
        if (p && earned !== seen) FO.profiles.update(p.id, { seen: earned });
        var prev = FO.el('button', { class: 'nav-btn prev-btn', type: 'button', 'aria-label': 'Geri' }, FO.el('img', { src: FO.A('ui/btn_prev.png'), alt: '' }));
        prev.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('map'); });
        root.append(prev);
      },
      start: function () {
        FO.mascot.show('corner');
        if (this._hasNew && FO.fx) { FO.audio.sfx('win'); FO.confetti(14); }
        FO.mascot.say(this._hasNew ? 'album_new' : 'album_intro');
      },
      unmount: function () {}
    };
  });
})();
