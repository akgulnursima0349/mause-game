/* Her ekranda duran küçük düğmeler: ses aç/kapa (sağ üst) ve ana ekrana dön (sol üst). */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var root = document.getElementById('hud');

  var soundBtn = FO.el('button', { class: 'hud-btn hud-sound', 'aria-label': 'Sesi aç veya kapat', type: 'button' },
    FO.el('img', { alt: '', draggable: 'false' }));
  var homeBtn = FO.el('button', { class: 'hud-btn hud-home', 'aria-label': 'Ana ekrana dön', type: 'button' },
    FO.el('img', { alt: '', src: FO.A('ui/btn_home.png'), draggable: 'false' }));
  root.append(homeBtn, soundBtn);

  function paintSound() {
    var on = !FO.state.get('muted');
    soundBtn.firstChild.src = FO.A(on ? 'ui/btn_sound_on.png' : 'ui/btn_sound_off.png');
  }
  soundBtn.addEventListener('click', function () {
    var on = !!FO.state.get('muted');            // şimdi açılıyorsa
    FO.state.set('muted', !on);
    if (on) FO.audio.sfx('select');
  });
  homeBtn.addEventListener('click', function () { FO.audio.sfx('click'); FO.router.go('home'); });
  FO.state.onChange(function (k) { if (k === 'muted') paintSound(); });
  paintSound();

  FO.hud = {
    showHome: function (on) { homeBtn.hidden = !on; }
  };
})();
