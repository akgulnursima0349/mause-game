/* Ekran yöneticisi.
 * Bir ekran: FO.router.register('ad', function () { return { assets:[...], mount(root, opts), unmount() }; })
 * mount(root) ekranın DOM'unu kurar; ekran görününce (varsa) start() çağrılır. */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var host = document.getElementById('screen-root');
  var loader = document.getElementById('loader');
  var registry = {}, cur = null, busy = false;

  FO.router = {
    register: function (name, factory) { registry[name] = factory; },
    current: function () { return cur && cur.name; },

    go: async function (name, opts) {
      if (busy || !registry[name]) return;
      busy = true;
      try {
        FO.audio.stopVoice();
        if (cur) {
          cur.root.classList.remove('show');
          await FO.wait(FO.reducedMotion() ? 0 : 320);
          try { cur.inst.unmount && cur.inst.unmount(); } catch (e) { console.error(e); }
          cur.root.remove();
          cur = null;
        }
        var inst = registry[name]();
        var root = FO.el('section', { class: 'screen screen-' + name, 'data-screen': name });
        var timer = setTimeout(function () { loader.hidden = false; }, 250);
        if (inst.assets) await FO.preload(inst.assets);
        await inst.mount(root, opts || {});
        clearTimeout(timer); loader.hidden = true;
        host.append(root);
        cur = { name: name, root: root, inst: inst };
        FO.hud.showHome(name !== 'home');
        void root.offsetWidth;
        root.classList.add('show');
        if (inst.start) inst.start();
      } catch (e) {
        loader.hidden = true;
        console.error('Ekran açılamadı:', name, e);
      } finally {
        busy = false;
      }
    }
  };
})();
