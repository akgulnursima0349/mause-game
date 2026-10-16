/* Seviye 1 – Yıldızları topla: sadece fare hareketi, tıklama yok. */
(function () {
  'use strict';
  var FO = window.FO, TOTAL = 8, R = 85;

  function inBlocked(x, y) {                       // HUD, geri butonu ve maskot köşesi
    return (x < 220 && (y < 200 || y > 820)) || (x > 1700 && y < 200) || (x > 1500 && y > 700) || y < 160;
  }

  FO.levels.define(1, {
    bg: 'bg_clouds', assets: ['items/item_star.png'], intro: 'lv1_intro', hint: 'lv1_hint',
    build: function (L) {
      var stars = [], prog = L.progress(TOTAL), pts = [];
      while (pts.length < TOTAL) {
        var x = 240 + Math.random() * 1250, y = 220 + Math.random() * 600;
        if (inBlocked(x, y)) continue;
        if (pts.some(function (p) { return Math.hypot(p.x - x, p.y - y) < 230; })) continue;
        pts.push({ x: x, y: y });
      }
      pts.forEach(function (p, i) {
        var im = L.sprite('items/item_star.png', { x: p.x, y: p.y, w: 120, cls: 'star-pulse' });
        im.style.animationDelay = (i * 0.15) + 's';
        stars.push({ el: im, x: p.x, y: p.y, got: false });
      });

      L.root.addEventListener('pointermove', function (e) {
        if (L.finished()) return;
        var p = FO.stage.toStage(e.clientX, e.clientY);
        stars.forEach(function (s) {
          if (s.got || Math.hypot(p.x - s.x, p.y - s.y) > R) return;
          s.got = true;
          FO.audio.sfx('star');
          s.el.classList.add('collect');
          setTimeout(function () { s.el.remove(); }, 500);
          if (prog.inc()) L.done();
        });
      });
    }
  });
})();
