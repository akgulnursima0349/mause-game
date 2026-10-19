/* Öğretmen paneli. Açmak için: ana ekrandaki logoya 1,5 sn basılı tut veya Ctrl+Shift+S.
 * Çocuklara yönelik değil, bu yüzden yazılı. */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var root = document.getElementById('settings');
  var built = false;

  function row(label, control) {
    return FO.el('label', { class: 'set-row' }, FO.el('span', null, label), control);
  }
  function toggle(key) {
    var cb = FO.el('input', { type: 'checkbox' });
    cb.checked = !!FO.state.get(key);
    cb.addEventListener('change', function () { FO.state.set(key, cb.checked); });
    return cb;
  }

  function build() {
    if (built) return; built = true;
    var vol = FO.el('input', { type: 'range', min: '0', max: '1', step: '0.05' });
    vol.value = FO.state.get('volume');
    vol.addEventListener('input', function () { FO.state.set('volume', parseFloat(vol.value)); });

    var close = FO.el('button', { type: 'button', class: 'set-btn' }, 'Kapat');
    close.addEventListener('click', function () { S.close(); });

    var box = FO.el('div', { class: 'set-box', role: 'dialog', 'aria-label': 'Öğretmen ayarları' },
      FO.el('h2', null, 'Öğretmen ayarları'),
      row('Ses seviyesi', vol),
      row('Arka plan müziği', toggle('musicOn')),
      row('Altyazı (Robi ne diyorsa yazsın)', toggle('subtitles')),
      row('Ses dosyası yoksa tarayıcının Türkçe sesini kullan', toggle('ttsFallback')),
      row('İmleç yerine seçilen fareyi göster', toggle('skinCursor')),
      row('Tüm seviyeleri aç (seçili çocuk için kilitler kalkar)', toggle('unlockAll')),
      row('Hafif görünüm (eski/yavaş bilgisayarlar için)', toggle('lowPerf')),
      FO.el('div', { class: 'set-actions' }, close));
    root.append(box);
    root.addEventListener('pointerdown', function (e) { if (e.target === root) S.close(); });
  }

  var S = {
    open: function () { build(); root.hidden = false; document.body.classList.remove('skin-cursor'); },
    close: function () { root.hidden = true; FO.cursor && FO.cursor.refresh(); },
    isOpen: function () { return !root.hidden; }
  };
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) { e.preventDefault(); if (S.isOpen()) S.close(); else FO.router.go('teacher'); }
    if (e.key === 'Escape' && S.isOpen()) S.close();
  });
  FO.settings = S;
})();
