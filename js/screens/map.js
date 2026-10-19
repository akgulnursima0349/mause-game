/* Seviye haritası: 15 düğüm yılan gibi bir yol üzerinde. */
(function () {
  'use strict';
  var FO = window.FO;

  var POS = [
    [260, 440], [560, 440], [860, 440], [1160, 440], [1460, 440],
    [1460, 650], [1160, 650], [860, 650], [560, 650], [260, 650],
    [260, 860], [520, 860], [780, 860], [1040, 860], [1300, 860]
  ];
  var NODE = 132;

  FO.router.register('map', function () {
    var alive = true;
    return {
      assets: (function () {
        var l = ['bg/bg_map.jpg', 'ui/node_open.png', 'ui/node_done.png', 'ui/icon_lock.png', 'ui/star_full.png', 'ui/btn_prev.png', 'ui/icon_trophy.png'].concat(FO.skins.list.map(function (k) { return k.file; })).concat([9, 10, 11, 12, 13].map(function (lv) { return 'items/' + FO.levels.parts[lv] + '.png'; }));
        FO.levels.meta.forEach(function (m) { l.push(m.icon); });
        return l;
      })(),

      mount: function (root) {
        root.append(FO.el('img', { class: 'bg', src: FO.A('bg/bg_map.jpg'), alt: '', draggable: 'false' }));

        /* kesikli yol */
        var pts = POS.map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
        root.insertAdjacentHTML('beforeend',
          '<svg class="map-path" viewBox="0 0 1920 1080" aria-hidden="true">' +
          '<polyline points="' + pts + '" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 30"/></svg>');

        var tray = FO.el('div', { class: 'parts-tray map-tray', 'aria-hidden': 'true' });
        [9, 10, 11, 12, 13].forEach(function (lv) {
          tray.append(FO.el('img', { class: FO.state.isDone('level' + lv) ? 'got' : '', src: FO.A('items/' + FO.levels.parts[lv] + '.png'), alt: '', draggable: 'false' }));
        });
        root.append(tray);
        var firstOpen = 0;
        FO.levels.meta.forEach(function (m, i) {
          var n = m.n, open = FO.levels.isOpen(n), done = FO.state.isDone('level' + n);
          if (open && !done && !firstOpen) firstOpen = n;
          var node = FO.el('button', { class: 'map-node ' + (done ? 'done' : open ? 'open' : 'locked'), type: 'button',
            'aria-label': 'Seviye ' + n, style: { left: (POS[i][0] - NODE / 2) + 'px', top: (POS[i][1] - NODE / 2) + 'px', width: NODE + 'px', height: NODE + 'px' } },
            FO.el('img', { class: 'nd', src: FO.A(done ? 'ui/node_done.png' : 'ui/node_open.png'), alt: '', draggable: 'false' }),
            FO.el('img', { class: 'ic', src: FO.A(m.icon), alt: '', draggable: 'false' }),
            FO.el('span', { class: 'num' }, String(n)));
          if (!open) node.append(FO.el('img', { class: 'lock', src: FO.A('ui/icon_lock.png'), alt: '', draggable: 'false' }));
          if (done) node.append(FO.el('img', { class: 'badge', src: FO.A('ui/star_full.png'), alt: '', draggable: 'false' }));
          node.addEventListener('click', function () {
            if (!open) { FO.audio.sfx('wrong'); FO.flash(node, 'shake', 400); FO.mascot.say('map_locked', { pose: 'think', after: 'idle' }); return; }
            if (!FO.levels.has(n)) { FO.audio.sfx('pop'); FO.flash(node, 'bump', 500); FO.mascot.say('soon', { pose: 'think', after: 'idle' }); return; }
            FO.audio.sfx('swoosh');
            FO.router.go('level' + n);
          });
          root.append(node);
        });
        root._firstOpen = firstOpen;
        root.querySelectorAll('.map-node.open').forEach(function (n) {
          if (Number(n.getAttribute('aria-label').split(' ')[1]) === firstOpen) n.classList.add('next');
        });

        if (FO.levels.allDone() || FO.state.get('unlockAll')) {
          var tr = FO.el('button', { class: 'trophy-btn pulse', type: 'button', 'aria-label': 'Başarı belgesi' },
            FO.el('img', { src: FO.A('ui/icon_trophy.png'), alt: '', draggable: 'false' }));
          tr.addEventListener('click', function () { FO.audio.sfx('swoosh'); FO.router.go('cert'); });
          root.append(tr);
        }
        var cp = FO.profiles.current(), got = 0;
        FO.levels.meta.forEach(function (m) { if (FO.state.isDone('level' + m.n)) got++; });
        var al = FO.el('button', { class: 'album-btn' + (cp && got > (cp.seen || 0) ? ' has-new' : ''), type: 'button', 'aria-label': 'Çıkartma albümü' },
          FO.el('img', { src: FO.A('ui/star_full.png'), alt: '', draggable: 'false' }), FO.el('span', {}, 'Albüm'));
        al.addEventListener('click', function () { FO.audio.sfx('swoosh'); FO.router.go('album'); });
        root.append(al);
        var sk = FO.skins.byId(FO.state.get('skin'));
        var my = FO.el('button', { class: 'album-btn mouse-btn', type: 'button', 'aria-label': 'Farem' },
          FO.el('img', { src: FO.A(sk.file), alt: '', draggable: 'false' }), FO.el('span', {}, 'Farem'));
        my.addEventListener('click', function () { FO.audio.sfx('swoosh'); FO.router.go('customize', { from: 'map' }); });
        root.append(my);
        var prev = FO.el('button', { class: 'nav-btn prev-btn', type: 'button', 'aria-label': 'Geri' },
          FO.el('img', { src: FO.A('ui/btn_prev.png'), alt: '' }));
        prev.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('buttons'); });
        root.append(prev);
        this._root = root;
      },

      start: function () {
        FO.mascot.show('corner');
        FO.mascot.say(FO.state.isDone('level1') ? 'map_next' : 'map_intro');
      },
      unmount: function () { alive = false; }
    };
  });
})();
