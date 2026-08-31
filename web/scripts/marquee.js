/* ===========================================================================
   EXPERIENCE MARQUEE
   The keyframe in about.css falls back to a flat -50%, which is only exactly
   right when the track's two halves are gapless. They aren't (every entry,
   including the seam between the last real one and the first duplicate,
   carries the same margin now), so a plain percentage drifts. This measures
   the real distance from entry 1 to entry 7 — one full logical loop,
   including that seam's own gap — and drives the animation off that instead.
   Pure position math: no timer, nothing to clean up.
   =========================================================================== */
(function () {
  'use strict';

  var track = document.querySelector('.ab-exp-track');
  if (!track) return;

  var entries = track.querySelectorAll('.ab-exp__entry');
  if (entries.length < 12) return; // needs the real set + the duplicate set

  function measure() {
    var first = entries[0];
    var loopStart = entries[6]; // first entry of the duplicate half
    var distance = loopStart.offsetTop - first.offsetTop;
    if (distance > 0) {
      track.style.setProperty('--marquee-distance', distance + 'px');
    }
  }

  measure();

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });

  /* Satoshi is preloaded, but measure again once everything (fonts
     included) has definitely settled, in case a late font swap reflowed
     the text before the preload finished. */
  window.addEventListener('load', measure);
})();
