/* Robi: köşede duran maskot. Ağız hareketi idle <-> talk_open kareleri arasında geçişle yapılır.
 * Tüm pozlar aynı tuvalde çizildiği için poz değişince maskot yerinde kalır. */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});

  var POSES = {
    idle:  'mascot/mascot_idle.png',
    talk:  'mascot/mascot_talk_open.png',
    happy: 'mascot/mascot_happy.png',
    think: 'mascot/mascot_think.png',
    wave:  'mascot/mascot_wave.png',
    cheer: 'mascot/mascot_cheer.png'
  };

  var root = document.getElementById('mascot');
  var sub = document.getElementById('subtitle');
  var img = FO.el('img', { alt: 'Robi', draggable: 'false' });
  root.append(img);

  var pose = 'idle', lastLine = null, token = 0, mouthTimer = null, speaking = false;

  function setPose(p) { pose = p; img.src = FO.A(POSES[p]); }
  function stopMouth() { root.classList.remove('talking'); if (mouthTimer) { clearInterval(mouthTimer); mouthTimer = null; } }
  function startMouth() {
    stopMouth();
    root.classList.add('talking');
    var open = false;
    mouthTimer = setInterval(function () { open = !open; img.src = FO.A(POSES[open ? 'talk' : 'idle']); }, 170);
  }

  function showSub(text) {
    if (!FO.state.get('subtitles')) { sub.hidden = true; return; }
    sub.textContent = text; sub.hidden = false;
  }

  var M = {
    preload: function () { return FO.preload(Object.keys(POSES).map(function (k) { return POSES[k]; })); },

    /* pos: 'corner' (sağ alt, küçük) | 'home' (sol alt, büyük) */
    show: function (pos) {
      root.className = 'pos-' + (pos || 'corner');
      root.hidden = false;
      if (!speaking) setPose('idle');
    },
    hide: function () { M.stop(); root.hidden = true; },

    pose: function (p, ms) {
      if (!POSES[p]) return;
      token++;
      stopMouth(); setPose(p);
      FO.flash(root, 'hop', 700);
      if (ms) { var my = token; setTimeout(function () { if (my === token && !speaking) setPose('idle'); }, ms); }
    },

    /* Cümleyi söyler; bitince çözülür. opts.pose: konuşurken gösterilecek poz (verilmezse ağız oynar) */
    say: function (id, opts) {
      opts = opts || {};
      lastLine = id;
      var my = ++token;
      var line = FO.voice.lines[id];
      var sp = FO.audio.speak(id);
      speaking = true;
      if (line) showSub(line.text);
      if (opts.pose && POSES[opts.pose]) { stopMouth(); setPose(opts.pose); FO.flash(root, 'hop', 700); }
      else { startMouth(); }
      return sp.done.then(function () {
        if (my !== token) return;                  // araya başka cümle/poz girdi
        speaking = false; stopMouth(); sub.hidden = true;
        setPose(opts.after || 'idle');
      });
    },

    stop: function () {
      token++; speaking = false; stopMouth(); FO.audio.stopVoice(); sub.hidden = true; setPose('idle');
    },
    setLast: function (id) { lastLine = id; },
    repeat: function () { if (lastLine) M.say(lastLine); },
    isSpeaking: function () { return speaking; },
    root: root
  };

  root.addEventListener('click', function () { FO.audio.sfx('pop'); M.repeat(); });
  FO.mascot = M;
})();
