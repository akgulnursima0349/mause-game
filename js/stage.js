/* Sahne her zaman 1920x1080 tasarlanır, pencereye sığacak şekilde ölçeklenir.
 * Böylece 1366x768 laptopta da 1920x1080 ekranda da yerleşim aynı kalır. */
(function () {
  'use strict';
  var FO = (window.FO = window.FO || {});
  var stage = document.getElementById('stage');
  var scale = 1;

  function fit() {
    scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.setProperty('--s', scale);
  }
  window.addEventListener('resize', fit);
  fit();

  FO.stage = {
    el: stage,
    W: 1920,
    H: 1080,
    scale: function () { return scale; },
    /* Ekran (client) koordinatını sahne koordinatına çevirir. */
    toStage: function (clientX, clientY) {
      var r = stage.getBoundingClientRect();
      return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
    }
  };
})();
