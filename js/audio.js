/* Ses sistemi
 * - Müzik ve efektler Web Audio ile kodla üretilir (telif/lisans sorunu yok, dosya gerekmez).
 *   Gerçek müzik eklemek istersen assets/audio/music/ altına koyup startMusic() içinde değiştir.
 * - Robi'nin sesi: önce assets/audio/voice/<id>.mp3, yoksa (ayardan açıksa) tarayıcının Türkçe sesi,
 *   o da yoksa sessiz (süre metin uzunluğundan tahmin edilir).
 * - Tarayıcılar sesi ilk kullanıcı hareketinden önce engeller; FO.audio.unlock() ilk tıklamada çağrılır.
 */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});

  var ctx = null, master = null, musicGain = null, sfxGain = null;
  var unlocked = false;
  var musicTimer = null, nextNoteTime = 0, stepIndex = 0;
  var voiceToken = 0, currentEl = null, ducked = false, pendingEnd = null;

  function effVolume() { return FO.state.get('muted') ? 0 : FO.state.get('volume'); }

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = effVolume();
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.5;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.9;
    sfxGain.connect(master);
    return ctx;
  }

  /* ---------- yardımcı sesler ---------- */
  function tone(freq, o) {
    var c = ensure(); if (!c || !unlocked) return;
    o = o || {};
    var t0 = c.currentTime + (o.delay || 0);
    var dur = o.dur || 0.15;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t0 + dur);
    var peak = o.gain == null ? 0.25 : o.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.dest || sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function noise(o) {
    var c = ensure(); if (!c || !unlocked) return;
    o = o || {};
    var t0 = c.currentTime + (o.delay || 0), dur = o.dur || 0.1;
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1800, t0);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t0 + dur);
    var g = c.createGain(); g.gain.value = o.gain == null ? 0.25 : o.gain;
    src.connect(f); f.connect(g); g.connect(o.dest || sfxGain);
    src.start(t0);
  }

  var SFX = {
    click:   function () { tone(880, { slideTo: 620, dur: 0.07, type: 'triangle', gain: 0.18 }); },
    pop:     function () { noise({ dur: 0.07, freq: 2400, gain: 0.22 }); tone(520, { slideTo: 160, dur: 0.12, gain: 0.22 }); },
    select:  function () { tone(660, { dur: 0.09, type: 'triangle', gain: 0.2 }); tone(990, { dur: 0.12, type: 'triangle', gain: 0.18, delay: 0.07 }); },
    ok:      function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, { dur: 0.16, type: 'triangle', gain: 0.2, delay: i * 0.08 }); }); },
    wrong:   function () { tone(330, { slideTo: 280, dur: 0.18, type: 'triangle', gain: 0.18 }); tone(262, { slideTo: 220, dur: 0.22, type: 'triangle', gain: 0.16, delay: 0.14 }); },
    drop:    function () { tone(190, { slideTo: 80, dur: 0.16, gain: 0.3 }); },
    swoosh:  function () { noise({ dur: 0.28, filter: 'bandpass', freq: 500, sweepTo: 3200, gain: 0.16 }); },
    win:     function () { [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, { dur: 0.22, type: 'triangle', gain: 0.2, delay: i * 0.09 }); }); },
    step:    function (i) { var f = 523 * Math.pow(1.122, (i || 0) * 2); tone(f, { dur: 0.14, type: 'triangle', gain: 0.2 }); tone(f * 1.5, { dur: 0.2, type: 'sine', gain: 0.12, delay: 0.06 }); noise({ dur: 0.05, freq: 6000, gain: 0.06, delay: 0.02 }); },
    star:    function () { tone(1175, { dur: 0.1, type: 'triangle', gain: 0.18 }); tone(1568, { dur: 0.16, type: 'triangle', gain: 0.16, delay: 0.08 }); }
  };

  /* ---------- müzik (üretilen) ---------- */
  var BPM = 92, STEP = 60 / BPM / 2;           // sekizlik nota
  var bars = [
    { bass: 48, chord: [60, 64, 67], mel: [76, 0, 79, 76, 74, 0, 72, 0] },   // C
    { bass: 45, chord: [57, 60, 64], mel: [72, 0, 76, 79, 81, 0, 79, 0] },   // Am
    { bass: 41, chord: [57, 60, 65], mel: [69, 0, 72, 69, 67, 0, 69, 0] },   // F
    { bass: 43, chord: [55, 59, 62], mel: [74, 0, 79, 76, 74, 0, 72, 0] }    // G
  ];
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function scheduleStep(t, idx) {
    var bar = bars[Math.floor(idx / 8) % bars.length], s = idx % 8;
    var c = ctx;
    function note(freq, type, peak, dur) {
      var osc = c.createOscillator(), g = c.createGain();
      osc.type = type; osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(musicGain);
      osc.start(t); osc.stop(t + dur + 0.05);
    }
    if (s === 0 || s === 4) note(mtof(bar.bass), 'sine', 0.22, STEP * 3.2);
    if (s === 2 || s === 6) note(mtof(bar.chord[(s / 2 - 1) % 3 | 0] + 0), 'sine', 0.06, STEP * 1.8);
    if (s === 3 || s === 7) note(mtof(bar.chord[2] + 12), 'sine', 0.04, STEP * 1.2);
    if (bar.mel[s]) note(mtof(bar.mel[s]), 'triangle', 0.1, STEP * 1.9);
    if (s % 2 === 1) {                                         // hafif tık sesi
      var len = Math.floor(c.sampleRate * 0.03), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = c.createBufferSource(); src.buffer = buf;
      var f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
      var g2 = c.createGain(); g2.gain.value = 0.05;
      src.connect(f); f.connect(g2); g2.connect(musicGain); src.start(t);
    }
  }
  function pump() {
    if (!ctx || ctx.state !== 'running') return;
    while (nextNoteTime < ctx.currentTime + 0.25) {
      scheduleStep(Math.max(nextNoteTime, ctx.currentTime), stepIndex);
      nextNoteTime += STEP; stepIndex++;
    }
  }
  function startMusic() {
    var c = ensure(); if (!c || !unlocked || musicTimer) return;
    nextNoteTime = c.currentTime + 0.1; stepIndex = 0;
    musicTimer = setInterval(pump, 60);
    pump();
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

  function duck(on) {
    ducked = on;
    if (!ctx) return;
    musicGain.gain.setTargetAtTime(on ? 0.15 : 0.5, ctx.currentTime, 0.12);
  }

  /* ---------- Robi'nin sesi ---------- */
  function trVoice() {
    try {
      var vs = window.speechSynthesis.getVoices() || [];
      for (var i = 0; i < vs.length; i++) if (/^tr/i.test(vs[i].lang)) return vs[i];
    } catch (e) {}
    return null;
  }
  function stopVoice() {
    var pe = pendingEnd; pendingEnd = null;
    voiceToken++;
    if (currentEl) { try { currentEl.pause(); } catch (e) {} currentEl = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    if (ducked) duck(false);
    if (pe) pe();                                              // bekleyen konuşmayı sonlandır
  }

  /* speak(id) -> { done: Promise, cancel() }  (done her durumda çözülür) */
  function speak(id) {
    stopVoice();
    var my = voiceToken;
    var line = FO.voice.lines[id];
    if (!line) return { done: Promise.resolve(), cancel: function () {} };
    var muted = FO.state.get('muted');
    var vol = effVolume();
    var done = new Promise(function (resolve) {
      var finished = false;
      function end() { if (finished) return; finished = true; if (my === voiceToken) { currentEl = null; duck(false); } resolve(); }
      pendingEnd = end;
      duck(true);
      var estimate = Math.max(1400, line.text.length * 70);

      if (muted) { setTimeout(end, estimate); return; }       // sessizde ağız yine oynar
      if (FO.voice.files.indexOf(id) >= 0) {
        var a = new Audio('assets/audio/voice/' + id + '.mp3');
        a.volume = vol; currentEl = a;
        a.addEventListener('ended', end);
        a.addEventListener('error', function () { setTimeout(end, estimate); });
        var p = a.play(); if (p && p.catch) p.catch(function () { setTimeout(end, estimate); });
        return;
      }
      var v = FO.state.get('ttsFallback') && 'speechSynthesis' in window ? trVoice() : null;
      if (v) {
        try {
          var u = new SpeechSynthesisUtterance(line.text);
          u.voice = v; u.lang = v.lang; u.rate = 0.9; u.pitch = 1.15; u.volume = vol;
          u.onend = end; u.onerror = end;
          window.speechSynthesis.speak(u);
          setTimeout(end, estimate + 6000);                    // takılırsa kurtar
          return;
        } catch (e) {}
      }
      setTimeout(end, estimate);                                // sessiz mod
    });
    return { done: done, cancel: function () { if (my === voiceToken) stopVoice(); } };
  }

  /* ---------- genel ---------- */
  function applyVolume() {
    var v = effVolume();
    if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
    if (currentEl) currentEl.volume = v;
  }
  function applyMusic() {
    if (!unlocked) return;
    if (FO.state.get('musicOn')) startMusic(); else stopMusic();
  }
  FO.state.onChange(function (k) {
    if (k === 'volume' || k === 'muted') applyVolume();
    if (k === 'musicOn') applyMusic();
  });

  function unlock() {
    var c = ensure(); if (!c) return;
    var go = function () { unlocked = true; applyMusic(); };
    if (c.state === 'suspended') c.resume().then(go).catch(go); else go();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function once() {
      unlock();
      if (unlocked || (ctx && ctx.state === 'running')) window.removeEventListener(ev, once, true);
    }, true);
  });
  try { window.speechSynthesis && (window.speechSynthesis.onvoiceschanged = function () {}); } catch (e) {}

  FO.audio = {
    unlock: unlock,
    sfx: function (name, arg) { if (SFX[name]) SFX[name](arg); },
    speak: speak,
    stopVoice: stopVoice,
    startMusic: startMusic,
    stopMusic: stopMusic,
    isUnlocked: function () { return unlocked; }
  };
})();
