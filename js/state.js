/* Oyun durumu + çocuk profilleri.
 * Ayarlar (ses, müzik...) bu bilgisayar için ortaktır; fare teması, ilerleme ve istatistikler PROFİL başınadır.
 * Veri localStorage'da saklanır (FO.db yerel veri tabanı). Başka bilgisayara taşımak için öğretmen panelindeki
 * "Yedek al / Yedeği yükle" kullanılır. İleride bulut senkronu eklenecekse tek nokta: save() ve FO.profiles. */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var KEY = 'fareyi-ogreniyorum:v1';

  var defaults = {
    musicOn: true,
    muted: false,         // sağ üstteki hoparlör düğmesi: her şeyi sessize alır
    volume: 0.7,          // 0..1
    subtitles: false,     // öğretmen için altyazı
    ttsFallback: true,    // ses dosyası yokken tarayıcının Türkçe sesi
    skinCursor: true,     // imleç yerine seçilen fareyi göster
    unlockAll: false,     // öğretmen: tüm seviyeleri aç
    lowPerf: false,       // eski bilgisayarlar için hafif görünüm
    perfChecked: false,   // hız ölçümü yapıldı mı
    teacherPin: '',       // öğretmen paneli PIN'i
    profiles: [],         // çocuk profilleri
    currentId: null,      // şu an oynayan çocuk
    /* eski sürümden geçiş için (v1 tek kullanıcı): */
    skin: 'mouse_base',
    progress: {}
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
  function emit(k, v) { listeners.forEach(function (fn) { try { fn(k, v); } catch (err) { console.error(err); } }); }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function blank(name, avatar) {
    return { id: uid(), name: name || 'Misafir', avatar: avatar || 'items/item_star.png', skin: 'mouse_base',
      progress: {}, doneAt: {}, levels: {}, totalSec: 0, created: Date.now(), lastPlayed: 0 };
  }
  function byId(id) { for (var i = 0; i < data.profiles.length; i++) if (data.profiles[i].id === id) return data.profiles[i]; return null; }
  function cur() { return byId(data.currentId); }

  /* Eski tek-kullanıcılı kayıt varsa "Misafir" profiline taşı. */
  if (!data.profiles.length && data.progress && Object.keys(data.progress).length) {
    var legacy = blank('Misafir'); legacy.skin = data.skin || 'mouse_base'; legacy.progress = data.progress;
    data.profiles.push(legacy); data.currentId = legacy.id; save();
  }

  FO.state = {
    get: function (k) {
      var pr = cur();
      if (k === 'skin') return pr ? pr.skin : data.skin;
      if (k === 'progress') return pr ? pr.progress : data.progress;
      return data[k];
    },
    set: function (k, v) {
      var pr = cur();
      if (k === 'skin' && pr) pr.skin = v; else data[k] = v;
      save(); emit(k, v);
    },
    markDone: function (step) {
      var pr = cur(), t = pr ? pr.progress : data.progress;
      t[step] = true;
      if (pr && !pr.doneAt[step]) pr.doneAt[step] = Date.now();
      save(); emit('progress', step);
    },
    isDone: function (step) { var pr = cur(); return !!(pr ? pr.progress : data.progress)[step]; },
    resetProgress: function () {
      var pr = cur();
      if (pr) { pr.progress = {}; pr.doneAt = {}; pr.levels = {}; pr.totalSec = 0; } else data.progress = {};
      save(); emit('progress', null);
    },
    onChange: function (fn) { listeners.push(fn); }
  };

  /* ---------- profiller ---------- */
  FO.profiles = {
    list: function () { return data.profiles.slice(); },
    get: byId,
    current: cur,
    setCurrent: function (id) {
      if (!byId(id)) return;
      data.currentId = id; byId(id).lastPlayed = Date.now(); save();
      emit('skin', FO.state.get('skin')); emit('profile', id); emit('progress', null);
    },
    clearCurrent: function () { data.currentId = null; save(); emit('profile', null); },
    add: function (name, avatar) {
      /* hiç oynanmamış otomatik "Misafir" profili, ilk gerçek öğrenci eklenince silinir */
      data.profiles = data.profiles.filter(function (g) { return !(g.name === 'Misafir' && g.auto && !Object.keys(g.progress).length && !g.totalSec); });
      var p = blank(String(name || '').trim().slice(0, 28) || 'Öğrenci', avatar); data.profiles.push(p); save(); emit('profiles', p.id); return p;
    },
    update: function (id, patch) {
      var p = byId(id); if (!p) return;
      if (patch.name != null) p.name = String(patch.name).trim().slice(0, 28) || p.name;
      if (patch.avatar) p.avatar = patch.avatar;
      if (patch.seen != null) p.seen = patch.seen;
      save(); emit('profiles', id);
    },
    remove: function (id) {
      data.profiles = data.profiles.filter(function (p) { return p.id !== id; });
      if (data.currentId === id) data.currentId = null;
      save(); emit('profiles', id);
    },
    reset: function (id) {
      var p = byId(id); if (!p) return;
      p.progress = {}; p.doneAt = {}; p.levels = {}; p.totalSec = 0; p.seen = 0; save(); emit('profiles', id); emit('progress', null);
    },
    /* Yoksa "Misafir" profili açar; oyun profilsiz de çalışsın. */
    ensureCurrent: function () {
      if (cur()) return cur();
      if (data.profiles.length === 1) { FO.profiles.setCurrent(data.profiles[0].id); return cur(); }
      if (!data.profiles.length) { var g = FO.profiles.add('Misafir'); g.auto = true; FO.profiles.setCurrent(g.id); return g; }
      return null;
    },

    /* --- istatistik --- */
    levelStart: function (n) {
      var p = cur(); if (!p) return;
      var l = p.levels[n] || (p.levels[n] = { attempts: 0, done: 0, best: 0, last: 0, helps: 0 });
      l.attempts++; save();
    },
    levelDone: function (n, sec, helps) {
      var p = cur(); if (!p) return;
      var l = p.levels[n] || (p.levels[n] = { attempts: 1, done: 0, best: 0, last: 0, helps: 0 });
      l.done++; l.last = Math.round(sec); l.best = l.best ? Math.min(l.best, l.last) : l.last; save();
    },
    levelHelp: function (n) { var p = cur(); if (!p) return; var l = p.levels[n]; if (l) { l.helps++; save(); } },
    addTime: function (sec) { var p = cur(); if (!p) return; p.totalSec += sec; p.lastPlayed = Date.now(); save(); },

    /* --- yedek --- */
    exportJSON: function () { return JSON.stringify({ app: 'fareyi-ogreniyorum', v: 1, profiles: data.profiles }, null, 1); },
    importJSON: function (txt) {
      var o = JSON.parse(txt);
      if (!o || o.app !== 'fareyi-ogreniyorum' || !Array.isArray(o.profiles)) throw new Error('Geçersiz yedek dosyası');
      var added = 0;
      o.profiles.forEach(function (p) {
        if (byId(p.id)) { var i = data.profiles.indexOf(byId(p.id)); data.profiles[i] = p; } else { data.profiles.push(p); added++; }
      });
      save(); emit('profiles', null); return o.profiles.length;
    }
  };
})();
