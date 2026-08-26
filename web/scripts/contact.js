/* ===========================================================================
   EMAIL
   The href stays a real mailto: — correct semantics, and it opens the mail
   client for anyone who has one registered.

   But a mailto is handed to the operating system, and if no default mail app
   is set the OS silently does nothing. No error, no feedback, and the link
   looks broken. That is common for anyone who reads mail in a browser tab.

   So the click also copies the address and says so. Whichever path the visitor
   is on, something happens.
   =========================================================================== */
(function () {
  'use strict';

  var link = document.querySelector('.ab-email');
  if (!link || !navigator.clipboard || !navigator.clipboard.writeText) return;

  var timer = null;

  link.addEventListener('click', function () {
    /* No preventDefault: the mailto still fires for anyone who can use it. */
    var address = link.getAttribute('href').replace(/^mailto:/, '');
    navigator.clipboard.writeText(address).then(function () {
      link.dataset.copied = '';
      clearTimeout(timer);
      timer = setTimeout(function () { delete link.dataset.copied; }, 1800);
    }).catch(function () { /* clipboard refused; the mailto is unaffected */ });
  });
})();
