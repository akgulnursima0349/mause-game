/* Seviye 9 – Orman yolu: ok tuşlarıyla yardımcı robotu yürüt (ekrandaki oklar da çalışır). */
(function () {
  'use strict';
  var FO = window.FO;
  var SPEED = 480, W = 190, FLOOR = 880;
  var GEARS = [560, 960, 1340];

  FO.levels.define(9, {
    bg: 'bg_forest', assets: ['items/item_worker_robot.png', 'items/item_gear.png', 'items/robi_arm.png', 'ui/btn_prev.png', 'ui/btn_next.png'],
    intro: 'lv9_intro', hint: 'lv9_hint', hintMs: 10000,
    build: function (L) {
      var prog = L.progress(4), x = 220, dir = 0, flip = 1, t = 0, got = 0, armOut = false, arm = null, items = [];
      var walker = L.sprite('items/item_worker_robot.png', { x: 0, y: 0, w: W, h: W * 512 / 488, cls: 'walker' });
      var H = W * 512 / 488;

      function addItem(file, ix, w, kind) {
        var s = L.sprite(file, { x: ix, y: FLOOR - 200, w: w, h: w, cls: kind === 'arm' ? 'part-float' : 'item-bob' });
        items.push({ el: s, x: ix, y: FLOOR - 200, got: false, kind: kind });
        return s;
      }
      GEARS.forEach(function (gx) { addItem('items/item_gear.png', gx, 110, 'gear'); });

      var keys = L.keys(null, null);
      var btnL = arrowBtn('left'), btnR = arrowBtn('right');
      function arrowBtn(side) {
        var b = FO.el('button', { class: 'arrow-btn ' + side, type: 'button', 'aria-label': side },
          FO.el('img', { src: FO.A(side === 'left' ? 'ui/btn_prev.png' : 'ui/btn_next.png'), alt: '', draggable: 'false' }));
        function down(e) { e.preventDefault(); keys.set(side === 'left' ? 'ArrowLeft' : 'ArrowRight', true); try { b.setPointerCapture(e.pointerId); } catch (err) {} }
        function up() { keys.set(side === 'left' ? 'ArrowLeft' : 'ArrowRight', false); }
        b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
        L.root.append(b); return b;
      }

      L.loop(function (dt) {
        if (L.finished()) return;
        var d = (keys.held('ArrowRight') ? 1 : 0) - (keys.held('ArrowLeft') ? 1 : 0);
        if (d) {
          x = Math.max(120, Math.min(1800, x + d * SPEED * dt)); flip = d; t += dt * 11; L.touch();
        } else t = 0;
        var bob = d ? Math.abs(Math.sin(t)) * 14 : 0;
        walker.style.transform = 'translate(' + (x - W / 2) + 'px,' + (FLOOR - H - bob) + 'px) scaleX(' + flip + ')';
        items.forEach(function (it) {
          if (it.got || Math.abs(it.x - x) > 110) return;
          it.got = true; got++;
          FO.audio.sfx('star'); it.el.classList.add('collect');
          setTimeout(function () { it.el.remove(); }, 450);
          if (it.kind === 'arm') { prog.inc(); L.reward('robi_arm', 'lv9_done'); return; }
          prog.inc();
          if (got === GEARS.length && !armOut) {
            armOut = true;
            arm = addItem('items/robi_arm.png', 1700, 200, 'arm');
            FO.audio.sfx('win'); L.say('lv9_arm', { pose: 'happy', after: 'idle' });
          }
        });
      });
      /* başlangıçta sprite konumu */
      walker.style.transform = 'translate(' + (x - W / 2) + 'px,' + (FLOOR - H) + 'px)';
    }
  });
})();
