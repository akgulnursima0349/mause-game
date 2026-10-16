/* Bilgisayar elemanları: 1) parçalara tıkla, tanı  2) parçayı gölgesine sürükle */
(function () {
  'use strict';
  var FO = window.FO;

  var CARD = 340;
  var GRID_X = [400, 790, 1180], GRID_Y = [190, 580];
  var SLOT = 240, ITEM = 220, SLOT_Y = 150, TRAY_Y = 500;
  var SLOT_X0 = 140, SLOT_STEP = 280;                      // 6 * 240 + 5 * 40 = 1640

  FO.router.register('parts', function () {
    var root, gridLayer, matchLayer, nextBtn;
    var seen = {}, seenCount = 0, locked = false, matched = 0, dragging = null, alive = true, okIdx = 0, wrongIdx = 0;

    function assets() {
      var list = ['bg/bg_room.jpg', 'ui/star_full.png', 'ui/btn_next.png'];
      FO.parts.forEach(function (p) { list.push(p.file); });
      return list;
    }

    function showNext() {
      if (nextBtn) return;
      nextBtn = FO.el('button', { class: 'nav-btn next-btn pulse', type: 'button', 'aria-label': 'Devam' },
        FO.el('img', { src: FO.A('ui/btn_next.png'), alt: '' }));
      nextBtn.addEventListener('click', function () { FO.audio.sfx('swoosh'); FO.router.go('customize'); });
      root.append(nextBtn);
    }

    /* ---------- aşama 1: tanıma ---------- */
    function buildGrid() {
      gridLayer = FO.el('div', { class: 'grid-layer' });
      FO.parts.forEach(function (part, i) {
        var card = FO.el('button', { class: 'part-card', type: 'button', 'aria-label': part.label,
          style: { left: GRID_X[i % 3] + 'px', top: GRID_Y[Math.floor(i / 3)] + 'px' } },
          FO.el('img', { class: 'part', src: FO.A(part.file), alt: '', draggable: 'false' }),
          FO.el('img', { class: 'badge', src: FO.A('ui/star_full.png'), alt: '' }));
        card.addEventListener('click', function () {
          if (locked) return;
          FO.audio.sfx('pop');
          FO.flash(card, 'bump', 500);
          var first = !seen[part.id];
          seen[part.id] = true;
          if (first) { seenCount++; card.classList.add('seen'); setTimeout(function () { FO.audio.sfx('star'); }, 120); }
          var sp = FO.mascot.say(part.voice);
          if (seenCount === FO.parts.length) {
            locked = true;
            sp.then(function () {
              if (!alive) return;
              return FO.mascot.say('parts_all_seen', { pose: 'happy', after: 'idle' });
            }).then(function () { if (alive) toMatch(); });
          }
        });
        gridLayer.append(card);
      });
      root.append(gridLayer);
    }

    /* ---------- aşama 2: eşleştirme ---------- */
    function toMatch() {
      gridLayer.classList.add('stage-out');
      FO.audio.sfx('swoosh');
      setTimeout(function () {
        if (!alive) return;
        gridLayer.remove();
        buildMatch();
        FO.mascot.say('match_intro');
      }, FO.reducedMotion() ? 0 : 420);
    }

    function slotCenter(i) { return { x: SLOT_X0 + SLOT / 2 + i * SLOT_STEP, y: SLOT_Y + SLOT / 2 }; }

    function buildMatch() {
      matchLayer = FO.el('div', { class: 'match-layer' });
      var slots = {};
      FO.parts.forEach(function (part, i) {
        var c = slotCenter(i);
        var s = FO.el('div', { class: 'slot', style: { left: (c.x - SLOT / 2) + 'px', top: SLOT_Y + 'px' } },
          FO.el('img', { src: FO.A(part.file), alt: '', draggable: 'false' }));
        slots[part.id] = { el: s, cx: c.x, cy: c.y };
        matchLayer.append(s);
      });

      var order = FO.shuffle(FO.parts);
      /* aynı sırada çıkmasın */
      if (order.every(function (p, i) { return p === FO.parts[i]; })) order.push(order.shift());

      order.forEach(function (part, j) {
        var homeX = SLOT_X0 + SLOT / 2 + j * SLOT_STEP - ITEM / 2, homeY = TRAY_Y;
        var item = FO.el('div', { class: 'drag', 'data-part': part.id, style: { left: homeX + 'px', top: homeY + 'px' } },
          FO.el('img', { src: FO.A(part.file), alt: part.label, draggable: 'false' }));
        item._x = homeX; item._y = homeY; item._home = { x: homeX, y: homeY }; item._done = false;

        item.addEventListener('pointerdown', function (e) {
          if (item._done || dragging) return;
          e.preventDefault();
          try { item.setPointerCapture(e.pointerId); } catch (err) {}
          var p = FO.stage.toStage(e.clientX, e.clientY);
          dragging = { item: item, dx: p.x - item._x, dy: p.y - item._y, id: e.pointerId };
          item.classList.remove('ret');
          item.classList.add('dragging');
          FO.audio.sfx('click');
        });
        item.addEventListener('pointermove', function (e) {
          if (!dragging || dragging.item !== item) return;
          var p = FO.stage.toStage(e.clientX, e.clientY);
          item._x = p.x - dragging.dx; item._y = p.y - dragging.dy;
          item.style.left = item._x + 'px'; item.style.top = item._y + 'px';
        });
        function end() {
          if (!dragging || dragging.item !== item) return;
          dragging = null;
          item.classList.remove('dragging');
          drop(item, part, slots);
        }
        item.addEventListener('pointerup', end);
        item.addEventListener('pointercancel', end);
        matchLayer.append(item);
      });
      root.append(matchLayer);
    }

    function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

    function drop(item, part, slots) {
      var cx = item._x + ITEM / 2, cy = item._y + ITEM / 2;
      var target = slots[part.id];
      if (dist(cx, cy, target.cx, target.cy) < 150) {
        /* doğru */
        item._done = true;
        item.classList.add('snap');
        item._x = target.cx - ITEM / 2; item._y = target.cy - ITEM / 2;
        item.style.left = item._x + 'px'; item.style.top = item._y + 'px';
        target.el.classList.add('filled');
        FO.audio.sfx('drop');
        setTimeout(function () { FO.audio.sfx('ok'); }, 150);
        matched++;
        if (matched === FO.parts.length) { finish(); return; }
        okIdx = okIdx % 3 + 1;
        FO.mascot.say('match_ok_' + okIdx, { pose: 'happy', after: 'idle' });
        return;
      }
      /* yanlış slotun üstüne mi bırakıldı? */
      var wrongSlot = false;
      Object.keys(slots).forEach(function (id) {
        if (id !== part.id && dist(cx, cy, slots[id].cx, slots[id].cy) < 130) wrongSlot = true;
      });
      item.classList.add('ret');
      item._x = item._home.x; item._y = item._home.y;
      item.style.left = item._x + 'px'; item.style.top = item._y + 'px';
      if (wrongSlot) {
        FO.audio.sfx('wrong');
        FO.flash(item, 'shake', 400);
        wrongIdx = wrongIdx % 2 + 1;
        FO.mascot.say('match_wrong_' + wrongIdx, { pose: 'think', after: 'idle' });
      } else {
        FO.audio.sfx('drop');
      }
    }

    function finish() {
      FO.state.markDone('parts');
      FO.audio.sfx('win');
      FO.confetti(18);
      FO.mascot.say('parts_done', { pose: 'cheer', after: 'idle' });
      setTimeout(function () { if (alive) showNext(); }, 700);
    }

    return {
      assets: assets(),
      mount: function (r) {
        root = r;
        root.append(FO.el('img', { class: 'bg', src: FO.A('bg/bg_room.jpg'), alt: '', draggable: 'false' }));
        buildGrid();
        if (FO.state.get('unlockAll')) showNext();
      },
      start: function () {
        FO.mascot.show('corner');
        FO.mascot.say('parts_intro');
      },
      unmount: function () { alive = false; dragging = null; }
    };
  });
})();
