/* Cila katmanı: arka plan hareketi, tıklama parıltısı, Robi'nin göz ucuyla imleci takibi.
 * Hepsi dekoratif; hafif görünümde ve "hareketi azalt" ayarında kapanır. */
(function () {
  'use strict';
  var FO = window.FO;
  var stage = document.getElementById('stage');
  var ambient = FO.el('div', { id: 'ambient' });
  stage.insertBefore(ambient, document.getElementById('hud'));

  function off() { return FO.reducedMotion() || document.body.classList.contains('low-perf'); }

  /* Yukarı süzülen yumuşak ışık kabarcıkları */
  function bubble(initial) {
    if (off() || document.body.classList.contains('teacher-mode')) return;
    var b = FO.el('i', { class: 'amb' });
    var size = 14 + Math.random() * 34, x = Math.random() * 1920;
    b.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:1080px';
    ambient.append(b);
    var dur = 14000 + Math.random() * 12000, sway = (Math.random() - 0.5) * 220;
    var a = b.animate([
      { transform: 'translate(0,0)', opacity: 0 },
      { opacity: 0.55, offset: 0.15 },
      { transform: 'translate(' + sway + 'px,-1180px)', opacity: 0 }
    ], { duration: dur, delay: initial ? -Math.random() * dur : 0, easing: 'ease-in-out' });
    a.onfinish = function () { b.remove(); };
  }
  for (var i = 0; i < 9; i++) bubble(true);
  setInterval(function () { if (!document.hidden && ambient.childElementCount < 11) bubble(false); }, 2200);

  /* Ara sıra ekranı kat eden kelebek (SVG, kanat çırpar) */
  var BCOL = ['#ff8fb8', '#ffb347', '#b58cff'];
  function butterfly() {
    if (off() || document.hidden || document.body.classList.contains('teacher-mode')) return;
    var col = BCOL[Math.floor(Math.random() * BCOL.length)], y0 = 120 + Math.random() * 600, dir = Math.random() < 0.5 ? 1 : -1;
    var b = FO.el('div', { class: 'butterfly' });
    b.innerHTML = '<svg viewBox="0 0 60 50" width="64" height="54"><g class="bw l"><ellipse cx="22" cy="18" rx="17" ry="14" fill="' + col + '"/><ellipse cx="24" cy="36" rx="11" ry="9" fill="' + col + '" opacity=".85"/></g><g class="bw r"><ellipse cx="38" cy="18" rx="17" ry="14" fill="' + col + '"/><ellipse cx="36" cy="36" rx="11" ry="9" fill="' + col + '" opacity=".85"/></g><rect x="28.5" y="12" width="3" height="28" rx="1.5" fill="#2b2b3a"/></svg>';
    b.style.cssText = 'left:0;top:' + y0 + 'px';
    ambient.append(b);
    var x0 = dir > 0 ? -100 : 2020, x1 = dir > 0 ? 2020 : -100, dur = 14000 + Math.random() * 6000;
    var a = b.animate([
      { transform: 'translate(' + x0 + 'px,0)' },
      { transform: 'translate(' + (x0 + (x1 - x0) * 0.25) + 'px,-90px)', offset: 0.25 },
      { transform: 'translate(' + (x0 + (x1 - x0) * 0.5) + 'px,40px)', offset: 0.5 },
      { transform: 'translate(' + (x0 + (x1 - x0) * 0.75) + 'px,-70px)', offset: 0.75 },
      { transform: 'translate(' + x1 + 'px,0)' }
    ], { duration: dur, easing: 'linear' });
    a.onfinish = function () { b.remove(); };
  }
  setTimeout(butterfly, 3000);
  setInterval(function () { if (ambient.querySelectorAll('.butterfly').length < 1 && Math.random() < 0.6) butterfly(); }, 9000);

  /* Parıltı patlaması: stage koordinatında */
  var COLORS = ['#ffd84a', '#ff8fb8', '#7fd0f8', '#9be37a', '#ffffff'];
  function burst(x, y, n, spread) {
    if (off()) return;
    var host = document.getElementById('fx');
    n = n || 8; spread = spread || 90;
    for (var k = 0; k < n; k++) {
      var s = FO.el('i', { class: 'spark' });
      var sz = 10 + Math.random() * 14;
      s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + sz + 'px;height:' + sz + 'px;background:' + COLORS[k % COLORS.length];
      host.append(s);
      var ang = (k / n) * Math.PI * 2 + Math.random() * 0.6, d = spread * (0.6 + Math.random() * 0.7);
      var a = s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + Math.cos(ang) * d + 'px),calc(-50% + ' + (Math.sin(ang) * d + 30) + 'px)) scale(.1)', opacity: 0 }
      ], { duration: 520 + Math.random() * 260, easing: 'cubic-bezier(.2,.7,.3,1)' });
      a.onfinish = function (el) { return function () { el.remove(); }; }(s);
    }
  }
  function ripple(x, y) {
    if (off()) return;
    var r = FO.el('i', { class: 'ripple' });
    r.style.left = x + 'px'; r.style.top = y + 'px';
    document.getElementById('fx').append(r);
    var a = r.animate([
      { transform: 'translate(-50%,-50%) scale(.3)', opacity: .7 },
      { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0 }
    ], { duration: 460, easing: 'ease-out' });
    a.onfinish = function () { r.remove(); };
  }
  FO.fx = { burst: burst, ripple: ripple };

  /* Her tıklamada yumuşak halka (öğretmen ekranı hariç) */
  document.addEventListener('pointerdown', function (e) {
    if (document.body.classList.contains('teacher-mode')) return;
    var p = FO.stage.toStage(e.clientX, e.clientY);
    ripple(p.x, p.y);
  }, true);

  /* Robi imlece doğru hafifçe eğilir */
  var mascot = document.getElementById('mascot');
  var raf = 0, tx = 0;
  document.addEventListener('pointermove', function (e) {
    if (off() || mascot.hidden || raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var r = mascot.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / Math.max(400, window.innerWidth / 2);
      tx = Math.max(-1, Math.min(1, dx)) * 3.2;
      mascot.style.setProperty('--tilt', tx.toFixed(2) + 'deg');
    });
  });
})();
