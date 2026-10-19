/* "Kim oynuyor?" – çocuk kendi resmini bulup tıklar. Profilleri öğretmen ekler. */
(function () {
  'use strict';
  var FO = window.FO;

  FO.avatars = ['items/item_cow.png', 'items/item_sheep.png', 'items/item_chicken.png', 'items/item_apple.png',
    'items/item_banana.png', 'items/item_strawberry.png', 'items/item_grapes.png', 'items/item_star.png',
    'items/item_balloon_red.png', 'items/item_ball_blue.png', 'items/item_gift_closed.png', 'items/item_cloud.png',
    'items/item_worker_robot.png', 'items/robi_head.png', 'items/item_crystal.png', 'items/item_flag.png'];

  /* Kaldığı yerden devam: giriş ekranlarını bir kez yaptıran akış. */
  FO.resumeTarget = function () {
    var S = FO.state;
    return S.isDone('buttons') || S.get('unlockAll') ? 'map' : S.isDone('customize') ? 'buttons' : S.isDone('parts') ? 'customize' : 'parts';
  };
  /* Başla düğmesi: tek profil varsa doğrudan oyuna, birden fazlaysa "Kim oynuyor?" */
  FO.startTarget = function () {
    var n = FO.profiles.list().length;
    if (n === 0) { FO.profiles.ensureCurrent(); return FO.resumeTarget(); }
    if (n === 1) { FO.profiles.ensureCurrent(); return FO.resumeTarget(); }
    return FO.profiles.current() ? FO.resumeTarget() : 'profiles';
  };

  var PER = 10, DX = 340;

  FO.router.register('profiles', function () {
    var page = 0, layer, alive = true;
    function list() { return FO.profiles.list().sort(function (a, b) { return a.name.localeCompare(b.name, 'tr'); }); }

    function paint(root) {
      if (layer) layer.remove();
      layer = FO.el('div', { class: 'prof-layer' });
      var all = list(), pages = Math.max(1, Math.ceil(all.length / PER));
      page = Math.min(page, pages - 1);
      var shown = all.slice(page * PER, page * PER + PER), rows = Math.ceil(shown.length / 5), Y = rows > 1 ? [180, 560] : [370];
      shown.forEach(function (p, i) {
        var r = Math.floor(i / 5), inRow = Math.min(5, shown.length - r * 5), x0 = (1920 - (inRow * 300 + (inRow - 1) * 40)) / 2;
        var card = FO.el('button', { class: 'prof-card', type: 'button', 'aria-label': p.name,
          style: { left: (x0 + (i % 5) * DX) + 'px', top: Y[r] + 'px' } },
          FO.el('img', { src: FO.A(p.avatar), alt: '', draggable: 'false' }),
          FO.el('span', null, p.name));
        card.addEventListener('click', function () {
          FO.audio.unlock(); FO.audio.sfx('select'); FO.flash(card, 'bump', 400);
          FO.profiles.setCurrent(p.id);
          FO.mascot.say('profile_hi', { pose: 'wave', after: 'idle' });
          setTimeout(function () { if (alive) FO.router.go(FO.resumeTarget()); }, 900);
        });
        layer.append(card);
      });
      if (pages > 1) {
        [['left', -1, 'ui/btn_prev.png', 640], ['right', 1, 'ui/btn_next.png', 1150]].forEach(function (d) {
          var b = FO.el('button', { class: 'arrow-btn', type: 'button', style: { left: d[3] + 'px', top: '905px' }, 'aria-label': d[0] === 'left' ? 'Önceki' : 'Sonraki' },
            FO.el('img', { src: FO.A(d[2]), alt: '', draggable: 'false' }));
          b.addEventListener('click', function () { FO.audio.sfx('click'); page = (page + d[1] + pages) % pages; paint(root); });
          layer.append(b);
        });
      }
      root.append(layer);
    }

    return {
      assets: ['bg/bg_room.jpg', 'ui/btn_prev.png', 'ui/btn_next.png'].concat(FO.avatars),
      mount: function (root) {
        root.append(FO.el('img', { class: 'bg', src: FO.A('bg/bg_room.jpg'), alt: '', draggable: 'false' }));
        paint(root);
        var prev = FO.el('button', { class: 'nav-btn prev-btn', type: 'button', 'aria-label': 'Geri' },
          FO.el('img', { src: FO.A('ui/btn_prev.png'), alt: '' }));
        prev.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('home'); });
        root.append(prev);
      },
      start: function () { FO.mascot.show('corner'); FO.mascot.say('profile_intro'); },
      unmount: function () { alive = false; }
    };
  });
})();
