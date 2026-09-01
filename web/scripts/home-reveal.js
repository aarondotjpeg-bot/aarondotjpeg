/* ===========================================================================
   HOME MOUSE REVEAL
   The pink artwork is invisible by default. Wherever the pointer moves over
   the Home panel, irregular clusters of pixels stamp onto the trail as it
   goes — each one holds fully visible for HOLD_MS, then fades from 100% to
   0% over FADE_MS. Every stamp keeps its own timer and its own fixed cell
   pattern (chosen once, not re-rolled every frame), so the trail reads as a
   calm, predictable ribbon instead of flickering noise.

   Two canvases:
     trail   — offscreen. Cleared and fully redrawn every frame from the
               list of still-alive stamps, each at its own age-based
               opacity — see stamps/addStamp/frame below.
     visible — draws the artwork, then keeps only the pixels the trail
               buffer covers (destination-in), so the artwork only shows
               through the trail's current shape.

   Runs only while #home is in the viewport (no point painting an
   off-screen frame) and only for pointer input — prefers-reduced-motion
   skips the whole thing, leaving the plain page underneath, which is a
   complete page on its own.
   =========================================================================== */
(function () {
  'use strict';

  var canvas = document.querySelector('.home__reveal');
  var panel = document.getElementById('home');
  if (!canvas || !panel) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  var trail = document.createElement('canvas');
  var tctx = trail.getContext('2d');

  var img = new Image();
  var imgReady = false;
  img.src = 'assets/img/home-reveal.webp';
  img.decoding = 'async';
  img.onload = function () { imgReady = true; };

  var BLOCK = 20;             // css px per individual pixel cell
  var CLUSTER_RADIUS = 5;     // cells out from center for the dense core
  var FRAGMENT_RADIUS = 7;    // cells out to for sparse, low-chance outlier fragments
  var FRAGMENT_CHANCE = 0.07; // flat chance a fragment-zone cell gets stamped
  var HOLD_MS = 500;          // each stamp stays fully visible this long
  var FADE_MS = 500;          // ...then fades 100% -> 0% over this long
  var MIN_STAMP_GAP_MS = 45;  // don't add a new stamp more often than this — keeps the trail calm

  var dpr = Math.max(1, window.devicePixelRatio || 1);
  var pointerX = null, pointerY = null;
  var active = false;      // #home is in the viewport
  var raf = null;

  function resize() {
    var rect = panel.getBoundingClientRect();
    var cssW = rect.width, cssH = rect.height;
    [canvas, trail].forEach(function (c) {
      c.width = Math.max(1, Math.round(cssW * dpr));
      c.height = Math.max(1, Math.round(cssH * dpr));
      c.style.width = cssW + 'px';
      c.style.height = cssH + 'px';
    });
  }

  var lastMoveAt = 0;
  var lastStampAt = 0;
  var lastStampX = null, lastStampY = null; // css*dpr px, for interpolating fast swipes

  function onPointerMove(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      pointerX = pointerY = null;
      return;
    }
    pointerX = x;
    pointerY = y;
    lastMoveAt = performance.now();
  }

  /* Picks which cells belong to one stamp: a dense core (chance falls off
     with distance, so the core's own edge is ragged, not a rounded disc)
     plus a sparse fragment ring beyond it — a few stray pixels reading as
     debris off the main cluster. Rolled once per stamp and kept fixed for
     that stamp's whole lifetime, not re-rolled every frame — that
     per-frame re-roll was what made the effect read as flickering noise. */
  function pickCells() {
    var cells = [];
    for (var i = -FRAGMENT_RADIUS; i <= FRAGMENT_RADIUS; i++) {
      for (var j = -FRAGMENT_RADIUS; j <= FRAGMENT_RADIUS; j++) {
        var dist = Math.sqrt(i * i + j * j);
        if (dist > FRAGMENT_RADIUS) continue;
        var chance = dist <= CLUSTER_RADIUS
          ? 1 - dist / (CLUSTER_RADIUS + 0.75)
          : FRAGMENT_CHANCE;
        if (Math.random() <= chance) cells.push([i, j]);
      }
    }
    return cells;
  }

  var stamps = []; // { gx, gy, cells, t }

  function addStamp(cx, cy) {
    var block = BLOCK * dpr;
    stamps.push({
      gx: Math.floor(cx / block) * block,
      gy: Math.floor(cy / block) * block,
      cells: pickCells(),
      t: performance.now()
    });
  }

  /* One frame's worth of stamping: a cluster at the current position, plus
     clusters interpolated back to wherever the last stamp landed, so a
     fast swipe paints a continuous swath instead of leaving gaps between
     frames. Throttled by MIN_STAMP_GAP_MS so a fast swipe doesn't pile up
     dozens of overlapping stamps in one go. */
  function stamp() {
    if (pointerX === null) return;
    var now = performance.now();
    if (now - lastStampAt < MIN_STAMP_GAP_MS) return;
    lastStampAt = now;

    var x = pointerX * dpr, y = pointerY * dpr;
    if (lastStampX === null) {
      addStamp(x, y);
    } else {
      var dx = x - lastStampX, dy = y - lastStampY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var step = (BLOCK * dpr) * 0.8;
      var steps = Math.max(1, Math.min(8, Math.ceil(dist / step)));
      for (var s = 1; s <= steps; s++) {
        addStamp(lastStampX + (dx * s) / steps, lastStampY + (dy * s) / steps);
      }
    }
    lastStampX = x;
    lastStampY = y;
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!active || !imgReady) return;

    var now = performance.now();

    if (now - lastMoveAt > HOLD_MS + FADE_MS) {
      pointerX = pointerY = null;
      lastStampX = lastStampY = null;
    } else {
      stamp();
    }

    // Redraw the trail from scratch: each stamp at its own age-based
    // opacity, oldest first so a fresher stamp overlapping an older one
    // reads as the newer, more opaque one.
    var block = BLOCK * dpr;
    tctx.clearRect(0, 0, trail.width, trail.height);
    tctx.globalCompositeOperation = 'source-over';
    var alive = [];
    for (var k = 0; k < stamps.length; k++) {
      var st = stamps[k];
      var age = now - st.t;
      if (age > HOLD_MS + FADE_MS) continue;
      alive.push(st);
      var opacity = age <= HOLD_MS ? 1 : 1 - (age - HOLD_MS) / FADE_MS;
      tctx.fillStyle = 'rgba(255,255,255,' + opacity + ')';
      for (var c = 0; c < st.cells.length; c++) {
        var cell = st.cells[c];
        tctx.fillRect(st.gx + cell[0] * block, st.gy + cell[1] * block, block, block);
      }
    }
    stamps = alive;

    // Draw the artwork "cover"-fit, then clip it to the trail's shape.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    var dw = img.naturalWidth * scale;
    var dh = img.naturalHeight * scale;
    var dx2 = (canvas.width - dw) / 2;
    var dy2 = (canvas.height - dh) / 2;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, dx2, dy2, dw, dh);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(trail, 0, 0);
  }

  var io = new IntersectionObserver(function (entries) {
    active = entries[0].isIntersecting;
  }, { threshold: 0 });
  io.observe(panel);

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  raf = requestAnimationFrame(frame);
})();
