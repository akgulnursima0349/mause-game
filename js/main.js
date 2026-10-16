(function () {
  'use strict';
  var FO = window.FO;

  /* Konfeti: ekrana uçuşan yıldızlar (kutlama anları). */
  FO.confetti = function (n) {
    if (FO.reducedMotion()) return;
    var host = document.getElementById('fx');
    for (var i = 0; i < (n || 16); i++) {
      (function () {
        var size = 46 + Math.random() * 56;
        var im = FO.el('img', { class: 'confetti', src: FO.A('ui/star_full.png'), alt: '' });
        im.style.width = size + 'px';
        var dx = (Math.random() - 0.5) * 1500, dy = -250 - Math.random() * 450, rot = (Math.random() - 0.5) * 540;
        host.append(im);
        var a = im.animate([
          { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1) rotate(' + rot + 'deg)', opacity: 1, offset: 0.55 },
          { transform: 'translate(' + dx * 1.1 + 'px,' + (dy + 760) + 'px) scale(.8) rotate(' + rot * 1.4 + 'deg)', opacity: 0 }
        ], { duration: 1700 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.4,1)' });
        a.onfinish = function () { im.remove(); };
      })();
    }
  };

  /* Sağ tık: tarayıcı menüsü açılmasın (oyunda sağ tıkın görevi var). Orta tuşla kaydırma imleci de kapalı. */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('mousedown', function (e) { if (e.button === 1) e.preventDefault(); });

  /* Sayfa gizlenince sesi durdur, dönünce sürdür. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) FO.audio.stopVoice();
  });

  /* Geliştirici kısayolu: ?screen=customize */
  var q = new URLSearchParams(window.location.search);
  var first = q.get('screen') || 'home';

  FO.mascot.preload().then(function () { FO.router.go(first); });
})();
