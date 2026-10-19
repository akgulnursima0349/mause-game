/* Her ekranda duran küçük düğmeler: ses aç/kapa (sağ üst) ve ana ekrana dön (sol üst). */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var root = document.getElementById('hud');

  var soundBtn = FO.el('button', { class: 'hud-btn hud-sound', 'aria-label': 'Sesi aç veya kapat', type: 'button' },
    FO.el('img', { alt: '', draggable: 'false' }));
  var homeBtn = FO.el('button', { class: 'hud-btn hud-home', 'aria-label': 'Ana ekrana dön', type: 'button' },
    FO.el('img', { alt: '', src: FO.A('ui/btn_home.png'), draggable: 'false' }));
  var fsBtn = FO.el('button', { class: 'hud-btn hud-full', 'aria-label': 'Tam ekran', type: 'button' });
  fsBtn.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 26V14h12M38 14h12v12M50 38v12H38M26 50H14V38" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var canFs = !!(document.documentElement.requestFullscreen);
  fsBtn.hidden = !canFs;
  fsBtn.addEventListener('click', function () {
    FO.audio.sfx('click');
    if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(function () {});
  });
  root.append(homeBtn, fsBtn, soundBtn);

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
