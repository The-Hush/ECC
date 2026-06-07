/* ============================================================
   Main - bootstrap the game once the DOM and scripts are ready.
   ============================================================ */
(function (G) {
  'use strict';
  function start() {
    G.Game.boot();
    G.Game.applyAudioConfig();
    G.UI.showTitle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.G = window.G || {});
