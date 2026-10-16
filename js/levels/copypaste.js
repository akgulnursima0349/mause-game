/* Ortak kopyala-yapıştır oyunu (seviye 7 ve 14). Düğmeyle çalışır; klavye kısayolu yok. */
(function () {
  'use strict';
  var FO = window.FO;

  var ICON_COPY = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="22" y="18" width="30" height="36" rx="5" fill="#fff"/><rect x="12" y="8" width="30" height="36" rx="5" fill="none" stroke="#fff" stroke-width="5"/></svg>';
  var ICON_PASTE = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="14" width="40" height="44" rx="6" fill="#fff"/><rect x="22" y="6" width="20" height="14" rx="4" fill="#ffd34d" stroke="#fff" stroke-width="3"/><rect x="20" y="30" width="24" height="5" rx="2.5" fill="#43c258"/><rect x="20" y="41" width="16" height="5" rx="2.5" fill="#43c258"/></svg>';

  /* cfg: items[{id,file,x}], size, y, field{x0,x1,y0,y1}, total, pasteW, copyPos{x,y}, pastePos{x,y}, say{hint,copied,pasted}, onDone(L) */
  FO.cpGame = function (L, cfg) {
    var prog = L.progress(cfg.total), selected = null, clip = null, pasted = 0, cards = {}, F = cfg.field;
    var copyBtn, pasteBtn;

    cfg.items.forEach(function (a) {
      var el = FO.el('button', { class: 'animal', type: 'button', 'aria-label': a.id,
        style: { left: (a.x - cfg.size / 2) + 'px', top: (cfg.y - cfg.size / 2) + 'px', width: cfg.size + 'px', height: cfg.size + 'px' } },
        FO.el('img', { src: FO.A(a.file), alt: '', draggable: 'false' }));
      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || L.finished()) return;
        e.preventDefault();
        selected = a; FO.audio.sfx('select'); FO.flash(el, 'bump', 400);
        Object.keys(cards).forEach(function (k) { cards[k].classList.toggle('sel', k === a.id); });
        copyBtn.classList.add('ready', 'pulse');
        L.touch();
      });
      cards[a.id] = el; L.root.append(el);
    });

    L.root.append(FO.el('div', { class: 'paste-field', style: { left: F.x0 + 'px', top: F.y0 - 60 + 'px', width: F.x1 - F.x0 + 'px', height: F.y1 - F.y0 + 100 + 'px' } }));

    copyBtn = FO.el('button', { class: 'cp-btn copy', type: 'button', 'aria-label': 'Kopyala', style: { left: cfg.copyPos.x + 'px', top: cfg.copyPos.y + 'px' } });
    copyBtn.innerHTML = ICON_COPY;
    pasteBtn = FO.el('button', { class: 'cp-btn paste', type: 'button', 'aria-label': 'Yapıştır', style: { left: cfg.pastePos.x + 'px', top: cfg.pastePos.y + 'px' } });
    pasteBtn.innerHTML = ICON_PASTE;
    L.root.append(copyBtn, pasteBtn);

    copyBtn.addEventListener('click', function () {
      if (L.finished()) return;
      if (!selected) { FO.audio.sfx('wrong'); FO.flash(copyBtn, 'shake', 400); L.say(cfg.say.hint, { pose: 'think', after: 'idle' }); return; }
      clip = selected; FO.audio.sfx('ok');
      copyBtn.classList.remove('pulse'); pasteBtn.classList.add('ready', 'pulse');
      FO.flash(copyBtn, 'bump', 400);
      L.say(cfg.say.copied, { pose: 'happy', after: 'idle' });
    });
    pasteBtn.addEventListener('click', function () {
      if (L.finished()) return;
      if (!clip) { FO.audio.sfx('wrong'); FO.flash(pasteBtn, 'shake', 400); return; }
      var w = cfg.pasteW;
      var x = F.x0 + w / 2 + Math.random() * (F.x1 - F.x0 - w), y = F.y0 + w * 0.45 + Math.random() * (F.y1 - F.y0 - w * 0.45);
      L.sprite(clip.file, { x: x, y: y, w: w, cls: 'pasted' });
      FO.audio.sfx('drop'); FO.flash(pasteBtn, 'bump', 400);
      pasted++;
      if (prog.inc()) { pasteBtn.classList.remove('pulse'); cfg.onDone(L); }
      else if (pasted === 1) L.say(cfg.say.pasted, { pose: 'happy', after: 'idle' });
    });
  };
})();
