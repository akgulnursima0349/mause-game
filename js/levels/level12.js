/* Seviye 12 – Tamirhane: sağ tıkla alet seç, aleti sürükleyip Robi'nin gövdesini onar. */
(function () {
  'use strict';
  var FO = window.FO;
  var TOOLS = ['hammer', 'wrench', 'paint'];
  var TW = { hammer: [443, 512], wrench: [344, 512], paint: [378, 512] };
  var BX = 760, BY = 560, BW = 300, BH = 435;
  var GRAY = [0.9, 0.6, 0.3];

  FO.levels.define(12, {
    bg: 'bg_workshop', assets: ['items/robi_body.png'].concat(TOOLS.map(function (t) { return 'items/item_' + t + '.png'; })),
    intro: 'lv12_intro', hint: 'lv12_hint', hintMs: 12000,
    build: function (L) {
      var prog = L.progress(3), step = 0, wheel = null, tool = null, dragging = null, busy = false;
      var body = L.sprite('items/robi_body.png', { x: BX, y: BY, w: BW, h: BH, cls: 'body-broken' });
      body.style.pointerEvents = 'auto'; body.style.filter = 'grayscale(' + GRAY[0] + ') brightness(.85)';

      var swatch = FO.el('div', { class: 'swatch', hidden: true, style: { left: '1300px', top: '190px' } }, FO.el('img', { alt: '', draggable: 'false' }));
      L.root.append(swatch);
      function showTarget() { swatch.hidden = false; swatch.querySelector('img').src = FO.A('items/item_' + TOOLS[step] + '.png'); FO.flash(swatch, 'bump', 500); }
      function closeWheel() { if (wheel) { wheel.remove(); wheel = null; } }

      function openWheel(x, y) {
        closeWheel();
        wheel = FO.el('div', { class: 'color-wheel', style: { left: x + 'px', top: y + 'px' } });
        var pos = [[-130, -40], [0, -130], [130, -40]];
        TOOLS.forEach(function (t, i) {
          var b = FO.el('button', { class: 'tool-dot', type: 'button', 'aria-label': t, style: { left: (pos[i][0] - 60) + 'px', top: (pos[i][1] - 60) + 'px' } },
            FO.el('img', { src: FO.A('items/item_' + t + '.png'), alt: '', draggable: 'false' }));
          b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
          b.addEventListener('click', function () { choose(t, x, y); });
          wheel.append(b);
        });
        L.root.append(wheel); FO.audio.sfx('pop');
      }

      function choose(t, x, y) {
        closeWheel();
        if (t !== TOOLS[step]) { FO.audio.sfx('wrong'); L.say('lv12_wrong', { pose: 'think', after: 'idle' }); return; }
        FO.audio.sfx('select');
        spawnTool(t);
      }

      function spawnTool(t) {
        if (tool) tool.remove();
        var w = 150, h = w * TW[t][1] / TW[t][0];
        var hx = 1180 - w / 2, hy = 640 - h / 2;
        tool = FO.el('div', { class: 'drag tool', style: { left: hx + 'px', top: hy + 'px', width: w + 'px', height: h + 'px' } },
          FO.el('img', { src: FO.A('items/item_' + t + '.png'), alt: '', draggable: 'false' }));
        tool._x = hx; tool._y = hy; tool._home = { x: hx, y: hy }; tool._w = w; tool._h = h;
        tool.classList.add('pop-in');
        tool.addEventListener('pointerdown', function (e) {
          if (dragging || e.button !== 0 || busy) return;
          e.preventDefault(); try { tool.setPointerCapture(e.pointerId); } catch (err) {}
          var p = FO.stage.toStage(e.clientX, e.clientY);
          dragging = { dx: p.x - tool._x, dy: p.y - tool._y };
          tool.classList.remove('ret'); tool.classList.add('dragging'); FO.audio.sfx('click');
        });
        tool.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          var p = FO.stage.toStage(e.clientX, e.clientY);
          tool._x = p.x - dragging.dx; tool._y = p.y - dragging.dy;
          tool.style.left = tool._x + 'px'; tool.style.top = tool._y + 'px';
        });
        function end() {
          if (!dragging) return; dragging = null; tool.classList.remove('dragging');
          var cx = tool._x + tool._w / 2, cy = tool._y + tool._h / 2;
          if (Math.hypot(cx - BX, cy - BY) < 230) fixed(); else {
            tool.classList.add('ret'); tool._x = tool._home.x; tool._y = tool._home.y;
            tool.style.left = tool._x + 'px'; tool.style.top = tool._y + 'px'; FO.audio.sfx('drop');
          }
        }
        tool.addEventListener('pointerup', end); tool.addEventListener('pointercancel', end);
        L.root.append(tool);
      }

      function fixed() {
        busy = true;
        if (tool) { tool.remove(); tool = null; }
        FO.audio.sfx('ok'); setTimeout(function () { FO.audio.sfx('star'); }, 150);
        step++;
        FO.flash(body, 'bump', 500);
        body.style.filter = step >= 3 ? 'none' : 'grayscale(' + GRAY[step] + ') brightness(.9)';
        var fin = prog.inc();
        if (fin) { swatch.hidden = true; L.reward('robi_body', 'lv12_done'); return; }
        L.say('match_ok_' + (step + 1), { pose: 'happy', after: 'idle' }).then(function () {
          if (!L.alive()) return;
          busy = false; showTarget(); L.say('lv12_' + TOOLS[step]);
        });
      }

      body.addEventListener('pointerdown', function (e) {
        if (L.finished() || busy) return;
        e.preventDefault();
        var p = FO.stage.toStage(e.clientX, e.clientY);
        if (e.button === 2) { openWheel(p.x, p.y); L.touch(); }
        else if (e.button === 0) { FO.audio.sfx('click'); closeWheel(); FO.flash(body, 'bump', 300); L.say('lv12_left', { pose: 'think', after: 'idle' }); }
      });
      L.listen(L.root, 'pointerdown', function (e) { if (e.target === L.root || e.target.classList.contains('bg')) closeWheel(); });
      L._begin = function () { if (step === 0 && !wheel) { showTarget(); L.say('lv12_hammer'); } };
    },
    start: function (L) { setTimeout(function () { if (L.alive()) L._begin(); }, 7500); }
  });
})();
