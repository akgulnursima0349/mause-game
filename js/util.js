(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});

  FO.$ = function (sel, root) { return (root || document).querySelector(sel); };

  /* el('div', {class:'x', onclick:fn, style:{left:'10px'}}, child, 'text') */
  FO.el = function (tag, attrs) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  };

  FO.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  FO.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  FO.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  FO.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  FO.reducedMotion = function () {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  /* Görsel yolları */
  FO.A = function (p) { return 'assets/img/' + p; };

  /* Görsel önyükleme: hata verirse oyunu durdurmaz. */
  var cache = {};
  FO.loadImg = function (url) {
    if (cache[url]) return cache[url];
    cache[url] = new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () { resolve(im); };
      im.onerror = function () { console.warn('Görsel yüklenemedi:', url); resolve(null); };
      im.src = url;
    });
    return cache[url];
  };
  FO.preload = function (paths) {
    return Promise.all(paths.map(function (p) { return FO.loadImg(FO.A(p)); }));
  };

  /* Küçük animasyon yardımcıları (CSS sınıfı ekle, bitince kaldır) */
  FO.flash = function (node, cls, ms) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(function () { node.classList.remove(cls); }, ms || 600);
  };
})();
