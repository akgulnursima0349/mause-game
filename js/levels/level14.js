/* Seviye 14 – Robi uyanıyor: parçaları birleştir, Enter ile çalıştır, final. */
(function () {
  'use strict';
  var FO = window.FO;
  var CX = 960;
  /* kind: antenna|head|body|arm|leg; w genişlik, h yükseklik, flip: slot yönü */
  var SLOTS = [
    { kind: 'antenna', x: CX + 22, y: 168 },
    { kind: 'head',    x: CX, y: 300 },
    { kind: 'body',    x: CX, y: 540 },
    { kind: 'arm',     x: CX - 200, y: 500, flip: 1 },
    { kind: 'arm',     x: CX + 200, y: 500, flip: -1 },
    { kind: 'leg',     x: CX - 75, y: 760, flip: 1 },
    { kind: 'leg',     x: CX + 75, y: 760, flip: -1 }
  ];
  var DIM = {
    antenna: { file: 'robi_antenna', w: 84, h: 144 },
    head:    { file: 'robi_head_bare', w: 240, h: 178 },
    body:    { file: 'robi_body',    w: 230, h: 333 },
    arm:     { file: 'robi_arm',     w: 150, h: 217 },
    leg:     { file: 'robi_leg',     w: 140, h: 180 }
  };
  var START = [[230, 250], [480, 250], [230, 520], [480, 520], [1440, 250], [1690, 250], [1440, 520]];
  var ENTER_ICON = '<svg viewBox="0 0 120 90" aria-hidden="true"><path d="M95 14v34H30" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M48 28L28 48l20 20" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  FO.levels.define(14, {
    bg: 'bg_factory',
    assets: Object.keys(DIM).map(function (k) { return 'items/' + DIM[k].file + '.png'; }).concat(['ui/btn_play.png', 'mascot/mascot_cheer.png']),
    intro: 'lv14_intro', hint: 'lv14_hint', hintMs: 12000,
    build: function (L) {
      var prog = L.progress(SLOTS.length), dragging = null, placed = 0, ready = false, woke = false, enterBtn = null;
      var group = FO.el('div', { class: 'robi-assembled' }); L.root.append(group);

      SLOTS.forEach(function (s) {
        s.full = false;                       // önceki oynayıştan kalan "dolu" işareti temizlenir
        var d = DIM[s.kind];
        s.el = FO.el('img', { class: 'slot-sil', src: FO.A('items/' + d.file + '.png'), alt: '', draggable: 'false',
          style: { width: d.w + 'px', height: d.h + 'px', left: (s.x - d.w / 2) + 'px', top: (s.y - d.h / 2) + 'px', transform: 'scaleX(' + (s.flip || 1) + ')' } });
        group.append(s.el);
      });

      var order = FO.shuffle(SLOTS.map(function (s, i) { return i; }));
      var pieces = order.map(function (slotIdx, j) {
        var s = SLOTS[slotIdx], d = DIM[s.kind], p = START[j];
        var el = FO.el('div', { class: 'drag piece', style: { left: (p[0] - d.w / 2) + 'px', top: (p[1] - d.h / 2) + 'px', width: d.w + 'px', height: d.h + 'px' } },
          FO.el('img', { src: FO.A('items/' + d.file + '.png'), alt: '', draggable: 'false' }));
        el._x = p[0] - d.w / 2; el._y = p[1] - d.h / 2; el._home = { x: el._x, y: el._y }; el._kind = s.kind; el._d = d; el._done = false;
        el.addEventListener('pointerdown', function (e) {
          if (el._done || dragging || e.button !== 0 || woke) return;
          e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (err) {}
          var pp = FO.stage.toStage(e.clientX, e.clientY);
          dragging = { el: el, dx: pp.x - el._x, dy: pp.y - el._y };
          el.classList.remove('ret'); el.classList.add('dragging'); FO.audio.sfx('click');
        });
        el.addEventListener('pointermove', function (e) {
          if (!dragging || dragging.el !== el) return;
          var pp = FO.stage.toStage(e.clientX, e.clientY);
          el._x = pp.x - dragging.dx; el._y = pp.y - dragging.dy;
          el.style.left = el._x + 'px'; el.style.top = el._y + 'px';
        });
        function end() {
          if (!dragging || dragging.el !== el) return;
          dragging = null; el.classList.remove('dragging');
          var cx = el._x + d.w / 2, cy = el._y + d.h / 2, best = null, bd = 1e9;
          SLOTS.forEach(function (s2) { if (s2.full || s2.kind !== el._kind) return; var dd = Math.hypot(cx - s2.x, cy - s2.y); if (dd < bd) { bd = dd; best = s2; } });
          if (best && bd < 150) {
            best.full = true; el._done = true; el.classList.add('snap');
            el._x = best.x - d.w / 2; el._y = best.y - d.h / 2;
            el.style.left = el._x + 'px'; el.style.top = el._y + 'px';
            el.querySelector('img').style.transform = 'scaleX(' + (best.flip || 1) + ')';
            best.el.style.opacity = '0';
            group.append(el);
            FO.audio.sfx('drop'); setTimeout(function () { FO.audio.sfx('ok'); }, 140);
            placed++;
            if (prog.inc()) allPlaced(); else if (placed === 1 || placed === 4) L.say('match_ok_' + (placed % 3 + 1), { pose: 'happy', after: 'idle' });
          } else {
            el.classList.add('ret'); el._x = el._home.x; el._y = el._home.y;
            el.style.left = el._x + 'px'; el.style.top = el._y + 'px'; FO.audio.sfx('drop');
            if (bd < 400) { FO.flash(el, 'shake', 400); L.say('lv14_wrong', { pose: 'think', after: 'idle' }); }
          }
        }
        el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
        L.root.append(el);
        return el;
      });

      function allPlaced() {
        ready = true;
        L.say('lv14_enter', { pose: 'happy', after: 'idle' });
        L.setHint('lv14_enter');
        enterBtn = FO.el('button', { class: 'enter-btn pulse', type: 'button', 'aria-label': 'Çalıştır' });
        enterBtn.innerHTML = ENTER_ICON;
        enterBtn.addEventListener('click', wake);
        L.root.append(enterBtn);
      }

      function wake() {
        if (!ready || woke) return;
        woke = true;
        if (enterBtn) enterBtn.remove();
        FO.audio.sfx('win');
        group.classList.add('fade');
        var fin = FO.el('img', { class: 'robi-final', src: FO.A('mascot/mascot_cheer.png'), alt: 'Robi', draggable: 'false' });
        L.root.append(fin);
        FO.confetti(30);
        setTimeout(function () { FO.confetti(24); FO.audio.sfx('star'); }, 700);
        L.done('lv14_done');
      }
      L.keys(function (k) { if (k === 'Enter') wake(); });
    }
  });
})();
