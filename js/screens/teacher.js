/* Öğretmen paneli: PIN → sınıf listesi, öğrenci detayı, ekle/düzenle/sil, CSV ve yedek.
 * Açılış: Ctrl+Shift+S veya ana ekranda logoya 1,5 sn basılı tutma. Çocuklara yönelik değildir, bu yüzden yazılıdır. */
(function () {
  'use strict';
  var FO = window.FO;

  var STEPS = [
    { key: 'parts',     label: 'Bilgisayar parçaları', skill: 'Tanıma ve eşleştirme' },
    { key: 'customize', label: 'Fare seçimi',          skill: 'Tıklama' },
    { key: 'buttons',   label: 'Fare tuşları',         skill: 'Sol/sağ tuş, tekerlek' }
  ];
  var LV = ['Fare hareketi', 'Tek tıklama', 'Çift tıklama', 'Sürükle-bırak', 'Sağ tıklama', 'Fare tekerleği', 'Kopyala-yapıştır',
    'Hikâye girişi (tıklama)', 'Ok tuşları', 'Sürükle-bırak (köprü)', 'Çift tıklama (mağara)', 'Sağ tık + sürükleme', 'Tekerlek + boşluk tuşu', 'Parça birleştirme + Enter', 'Kopyala-yapıştır (fabrika)'];
  for (var i = 0; i < 15; i++) STEPS.push({ key: 'level' + (i + 1), label: 'Seviye ' + (i + 1), skill: LV[i], n: i + 1 });
  var TOTAL = STEPS.length;
  var HARD_HELPS = 6;

  var unlocked = false;               // PIN bu oturumda girildi mi

  function fmtTime(s) { s = Math.round(s || 0); if (s < 60) return s + ' sn'; var m = Math.floor(s / 60); return m + ' dk' + (s % 60 ? ' ' + (s % 60) + ' sn' : ''); }
  function fmtDate(t) { return t ? new Date(t).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; }
  function doneCount(p) { return STEPS.filter(function (s) { return p.progress[s.key]; }).length; }
  function status(p, s) {
    var l = s.n ? p.levels[s.n] : null, done = !!p.progress[s.key];
    if (done) return { t: 'Bitti', c: 'ok' };
    if (l && (l.helps >= HARD_HELPS || l.attempts >= 3)) return { t: 'Zorlandı', c: 'hard' };
    if (l && l.attempts > 0) return { t: 'Devam ediyor', c: 'mid' };
    return { t: 'Başlamadı', c: 'none' };
  }
  function skinLabel(id) { return FO.skins.byId(id).label; }
  function h(tag, cls, text) { var e = FO.el(tag, cls ? { class: cls } : null); if (text != null) e.textContent = text; return e; }
  function btn(text, cls, fn) { var b = FO.el('button', { type: 'button', class: 't-btn ' + (cls || '') }); b.textContent = text; b.addEventListener('click', fn); return b; }

  function download(name, mime, text) {
    var a = FO.el('a', { download: name, href: URL.createObjectURL(new Blob([text], { type: mime })) });
    document.body.append(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvCell(v) { v = String(v == null ? '' : v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function buildCsv() {
    var head = ['Öğrenci', 'Son oynama', 'Toplam süre (dk)', 'Tamamlanan adım', 'Toplam adım'];
    STEPS.forEach(function (s) { head.push(s.label + ' – bitti'); if (s.n) { head.push(s.label + ' – deneme'); head.push(s.label + ' – süre (sn)'); head.push(s.label + ' – yardım'); } });
    var rows = [head];
    FO.profiles.list().forEach(function (p) {
      var r = [p.name, p.lastPlayed ? new Date(p.lastPlayed).toLocaleString('tr-TR') : '', Math.round(p.totalSec / 60), doneCount(p), TOTAL];
      STEPS.forEach(function (s) {
        r.push(p.progress[s.key] ? 1 : 0);
        if (s.n) { var l = p.levels[s.n] || {}; r.push(l.attempts || 0, l.best || '', l.helps || 0); }
      });
      rows.push(r);
    });
    return '﻿' + rows.map(function (r) { return r.map(csvCell).join(';'); }).join('\r\n');
  }

  FO.router.register('teacher', function () {
    var root, sel = null, listEl, detailEl, stageHost, alive = true, offChange;

    /* ---------- PIN ---------- */
    function gate() {
      var hasPin = !!FO.state.get('teacherPin');
      var inp = FO.el('input', { class: 't-pin', type: 'password', inputmode: 'numeric', maxlength: '4', autocomplete: 'off', 'aria-label': 'PIN' });
      var msg = h('p', 't-note', hasPin ? 'PIN’i girin' : 'İlk kullanım: 4 haneli bir PIN belirleyin. Çocukların panele girmesini engeller.');
      var ok = btn(hasPin ? 'Giriş' : 'PIN’i kaydet', 'primary', function () {
        var v = inp.value.replace(/\D/g, '');
        if (v.length !== 4) { msg.textContent = 'PIN 4 rakam olmalı.'; FO.flash(inp, 'shake', 400); return; }
        if (!hasPin) { FO.state.set('teacherPin', v); unlocked = true; build(); return; }
        if (v === FO.state.get('teacherPin')) { unlocked = true; build(); }
        else { msg.textContent = 'PIN yanlış.'; inp.value = ''; FO.flash(inp, 'shake', 400); }
      });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok.click(); });
      var forgot = hasPin ? btn('PIN’i unuttum', 'link', function () {
        var t = window.prompt('PIN sıfırlansın mı? Onaylamak için SIFIRLA yazın (ilerleme verileri silinmez).');
        if (t && t.trim().toUpperCase() === 'SIFIRLA') { FO.state.set('teacherPin', ''); FO.router.go('teacher'); }
      }) : null;
      var back = btn('Oyuna dön', 'link', function () { FO.router.go('home'); });
      stageHost.replaceChildren(FO.el('div', { class: 't-gate' }, h('h1', null, 'Öğretmen Paneli'), msg, inp, FO.el('div', { class: 't-row' }, ok, forgot, back)));
      setTimeout(function () { inp.focus(); }, 60);
    }

    /* ---------- ana yerleşim ---------- */
    function build() {
      listEl = FO.el('div', { class: 't-list' }); detailEl = FO.el('div', { class: 't-detail' });
      var file = FO.el('input', { type: 'file', accept: '.json,application/json', hidden: true });
      file.addEventListener('change', function () {
        var f = file.files && file.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () { try { var n = FO.profiles.importJSON(String(r.result)); window.alert(n + ' öğrenci yüklendi.'); } catch (e) { window.alert('Yedek dosyası okunamadı: ' + e.message); } file.value = ''; };
        r.readAsText(f);
      });
      var tools = FO.el('div', { class: 't-tools' },
        btn('+ Öğrenci ekle', 'primary', function () { editDialog(null); }),
        btn('CSV indir', '', function () { download('fare-ogreniyorum-ilerleme.csv', 'text/csv;charset=utf-8', buildCsv()); }),
        btn('Yedek al', '', function () { download('fare-ogreniyorum-yedek.json', 'application/json', FO.profiles.exportJSON()); }),
        btn('Yedek yükle', '', function () { file.click(); }), file);
      var head = FO.el('div', { class: 't-head' }, h('h1', null, 'Öğretmen Paneli'),
        FO.el('div', { class: 't-row' },
          btn('Oyun ayarları', '', function () { FO.settings.open(); }),
          btn('PIN değiştir', '', function () { var v = (window.prompt('Yeni 4 haneli PIN:') || '').replace(/\D/g, ''); if (v.length === 4) { FO.state.set('teacherPin', v); window.alert('PIN değişti.'); } else if (v) window.alert('PIN 4 rakam olmalı.'); }),
          btn('Oyuna dön', 'primary', function () { FO.router.go('home'); })));
      stageHost.replaceChildren(head, FO.el('div', { class: 't-body' }, FO.el('div', { class: 't-left' }, tools, listEl), detailEl));
      paintList(); paintDetail();
    }

    function paintList() {
      if (!listEl) return;
      listEl.replaceChildren();
      var all = FO.profiles.list().sort(function (a, b) { return a.name.localeCompare(b.name, 'tr'); });
      if (!all.length) listEl.append(h('p', 't-note', 'Henüz öğrenci yok. “+ Öğrenci ekle” ile başlayın.'));
      all.forEach(function (p) {
        var n = doneCount(p);
        var row = FO.el('button', { type: 'button', class: 't-student' + (p.id === sel ? ' sel' : '') },
          FO.el('img', { src: FO.A(p.avatar), alt: '', draggable: 'false' }),
          FO.el('div', { class: 't-s-main' }, h('b', null, p.name),
            FO.el('div', { class: 't-bar' }, FO.el('i', { style: { width: (n / TOTAL * 100) + '%' } })),
            h('small', null, n + '/' + TOTAL + ' · son: ' + fmtDate(p.lastPlayed))));
        row.addEventListener('click', function () { sel = p.id; paintList(); paintDetail(); });
        listEl.append(row);
      });
    }

    function paintDetail() {
      if (!detailEl) return;
      detailEl.replaceChildren();
      var p = sel && FO.profiles.get(sel);
      if (!p) { classSummary(); return; }
      var n = doneCount(p);
      var top = FO.el('div', { class: 't-d-top' },
        FO.el('img', { src: FO.A(p.avatar), alt: '', draggable: 'false' }),
        FO.el('div', null, h('h2', null, p.name),
          FO.el('div', { class: 't-chips' },
            h('span', 't-chip', 'Tamamlanan: ' + n + '/' + TOTAL),
            h('span', 't-chip', 'Toplam süre: ' + fmtTime(p.totalSec)),
            h('span', 't-chip', 'Son oynama: ' + fmtDate(p.lastPlayed)),
            h('span', 't-chip', 'Fare: ' + skinLabel(p.skin)))),
        FO.el('div', { class: 't-d-actions' },
          btn('Bu öğrenci olarak oyna', 'primary', function () { FO.profiles.setCurrent(p.id); FO.router.go(FO.resumeTarget()); }),
          btn('Düzenle', '', function () { editDialog(p.id); }),
          btn('İlerlemeyi sıfırla', 'warn', function () { if (window.confirm(p.name + ' için tüm ilerleme ve istatistikler silinsin mi?')) FO.profiles.reset(p.id); }),
          btn('Sil', 'warn', function () { if (window.confirm(p.name + ' tamamen silinsin mi? Bu işlem geri alınamaz.')) { FO.profiles.remove(p.id); sel = null; } })));
      var tb = FO.el('table', { class: 't-table' }, FO.el('thead', null, FO.el('tr', null,
        h('th', null, 'Adım'), h('th', null, 'Beceri'), h('th', null, 'Durum'), h('th', null, 'Deneme'), h('th', null, 'Süre'), h('th', null, 'Yardım'))));
      var body = FO.el('tbody');
      STEPS.forEach(function (s) {
        var l = s.n ? (p.levels[s.n] || {}) : {}, st = status(p, s);
        var tr = FO.el('tr', null, h('td', null, s.label), h('td', null, s.skill),
          FO.el('td', null, h('span', 't-st ' + st.c, st.t)),
          h('td', null, s.n ? (l.attempts || 0) : '—'),
          h('td', null, s.n ? (l.best ? fmtTime(l.best) : '—') : (p.doneAt[s.key] ? fmtDate(p.doneAt[s.key]) : '—')),
          h('td', null, s.n ? (l.helps || 0) : '—'));
        body.append(tr);
      });
      tb.append(body);
      detailEl.append(top, FO.el('div', { class: 't-table-wrap' }, tb),
        h('p', 't-note', '“Yardım”: Robi’nin çocuğu yönlendirme sayısı. ' + HARD_HELPS + ' ve üzeri ya da 3+ deneme “Zorlandı” sayılır. Süre: en iyi tamamlama.'));
    }

    function classSummary() {
      var all = FO.profiles.list();
      var finished = all.filter(function (p) { return doneCount(p) === TOTAL; }).length;
      var avg = all.length ? Math.round(all.reduce(function (a, p) { return a + doneCount(p) / TOTAL; }, 0) / all.length * 100) : 0;
      var hard = STEPS.filter(function (s) { return s.n; }).map(function (s) {
        var h2 = 0, c = 0; all.forEach(function (p) { var l = p.levels[s.n]; if (l && l.attempts) { c++; h2 += l.helps || 0; } });
        return { s: s, avg: c ? h2 / c : 0, c: c };
      }).filter(function (x) { return x.c > 0 && x.avg > 0; }).sort(function (a, b) { return b.avg - a.avg; }).slice(0, 3);
      detailEl.append(h('h2', null, 'Sınıf özeti'),
        FO.el('div', { class: 't-chips big' },
          h('span', 't-chip', 'Öğrenci: ' + all.length), h('span', 't-chip', 'Hepsini bitiren: ' + finished), h('span', 't-chip', 'Ortalama ilerleme: %' + avg)),
        h('h3', null, 'En çok yardım gerektiren beceriler'));
      if (!hard.length) detailEl.append(h('p', 't-note', 'Henüz yeterli veri yok. Çocuklar oynadıkça burada hangi becerilerde zorlandıkları görünür.'));
      hard.forEach(function (x) { detailEl.append(h('p', 't-hard', x.s.label + ' – ' + x.s.skill + ' (çocuk başına ortalama ' + x.avg.toFixed(1) + ' yardım)')); });
      detailEl.append(h('p', 't-note', 'Soldan bir öğrenci seçerek detayını görün. Veriler bu bilgisayarın tarayıcısında saklanır; başka bilgisayara taşımak için “Yedek al / Yedek yükle”yi kullanın.'));
    }

    /* ---------- ekle / düzenle ---------- */
    function editDialog(id) {
      var p = id ? FO.profiles.get(id) : null, avatar = p ? p.avatar : FO.avatars[0];
      var name = FO.el('input', { class: 't-input', type: 'text', maxlength: '28', placeholder: 'Çocuğun adı', 'aria-label': 'Ad' });
      name.value = p ? p.name : '';
      var grid = FO.el('div', { class: 't-avatars' });
      FO.avatars.forEach(function (a) {
        var b = FO.el('button', { type: 'button', class: 't-av' + (a === avatar ? ' sel' : '') }, FO.el('img', { src: FO.A(a), alt: '', draggable: 'false' }));
        b.addEventListener('click', function () { avatar = a; grid.querySelectorAll('.t-av').forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); });
        grid.append(b);
      });
      var layer = FO.el('div', { class: 't-modal' });
      function close() { layer.remove(); }
      function save() {
        if (!name.value.trim()) { FO.flash(name, 'shake', 400); return; }
        if (p) FO.profiles.update(p.id, { name: name.value, avatar: avatar });
        else { var np = FO.profiles.add(name.value, avatar); sel = np.id; }
        close();
      }
      name.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
      layer.append(FO.el('div', { class: 't-dialog' }, h('h2', null, p ? 'Öğrenciyi düzenle' : 'Yeni öğrenci'),
        h('label', 't-label', 'Ad'), name, h('label', 't-label', 'Resim (çocuk kendini bu resimden tanır)'), grid,
        FO.el('div', { class: 't-row end' }, btn('İptal', '', close), btn('Kaydet', 'primary', save))));
      root.append(layer); setTimeout(function () { name.focus(); }, 50);
    }

    return {
      assets: ['ui/btn_home.png'].concat(FO.avatars),
      mount: function (r) {
        root = r;
        document.body.classList.add('teacher-mode');
        stageHost = FO.el('div', { class: 't-screen' });
        root.append(stageHost);
        offChange = function (k) { if (alive && unlocked && (k === 'profiles' || k === 'progress')) { paintList(); paintDetail(); } };
        FO.state.onChange(offChange);
        if (unlocked) build(); else gate();
      },
      start: function () { FO.mascot.hide(); },
      unmount: function () { alive = false; document.body.classList.remove('teacher-mode'); }
    };
  });

  FO.teacher = { open: function () { FO.router.go('teacher'); } };
})();
