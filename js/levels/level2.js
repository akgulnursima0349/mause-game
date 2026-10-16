/* Seviye 2 – Balon patlat: tek tık. */
(function () {
  'use strict';
  var FO = window.FO, TOTAL = 8;
  var COLORS = ['items/item_balloon_red.png', 'items/item_balloon_blue.png', 'items/item_balloon_yellow.png'];

  FO.levels.define(2, {
    bg: 'bg_meadow', assets: COLORS, intro: 'lv2_intro', hint: 'lv2_hint',
    build: function (L) {
      var prog = L.progress(TOTAL), popped = 0, live = 0, timer = 0, lastX = [];

      function spawn() {
        if (!L.alive() || L.finished()) return;
        if (live < 3) {
          var x, tries = 0;
          do { x = 260 + Math.random() * 1150; tries++; } while (tries < 20 && lastX.some(function (v) { return Math.abs(v - x) < 260; }));
          lastX.push(x); if (lastX.length > 2) lastX.shift();
          var w = 170, h = w * 512 / 305;
          var b = L.sprite(FO.pick(COLORS), { x: x, y: 1080 + h / 2, w: w, h: h, cls: 'balloon' });
          b.style.pointerEvents = 'auto'; b.style.cursor = 'pointer'; b.style.left = (x - w / 2) + 'px'; b.style.top = '0px';
          var dur = 9000 + Math.random() * 2500;
          var sway = 30 + Math.random() * 30;
          var anim = b.animate([
            { transform: 'translate(0,' + (1080 + 20) + 'px)' },
            { transform: 'translate(' + sway + 'px,' + (540 - h / 2) + 'px)', offset: .5 },
            { transform: 'translate(0,' + (-h - 20) + 'px)' }
          ], { duration: dur, easing: 'linear' });
          live++;
          var gone = false;
          function remove() { if (gone) return; gone = true; live--; b.remove(); }
          anim.onfinish = remove;
          b.addEventListener('pointerdown', function (e) {
            if (gone || L.finished()) return;
            e.preventDefault();
            if (e.button !== 0) return;
            gone = true; live--; anim.pause();
            var r = b.getBoundingClientRect();
            FO.audio.sfx('pop');
            b.classList.add('burst');
            setTimeout(function () { b.remove(); }, 260);
            popped++;
            if (prog.inc()) L.done(); else if (popped === 1) L.say('match_ok_2', { pose: 'happy', after: 'idle' });
          });
        }
      }
      spawn(); setTimeout(spawn, 900); setTimeout(spawn, 1800);
      timer = setInterval(spawn, 1700);
      L._timer = timer;
    },
    unmount: function (L) { clearInterval(L._timer); }
  });
})();
