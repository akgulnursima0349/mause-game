(function () {
  'use strict';
  var FO = window.FO;

  FO.router.register('home', function () {
    var holdTimer = null;

    return {
      assets: ['bg/bg_home.jpg', 'brand/logo.png', 'ui/btn_start.png', 'ui/btn_sound_on.png', 'ui/btn_sound_off.png', 'ui/btn_home.png'],

      mount: function (root) {
        var logo = FO.el('div', { class: 'logo-badge', role: 'img', 'aria-label': 'Sivas Robotik Akademi' },
          FO.el('img', { src: FO.A('brand/logo.png'), alt: '', draggable: 'false' }));
        /* Öğretmen ayarı: logoya 1,5 sn basılı tut */
        logo.addEventListener('pointerdown', function () { holdTimer = setTimeout(function () { FO.settings.open(); }, 1500); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
          logo.addEventListener(ev, function () { clearTimeout(holdTimer); });
        });

        var title = FO.el('h1', { class: 'home-title' }, 'Bilgisayar Elemanlarını', FO.el('br'), 'Öğreniyorum');

        var start = FO.el('button', { class: 'start-btn', type: 'button', 'aria-label': 'Başla' },
          FO.el('img', { src: FO.A('ui/btn_start.png'), alt: '' }));
        start.addEventListener('click', function () {
          FO.audio.unlock();
          FO.audio.sfx('swoosh');
          /* Kaldığı yerden devam: öğrenilen giriş ekranlarını tekrar yaptırma. */
          var S = FO.state;
          FO.router.go(S.isDone('buttons') || S.get('unlockAll') ? 'map' : S.isDone('customize') ? 'buttons' : S.isDone('parts') ? 'customize' : 'parts');
        });

        root.append(
          FO.el('img', { class: 'bg', src: FO.A('bg/bg_home.jpg'), alt: '', draggable: 'false' }),
          logo, title, start);
      },

      start: function () {
        FO.mascot.show('home');
        FO.mascot.pose('wave');
        FO.mascot.setLast('home_welcome');
        /* Tarayıcı sesi ilk tıklamaya kadar engeller; ses açıksa (başka ekrandan dönüldüyse) Robi selam verir. */
        if (FO.audio.isUnlocked()) FO.mascot.say('home_welcome', { pose: 'wave', after: 'idle' });
      },

      unmount: function () { clearTimeout(holdTimer); }
    };
  });
})();
