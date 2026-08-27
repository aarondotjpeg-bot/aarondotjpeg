/* World Wide Web carousel (artboard 7). Native scroll-snap does the actual
   centering; this only adds three things the browser doesn't give for free:
     - mouse click-drag (touch/trackpad already scroll the track natively)
     - the infinite-loop illusion, via cloned slides at each end
     - the caption crossfading to whichever slide is centered

   touch-action: pan-y (in project.css) is what lets a vertical touch swipe
   fall through to the page's own scroll instead of being captured here.
*/
(() => {
  const FADE_MS = 160; // must match --dur-fast in tokens.css
  const FLICK_PX_PER_MS = 0.5; // release speed above which a slide gets nudged an extra step
  const IDLE_MS = 120; // no-scroll gap that means the carousel has settled

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  function initCarousel(root) {
    const track = root.querySelector('[data-carousel-track]');
    const stage = root.closest('.stage');
    const caption = stage && stage.querySelector('[data-carousel-caption]');
    const loop = root.hasAttribute('data-loop');
    const realSlides = Array.from(track.children);
    const realCount = realSlides.length;
    if (!track || !realCount) return;

    if (loop) {
      const before = realSlides.map((li) => li.cloneNode(true));
      const after = realSlides.map((li) => li.cloneNode(true));
      [...before, ...after].forEach((li) => {
        li.setAttribute('aria-hidden', 'true');
        li.setAttribute('tabindex', '-1');
      });
      before.reverse().forEach((li) => track.insertBefore(li, track.firstChild));
      after.forEach((li) => track.appendChild(li));
    }

    const slides = Array.from(track.children);
    const homeIndex = loop ? realCount : 0; // index of the first real slide in `slides`

    const centerOf = (li) => li.offsetLeft + li.offsetWidth / 2;
    const targetScrollLeft = (li) => centerOf(li) - track.clientWidth / 2;
    const nearestIndex = () => {
      const want = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((li, i) => {
        const d = Math.abs(centerOf(li) - want);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };

    track.scrollLeft = targetScrollLeft(slides[homeIndex]);

    let fadeTimer = null;
    const setCaption = (index) => {
      if (!caption) return;
      const realIndex = ((index % realCount) + realCount) % realCount;
      const title = realSlides[realIndex].querySelector('img').dataset.title;
      if (caption.textContent === title) return;
      caption.setAttribute('data-fading', '');
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => {
        caption.textContent = title;
        caption.removeAttribute('data-fading');
      }, FADE_MS);
    };

    const realSpan = loop ? centerOf(slides[homeIndex + realCount]) - centerOf(slides[homeIndex]) : 0;

    let idleTimer = null;
    const onSettled = () => {
      let ni = nearestIndex();
      if (loop) {
        if (ni < realCount) {
          track.scrollLeft += realSpan;
          ni += realCount;
        } else if (ni >= realCount * 2) {
          track.scrollLeft -= realSpan;
          ni -= realCount;
        }
      }
      setCaption(ni);
    };

    track.addEventListener('scroll', () => {
      setCaption(nearestIndex());
      clearTimeout(idleTimer);
      idleTimer = setTimeout(onSettled, IDLE_MS);
    }, { passive: true });

    // Mouse click-drag only — touch and trackpad already scroll natively.
    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let samples = [];

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      startX = e.clientX;
      startScrollLeft = track.scrollLeft;
      samples = [{ t: performance.now(), x: e.clientX }];
      track.setPointerCapture(e.pointerId);
      track.setAttribute('data-dragging', '');
      e.preventDefault();
    });

    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      track.scrollLeft = startScrollLeft - (e.clientX - startX);
      const now = performance.now();
      samples.push({ t: now, x: e.clientX });
      while (samples.length > 2 && now - samples[0].t > 100) samples.shift();
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      track.releasePointerCapture(e.pointerId);
      track.removeAttribute('data-dragging');

      let nudge = 0;
      if (samples.length > 1) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          const speed = (last.x - first.x) / dt; // px/ms, screen space
          if (speed < -FLICK_PX_PER_MS) nudge = 1;
          else if (speed > FLICK_PX_PER_MS) nudge = -1;
        }
      }

      const target = Math.min(Math.max(nearestIndex() + nudge, 0), slides.length - 1);
      track.scrollTo({ left: targetScrollLeft(slides[target]), behavior: 'smooth' });
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        track.scrollLeft = targetScrollLeft(slides[nearestIndex()]);
      }, 100);
    });
  }
})();
