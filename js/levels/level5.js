/* Seviye 5 – Sihirli renk: sağ tık ile renk çemberi aç, rengi seç. */
(function () {
  'use strict';
  var FO = window.FO;
  var COLORS = { red: '#f0463c', blue: '#2e8bf0', yellow: '#fbc72d', green: '#43c258' };
  var KEYS = ['red', 'blue', 'yellow', 'green'];
  var TARGETS = ['blue', 'yellow', 'green'];
  var CX = 860, CY = 560, BALL = 360;

  FO.levels.define(5, {
    bg: 'bg_workshop', assets: KEYS.map(function (k) { return 'items/item_ball_' + k + '.png'; }), intro: 'lv5_intro', hint: 'lv5_hint',
    build: function (L) {
      var prog = L.progress(TARGETS.length), step = 0, cur = 'red', wheel = null, busy = false;
      var ball = L.sprite('items/item_ball_red.png', { x: CX, y: CY, w: BALL, h: BALL, cls: 'ball' });
      ball.style.pointerEvents = 'auto';

      var swatch = FO.el('div', { class: 'swatch', hidden: true }, FO.el('img', { alt: '', draggable: 'false' }));
      L.root.append(swatch);
      function showTarget() {
        var t = TARGETS[step];
        swatch.hidden = false; swatch.querySelector('img').src = FO.A('items/item_ball_' + t + '.png');
        FO.flash(swatch, 'bump', 500);
      }

      function closeWheel() { if (wheel) { wheel.remove(); wheel = null; } }

      function openWheel(x, y) {
        closeWheel();
        wheel = FO.el('div', { class: 'color-wheel', style: { left: x + 'px', top: y + 'px' } });
        var pos = [[0, -120], [120, 0], [0, 120], [-120, 0]];
        KEYS.forEach(function (k, i) {
          var b = FO.el('button', { class: 'cw-dot', type: 'button', 'aria-label': k, style: {
            left: (pos[i][0] - 55) + 'px', top: (pos[i][1] - 55) + 'px', background: COLORS[k] } });
          b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
          b.addEventListener('click', function (e) {
            if (e.button !== 0) return;
            choose(k);
          });
          wheel.append(b);
        });
        L.root.append(wheel);
        FO.audio.sfx('pop');
      }

      function choose(k) {
        var want = TARGETS[step];
        if (busy) return;
        closeWheel();
        if (k !== want) { FO.audio.sfx('wrong'); FO.flash(ball, 'shake', 400); L.say('lv5_wrongcolor', { pose: 'think', after: 'idle' }); return; }
        busy = true;
        cur = k; ball.src = FO.A('items/item_ball_' + k + '.png');
        FO.flash(ball, 'bump', 500); FO.audio.sfx('ok');
        step++;
        var fin = prog.inc();
        if (fin) { swatch.hidden = true; L.done(); return; }
        L.say('match_ok_1', { pose: 'happy', after: 'idle' }).then(function () {
          if (!L.alive()) return;
          busy = false; showTarget(); L.say('lv5_' + TARGETS[step]);
        });
      }

      ball.addEventListener('pointerdown', function (e) {
        if (L.finished() || busy) return;
        e.preventDefault();
        var p = FO.stage.toStage(e.clientX, e.clientY);
        if (e.button === 2) { openWheel(p.x, p.y); L.touch(); }
        else if (e.button === 0) { FO.audio.sfx('click'); closeWheel(); FO.flash(ball, 'bump', 300); L.say('lv5_left', { pose: 'think', after: 'idle' }); }
      });
      L.root.addEventListener('pointerdown', function (e) { if (e.target === L.root || e.target.classList.contains('bg')) closeWheel(); });
      L._begin = function () { if (step === 0 && !wheel) { showTarget(); L.say('lv5_blue'); } };
    },
    start: function (L) {
      /* hedef rengi, giriş cümlesinden sonra göster */
      setTimeout(function () { if (L.alive()) { L._begin(); } }, 6500);
    }
  });
})();
