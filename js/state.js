(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var KEY = 'fareyi-ogreniyorum:v1';

  var defaults = {
    skin: 'mouse_base',   // seçilen fare teması
    musicOn: true,
    muted: false,         // sağ üstteki hoparlör düğmesi: her şeyi sessize alır
    volume: 0.7,          // 0..1
    subtitles: false,     // öğretmen için altyazı
    ttsFallback: true,    // ses dosyası yokken tarayıcının Türkçe sesi
    skinCursor: true,     // imleç yerine seçilen fareyi göster
    unlockAll: false,     // öğretmen: tüm seviyeleri aç
    childName: '',        // sertifikadaki isim (öğretmen yazar)
    progress: {}          // tamamlanan adımlar
  };

  var data = JSON.parse(JSON.stringify(defaults));
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var p = JSON.parse(raw);
      Object.keys(defaults).forEach(function (k) { if (p[k] !== undefined) data[k] = p[k]; });
    }
  } catch (e) { /* localStorage kapalı olabilir; oyun yine çalışır */ }

  var listeners = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  function emit(k, v) { listeners.forEach(function (fn) { try { fn(k, v); } catch (e) { console.error(e); } }); }

  FO.state = {
    get: function (k) { return data[k]; },
    set: function (k, v) { data[k] = v; save(); emit(k, v); },
    markDone: function (step) { data.progress[step] = true; save(); emit('progress', step); },
    isDone: function (step) { return !!data.progress[step]; },
    resetProgress: function () { data.progress = {}; save(); emit('progress', null); },
    onChange: function (fn) { listeners.push(fn); }
  };
})();
