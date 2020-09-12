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

// Handle AJAX request error
function handleAjaxError(jqXHR, exception) {
    let errorMsg = '';
    if (jqXHR.status == 0) {
        errorMsg = 'Could not connect to server. Please check your network connection.';
    } else if (jqXHR.status == 403) {
        errorMsg = 'Forbidden - CSRF verification failed [403].';
    } else if (jqXHR.status == 404) {
        errorMsg = 'Requested page not found [404].';
    } else if (jqXHR.status == 500) {
        errorMsg = 'Internal server error [500].';
    } else if (exception == 'parsererror') {
        errorMsg = 'Requested JSON parse failed.';
    } else if (exception == 'timeout') {
        errorMsg = 'Request timed out.';
    } else if (exception == 'abort') {
        errorMsg = 'AJAX request aborted.';
    } else {
        errorMsg = 'Uncaught exception.';
        console.log(jqXHR.responseText);
    }
    return errorMsg;
}

// Show/hide collapsible section
var collapseShown = null;
var hiddenByClick = null;
function toggleCollapse(iconLink, event) {
    let $tgt = $(`#${iconLink.getAttribute('aria-controls')}`)
    let collapseID = $tgt[0].id;
    if (!collapseShown) {
        $tgt.collapse('show');
        collapseShown = collapseID;
    } else if (collapseShown === collapseID) {
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

// Animate height change of carousel-inner
function animateCrsl($active, $tgt) {
    let nextHt = $tgt.outerHeight();
    let thisHt = $active.outerHeight();
    if (nextHt > thisHt && $tgt.hasClass('result-item')) {
        $tgt.parent().animate({
            height: nextHt
        }, 600);
    } else if (nextHt < thisHt && $tgt.hasClass('form-item')) {
        $tgt.parent().animate({
            height: nextHt
        }, 600);
    } else {
        $tgt.parent().animate({
            height: $('.form-item').outerHeight()
        }, 200);
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
        navigator.clipboard.writeText(text).then(() => {
            $('.tooltip-inner').text('Copied to clipboard.');
            res();
        }, (err) => {
            console.error('Async: Unable to copy email\n', err);
            rej();
        });
    })
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
    })

    // Remove shadow on focus-out
    $('.icon-link').on("focusout", function() {
        this.classList.remove('img-drop-shadow');
    })

    // Remove shadow on mouseout
    $('.icon-link').on("mouseout", function() {
        if (this != document.activeElement || (!collapseShown && hiddenByClick)) {
            this.classList.remove('img-drop-shadow');
        }
    })

    // Remove shadow if user clicks to hide collapse
    $('#tools .icon-link').on("click keydown", function(e) {
        if (isValidClick(e)) {
            toggleCollapse(this, e);
            if (!collapseShown && e.type == 'click') {
                this.classList.remove('img-drop-shadow');
            }
        }
    });

    // Initialize collapse
    $('.collapse-container div:even').collapse( {'toggle': false} );

    // Initialize tooltip
    $('#email-btn-link').tooltip();

    // Copy email address to clipboard on click; hide tooltip after 2s
    var emailTipTimeout;
    $('#email-btn-link').on("click keydown", function(e) {
        if (isValidClick(e)) {
            copyToClipboard('dixon.grossnickle@gmail.com').then(() => {
                emailTipTimeout = setTimeout(() => {
                    $(this).tooltip('hide');
                }, 2000);
            });
        }
    });

    // Correct heights of .carousel-inner's to prevent overflow issues
    $(window).on('orientationchange resize', () => {
        $('.carousel-inner').attr('style', 'height: auto;');
    });

});