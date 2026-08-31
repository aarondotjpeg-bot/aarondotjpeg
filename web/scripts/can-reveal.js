/* ===========================================================================
   REPP SPORTS CAN REVEAL
   The four cans fade in right to left (watermelon first, galaxy last —
   data-can-order counts down from the rightmost can) once the panel
   scrolls into view, after a 1.5s pause. Runs once; the observer
   disconnects after the first reveal so it doesn't refire on repeat
   scrolls past the panel.
   =========================================================================== */
(function () {
  'use strict';

  var panel = document.getElementById('repp-sports');
  if (!panel) return;

  var cans = Array.prototype.slice.call(panel.querySelectorAll('.pj-can'));
  if (!cans.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // CSS already shows them fully visible, nothing to do

  cans.sort(function (a, b) {
    return Number(a.dataset.canOrder) - Number(b.dataset.canOrder);
  });

  var START_DELAY_MS = 1500;
  var STAGGER_MS = 180;

  function reveal() {
    cans.forEach(function (can, i) {
      setTimeout(function () {
        can.setAttribute('data-revealed', '');
      }, START_DELAY_MS + i * STAGGER_MS);
    });
  }

  if (!('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        reveal();
        io.disconnect();
      }
    });
  }, { threshold: 0.15 });

  io.observe(panel);
})();
