/* ===========================================================================
   TYPEWRITER
   Erases the last word of the About headline one letter at a time, then
   types the next word in — looping through the word list on .ab-word's
   data-words attribute. The underscore cursor beside it never moves; only
   the word itself is touched. Respects prefers-reduced-motion by leaving
   the word exactly as written in the HTML.
   =========================================================================== */
(function () {
  'use strict';

  var word = document.querySelector('.ab-word');
  if (!word) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var words = (word.dataset.words || word.textContent).split(',');
  if (words.length < 2) return;

  var TYPE_MS = 80;
  var ERASE_MS = 50;
  var PAUSE_AFTER_TYPE_MS = 1500;
  var PAUSE_AFTER_ERASE_MS = 200;

  var index = 0;
  var char = words[0].length; // the HTML already shows the first word fully typed
  var typing = false;         // so the first move is to start erasing it

  function tick() {
    var current = words[index];
    if (typing) {
      char++;
      word.textContent = current.slice(0, char);
      if (char === current.length) {
        typing = false;
        setTimeout(tick, PAUSE_AFTER_TYPE_MS);
        return;
      }
      setTimeout(tick, TYPE_MS);
    } else {
      char--;
      word.textContent = current.slice(0, char);
      if (char === 0) {
        index = (index + 1) % words.length;
        typing = true;
        setTimeout(tick, PAUSE_AFTER_ERASE_MS);
        return;
      }
      setTimeout(tick, ERASE_MS);
    }
  }

  setTimeout(tick, PAUSE_AFTER_TYPE_MS);
})();
