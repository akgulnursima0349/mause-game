/* Final: başarı belgesi. */
(function () {
  'use strict';
  var FO = window.FO;
  FO.router.register('cert', function () {
    return {
      assets: ['bg/bg_home.jpg', 'ui/icon_trophy.png', 'brand/logo.png', 'ui/btn_prev.png', 'items/item_gear.png', 'ui/star_full.png'],
      mount: function (root) {
        root.append(FO.el('img', { class: 'bg', src: FO.A('bg/bg_home.jpg'), alt: '', draggable: 'false' }));
        var d = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        var card = FO.el('div', { class: 'cert-card' },
          FO.el('img', { class: 'cert-logo', src: FO.A('brand/logo.png'), alt: 'Sivas Robotik Akademi', draggable: 'false' }),
          FO.el('div', { class: 'cert-title' }, 'BAŞARI BELGESİ'),
          FO.el('div', { class: 'cert-sub' }, 'Fare Ustası'),
          FO.el('p', { class: 'cert-text' }, 'Bilgisayarın parçalarını ve fareyi öğrendin, Robi’nin kayıp parçalarını bularak onu uyandırdın!'),
          FO.el('img', { class: 'cert-trophy', src: FO.A('ui/icon_trophy.png'), alt: '', draggable: 'false' }),
          FO.el('div', { class: 'cert-foot' }, FO.el('span', null, d), FO.el('span', null, 'Sivas Robotik Akademi')));
        root.append(FO.el('div', { class: 'cert-rays', 'aria-hidden': 'true' }));
        root.append(card);
        card.classList.add('cert-enter');

        var prev = FO.el('button', { class: 'nav-btn prev-btn', type: 'button', 'aria-label': 'Harita' },
          FO.el('img', { src: FO.A('ui/btn_prev.png'), alt: '' }));
        prev.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('map'); });
        root.append(prev);
      },
      start: function () {
        FO.mascot.show('corner');
        var wait = function (ms, fn) { setTimeout(function () { if (FO.router.current() === 'cert') fn(); }, ms); };
        FO.audio.sfx('swoosh'); wait(650, function () { FO.audio.sfx('win'); FO.confetti(30); });
        wait(1800, function () { FO.audio.sfx('star'); FO.confetti(20); if (FO.fx) FO.fx.burst(960, 760, 16, 220); });
        wait(3400, function () { FO.confetti(16); });
        FO.mascot.say('cert_intro', { pose: 'cheer', after: 'idle' });
      }
    };
  });
})();
