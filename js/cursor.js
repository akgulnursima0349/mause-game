/* Çocuğun seçtiği fare, sistem imleci yerine ekranda gezer.
 * İmlecin gerçek ucu (tıklama noktası) farenin üst-orta noktasıdır.
 * Görsel yüklenemezse sistem imleci gizlenmez. Dokunmatik girişte kapalıdır. */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var el = document.getElementById('cursor');
  var HEIGHT = 78;                       // sahne pikseli
  var w = 56, x = -200, y = -200, raf = 0, ready = false, inside = false;

  function render() {
    raf = 0;
    el.style.transform = 'translate3d(' + (x - w / 2) + 'px,' + (y - 6) + 'px,0)';
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(render); }

  function load() {
    ready = false;
    document.body.classList.remove('skin-cursor');
    el.hidden = true;
    if (!FO.state.get('skinCursor')) return;
    if (window.matchMedia && matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches) return;
    var skin = FO.skins.byId(FO.state.get('skin'));
    FO.loadImg(FO.A(skin.file)).then(function (im) {
      if (!im) return;
      w = Math.round(HEIGHT * im.naturalWidth / im.naturalHeight);
      el.innerHTML = '';
      var c = FO.el('img', { src: im.src, alt: '', draggable: 'false' });
      c.style.height = HEIGHT + 'px'; c.style.width = w + 'px';
      el.append(c);
      ready = true;
      document.body.classList.add('skin-cursor');
      el.hidden = !inside;
    });
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') { el.hidden = true; return; }
    var p = FO.stage.toStage(e.clientX, e.clientY);
    x = p.x; y = p.y;
    inside = p.x >= 0 && p.y >= 0 && p.x <= 1920 && p.y <= 1080;
    if (ready) el.hidden = !inside;
    schedule();
  }, { passive: true });
  document.addEventListener('pointerleave', function () { inside = false; el.hidden = true; });
  window.addEventListener('pointerdown', function () { el.classList.add('press'); }, true);
  window.addEventListener('pointerup', function () { el.classList.remove('press'); }, true);

  FO.state.onChange(function (k) { if (k === 'skin' || k === 'skinCursor') load(); });
  FO.cursor = { refresh: load };
  load();
})();
