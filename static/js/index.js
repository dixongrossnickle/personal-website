// ==================================  General functions  ==================================

// Return true if event is a click, Enter key, or space bar
function isValidClick(e) {
   if (e.type == 'keydown') {
      let keycode = (e.keyCode ? e.keyCode : e.which);
      if (keycode != '13' && keycode != '32') {
         return false;
      }
   }
   return true;
}

// Show/hide collapsible section
var collapseShown = null;
var hiddenByClick = null;

function toggleCollapse(iconLink, event) {
   let $tgt = $(`#${iconLink.getAttribute('aria-controls')}`);
   let collapseID = $tgt[0].id;
   if (!collapseShown) {
      $tgt.collapse('show');
      collapseShown = collapseID;
   } else if (collapseShown == collapseID) {
      $tgt.collapse('hide');
      collapseShown = null;
      if (event.type == 'click') {
         hiddenByClick = true;
      } else {
         hiddenByClick = false;
      }
   } else {
      $(`#${collapseShown}`).removeClass('show');
      $tgt.addClass('show');
      collapseShown = collapseID;
   }
}

// Copy email to clipboard using Async Clipboard API
function copyToClipboard(text) {
   return new Promise((res, rej) => {
      if (!navigator.clipboard) {
         fallbackCopyToClipboard(text).then(() => {
            $('.tooltip-inner').text('Copied to clipboard.');
         });
         return;
      }
      navigator.clipboard.writeText(text).then(
         () => {
            $('.tooltip-inner').text('Copied to clipboard.');
            res();
         },
         (err) => {
            console.error('Async: Unable to copy email\n', err);
            rej();
         }
      );
   });
}

// Fallback to Async clipboard copy 
function fallbackCopyToClipboard(text) {
   return new Promise((res, rej) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
         document.execCommand('copy');
         res();
      } catch (err) {
         console.error('Fallback: unable to copy email\n ', err);
         rej();
      }
      document.body.removeChild(textArea);
   });
}

// ============  Event listeners  =============

$(document).ready(function() {

   // Add drop shadows on mouseover and focus-in
   $('.icon-link').on("mouseover focusin", function() {
      this.classList.add('img-drop-shadow');
   });

   // Remove shadow on mouseout
   $('.icon-link').on("mouseout", function() {
      if (this != document.activeElement || (!collapseShown && hiddenByClick)) {
         this.classList.remove('img-drop-shadow');
      }
   });

   // Remove shadow on focus-out
   $('.icon-link').on("focusout", function() {
      this.classList.remove('img-drop-shadow');
   });

   // Toggle collapse if click, enter, or spacebar
   $('#skills .icon-link').on("click keydown", function(e) {
      if (isValidClick(e)) {
         toggleCollapse(this, e);
      }
   });

   // Copy email address to clipboard on click; hide tooltip after 2s
   $('#email-btn-link').on("click keydown", function(e) {
      if (isValidClick(e)) {
         copyToClipboard('dixon.grossnickle@gmail.com').then(() => {
            emailTipTimeout = setTimeout(() => {
               $(this).tooltip('hide');
            }, 2000);
         });
      }
   });

   // Initialize collapse
   $('.collapse').collapse({
      toggle: false
   });

   // Initialize tooltip
   $('#email-btn-link').tooltip({
      container: 'body',
      title: 'Copy email address'
   });

});
