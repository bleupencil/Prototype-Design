/* ==========================================================================
   Accessible Community Communication — prototype behaviour
   --------------------------------------------------------------------------
   Plain JavaScript, no dependencies. Works from file:// in Chrome.

   What this file does:
     1. Screen routing (hash-based) with focus management
     2. Chapter-completion state (localStorage, with an in-memory fallback)
     3. Progress display (text + decorative bar + journey + chapter list)
     4. Accordions (disclosure pattern, several can be open at once)
     5. Mock actions (download, missing chapters, prototype tools)
     6. Assessment form validation and mock submission
     7. Skip link (moves focus to <main> without changing the screen address)
     8. Accessibility menu: text size, text mode, page mask, print, help
     9. Footer notes (opens when someone follows the "how data is stored" link)
   ========================================================================== */
(function () {
  'use strict';

  var TOTAL_CHAPTERS = 9;
  var STORAGE_KEY = 'acc-community-comm-prototype-v1';
  var PACKAGE_NAME = 'Accessible Community Communication (prototype)';

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /*
    Writes a message into a role="status" element. Clearing first and writing
    on the next frame makes screen readers re-announce identical messages
    (e.g. pressing the same button twice).
  */
  function announce(el, message, tone) {
    if (!el) return;
    el.textContent = '';
    el.classList.remove('is-success', 'is-info');
    window.setTimeout(function () {
      el.textContent = message;
      if (tone) el.classList.add('is-' + tone);
    }, 50);
  }

  /* ------------------------------------------------------------------------
     2. State and storage
     PRIVACY: only the list of completed chapter numbers is stored, in this
     browser's localStorage. No personal details, answers or files are stored.
     If storage is blocked (e.g. some private-browsing modes), progress is kept
     in memory for this visit only and the footer says so.
     ------------------------------------------------------------------------ */
  var storageAvailable = (function () {
    try {
      var k = '__test__';
      window.localStorage.setItem(k, k);
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  var state = { completed: [] };

  function loadState() {
    if (!storageAvailable) return;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.completed)) {
        // Keep only valid chapter numbers so corrupted data can't fake progress.
        state.completed = parsed.completed.filter(function (n) {
          return Number.isInteger(n) && n >= 1 && n <= TOTAL_CHAPTERS;
        });
      }
    } catch (e) { /* ignore corrupt data and start fresh */ }
  }

  function saveState() {
    if (!storageAvailable) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /*
    DEMONSTRATION SIMULATION. Whenever the Chapter 5 or Assessment screen has been
    viewed, Chapters 1 to 4 are treated as completed for display. This is held in
    memory only: it is never written to localStorage and it is not a record of
    anything the learner did. The 40% and 49% values on those two screens are fixed
    in the HTML, so saved progress can never contradict them.
  */
  var DEMO_ROUTES = ['chapter-5', 'assessment'];
  var DEMO_COMPLETED = [1, 2, 3, 4];
  var simulated = false;

  function isStoredComplete(n) { return state.completed.indexOf(n) !== -1; }
  function isSimulatedOnly(n) {
    return simulated && DEMO_COMPLETED.indexOf(n) !== -1 && !isStoredComplete(n);
  }
  function isComplete(n) {
    return isStoredComplete(n) || (simulated && DEMO_COMPLETED.indexOf(n) !== -1);
  }
  function completedCount() {
    var count = 0;
    for (var n = 1; n <= TOTAL_CHAPTERS; n++) if (isComplete(n)) count++;
    return count;
  }

  function setComplete(n, done) {
    var has = isStoredComplete(n);
    if (done && !has) state.completed.push(n);
    if (!done && has) state.completed = state.completed.filter(function (c) { return c !== n; });
    state.completed.sort(function (a, b) { return a - b; });
    saveState();
    renderProgress();
  }

  function progressText() {
    var text = completedCount() + ' of ' + TOTAL_CHAPTERS + ' chapters completed';
    // Say so in words when any of the completed chapters are simulated.
    if (DEMO_COMPLETED.some(isSimulatedOnly)) text += ' (simulated)';
    return text;
  }

  /* ------------------------------------------------------------------------
     3. Progress display
     On the overview, progress means chapters completed out of nine, never time
     spent. The Chapter 5 and Assessment screens show fixed demonstration
     percentages written directly in the HTML (see the simulation note above).
     ------------------------------------------------------------------------ */
  function buildJourney() {
    var track = $('[data-journey]');
    if (!track) return;
    var html = '';
    for (var i = 1; i <= TOTAL_CHAPTERS; i++) {
      html += '<span class="journey__node" data-journey-node="' + i + '">' + i + '</span>';
      if (i === 3) {
        html += '<span class="journey__line"></span><span class="journey__break">10-min break</span>';
      }
      if (i < TOTAL_CHAPTERS) html += '<span class="journey__line"></span>';
    }
    track.innerHTML = html;
  }

  function renderProgress() {
    var text = progressText();

    $all('[data-progress-text]').forEach(function (el) { el.textContent = text; });

    $all('[data-journey-node]').forEach(function (el) {
      el.classList.toggle('is-complete', isComplete(Number(el.getAttribute('data-journey-node'))));
    });

    // Chapter list: visible "Completed" text, so status isn't shown by colour alone.
    $all('[data-chapter-list] [data-chapter]').forEach(function (li) {
      var n = Number(li.getAttribute('data-chapter'));
      var status = $('[data-chapter-status]', li);
      if (status) {
        status.textContent = isSimulatedOnly(n) ? '✓ Completed (simulated)' : (isComplete(n) ? '✓ Completed' : '');
      }
    });

    // Mark-complete button label reflects the current state.
    $all('[data-complete-button]').forEach(function (btn) {
      var n = Number(btn.getAttribute('data-chapter-id'));
      btn.textContent = isStoredComplete(n) ? 'Mark chapter as not complete' : 'Mark chapter complete';
    });
  }

  /* ------------------------------------------------------------------------
     1. Routing
     Routes use "#/name" so ordinary in-page links (skip link, error summary)
     can still use "#id" without changing screen.
     ------------------------------------------------------------------------ */
  var ROUTES = ['overview', 'chapter-5', 'assessment', 'resources'];
  var currentRoute = null;

  function routeFromHash() {
    var m = window.location.hash.match(/^#\/([\w-]+)/);
    return m && ROUTES.indexOf(m[1]) !== -1 ? m[1] : null;
  }

  function showScreen(route, moveFocus) {
    if (route === currentRoute) return;
    currentRoute = route;

    // Viewing Chapter 5 or the Assessment switches on the simulated Chapters 1 to 4.
    if (DEMO_ROUTES.indexOf(route) !== -1 && !simulated) {
      simulated = true;
      renderProgress();
    }

    $all('[data-screen]').forEach(function (screen) {
      var active = screen.getAttribute('data-screen') === route;
      screen.classList.toggle('is-active', active);
      // hidden removes inactive screens from the accessibility tree and tab order.
      screen.hidden = !active;
      if (active) {
        document.title = screen.getAttribute('data-title') + ' – ' + PACKAGE_NAME;
      }
    });

    // aria-current tells screen-reader users which screen they are on.
    $all('[data-route-link]').forEach(function (link) {
      if (link.getAttribute('data-route-link') === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    updateStickyOffset();

    if (moveFocus) {
      // Like a page load: start at the top and move focus to the new <h1>,
      // so screen-reader users hear where they are and keyboard users
      // continue from the top of the new screen.
      // On small or zoomed screens, focus() then scrolls just enough to show the h1.
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      var h1 = $('[data-screen="' + route + '"] h1');
      if (h1) h1.focus();
    }
  }

  function onHashChange() {
    var route = routeFromHash();
    if (route) showScreen(route, true);
    // Non-route hashes (e.g. #main, #about-data) are normal in-page links.
  }

  /* Keeps scroll-padding equal to the sticky header height so that keyboard
     focus is never hidden behind it (WCAG 2.4.11 Focus Not Obscured). */
  var stickyBar = null;
  function updateStickyOffset() {
    var offset = 0;
    if (stickyBar && currentRoute === 'chapter-5' &&
        window.getComputedStyle(stickyBar).position === 'sticky') {
      offset = stickyBar.offsetHeight;
    }
    document.documentElement.style.setProperty('--sticky-offset', offset + 'px');
  }

  /* ------------------------------------------------------------------------
     4. Accordions — WAI-ARIA disclosure pattern.
     - Native <button> inside a heading: keyboard (Enter/Space) and focus come free.
     - aria-expanded exposes the open/closed state; aria-controls links to the panel.
     - Each accordion is independent, so several can be open at once.
     - The state is added by JS: without JS, panels stay visible.
     ------------------------------------------------------------------------ */
  function initAccordions() {
    $all('[data-accordion-trigger]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Chapter completion and mock actions
     ------------------------------------------------------------------------ */
  function initChapterCompletion() {
    var status = $('[data-complete-status]');
    $all('[data-complete-button]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = Number(btn.getAttribute('data-chapter-id'));
        var nowDone = !isStoredComplete(n);
        setComplete(n, nowDone);
        // Focus stays on the button; the change is announced via role="status".
        // The percentage at the top of this screen is a fixed demonstration value,
        // so the message says so rather than implying it has changed.
        var note = ' The progress shown at the top of this screen is a fixed demonstration value (40%).';
        announce(status, nowDone
          ? 'Chapter ' + n + ' marked complete in this prototype.' + note
          : 'Chapter ' + n + ' marked as not complete in this prototype.' + note,
          nowDone ? 'success' : 'info');
      });
    });
  }

  function initMockActions() {
    var navStatus = $('[data-chapter-nav-status]');
    $all('[data-missing-chapter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        announce(navStatus, 'Chapter ' + btn.getAttribute('data-missing-chapter') +
          ' isn’t included in this prototype. Use the Prototype screens menu at the top to visit the Overview or the Assessment.', 'info');
      });
    });

    var dlBtn = $('[data-mock-download]');
    var dlStatus = $('[data-download-status]');
    if (dlBtn) {
      dlBtn.addEventListener('click', function () {
        announce(dlStatus, 'Prototype: no file is downloaded. The full notice text is shown below. Copy it into your word processor.', 'info');
      });
    }

    var toolsStatus = $('[data-tools-status]');
    var simulate = $('[data-simulate]');
    if (simulate) {
      simulate.addEventListener('click', function () {
        [1, 2, 3, 4].forEach(function (n) { if (!isComplete(n)) state.completed.push(n); });
        state.completed.sort(function (a, b) { return a - b; });
        saveState();
        renderProgress();
        announce(toolsStatus, 'Simulated for review: Chapters 1 to 4 marked complete. ' + progressText() + '.', 'success');
      });
    }

    var resetAll = $('[data-reset-all]');
    if (resetAll) {
      resetAll.addEventListener('click', function () {
        state.completed = [];
        if (storageAvailable) {
          try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
        }
        // The simulation stays on only while a demonstration screen is showing.
        simulated = DEMO_ROUTES.indexOf(currentRoute) !== -1;
        renderProgress();
        announce($('[data-complete-status]'), '');
        announce(toolsStatus, 'All prototype data cleared. ' + progressText() + '.', 'info');
      });
    }

    var storageStatus = $('[data-storage-status]');
    if (storageStatus && !storageAvailable) {
      storageStatus.textContent = 'Note: this browser is blocking local storage, so progress will be lost when you close or reload the page.';
      storageStatus.classList.add('is-info');
    }
  }

  /* ------------------------------------------------------------------------
     6. Assessment form — validation and mock submission
     Error pattern (WCAG 3.3.1, 3.3.3, 4.1.2):
       - error summary at the top that receives focus and links to each field
       - inline message next to each field, connected with aria-describedby
       - aria-invalid on the field
     Nothing is uploaded: only the chosen file's name and extension are read.
     ------------------------------------------------------------------------ */
  function initAssessment() {
    var form = $('[data-assess-form]');
    if (!form) return;
    var summary = $('[data-error-summary]', form);
    var list = $('[data-error-list]', form);
    var confirmation = $('[data-confirmation]');
    var confirmList = $('[data-confirm-summary]');

    function setError(id, message) {
      var field = document.getElementById(id);
      var msg = $('[data-error-for="' + id + '"]');
      if (field) {
        if (message) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
      }
      if (msg) {
        msg.textContent = message || '';
        msg.hidden = !message;
      }
    }

    function checkGroup(name) {
      return $all('input[name="' + name + '"]', form).every(function (cb) { return cb.checked; });
    }

    function validate() {
      var errors = [];
      var textChecks = [
        ['barrier-1', 'Describe a barrier for community group 1'],
        ['barrier-2', 'Describe a barrier for community group 2'],
        ['barrier-3', 'Describe a barrier for community group 3'],
        ['change-1', 'Describe your plain-language change'],
        ['reason-1', 'Explain why your plain-language change helps readers'],
        ['change-2', 'Describe your document-structure change'],
        ['reason-2', 'Explain why your document-structure change helps readers']
      ];

      // Barrier fields come first so errors are listed in the same order as the form.
      textChecks.slice(0, 3).forEach(function (c) {
        if (!document.getElementById(c[0]).value.trim()) errors.push([c[0], c[1], c[0]]);
      });
      textChecks = textChecks.slice(3);

      if (!checkGroup('plain')) errors.push(['checklist-plain', 'Tick all four items in the plain language checklist', 'pl-1']);
      if (!checkGroup('structure')) errors.push(['checklist-structure', 'Tick all four items in the document structure checklist', 'st-1']);

      textChecks.forEach(function (c) {
        if (!document.getElementById(c[0]).value.trim()) errors.push([c[0], c[1], c[0]]);
      });

      var file = document.getElementById('revised-file');
      if (!file.files || !file.files.length) {
        errors.push(['revised-file', 'Choose your revised notice as a .docx file', 'revised-file']);
      } else if (!/\.docx$/i.test(file.files[0].name)) {
        errors.push(['revised-file', 'The file must be a .docx Word document. You chose “' + file.files[0].name + '”', 'revised-file']);
      }

      // Clear all, then set current errors.
      ['barrier-1', 'barrier-2', 'barrier-3', 'checklist-plain', 'checklist-structure', 'change-1', 'reason-1', 'change-2', 'reason-2', 'revised-file']
        .forEach(function (id) { setError(id, ''); });
      errors.forEach(function (e) { setError(e[0], e[1]); });
      return errors;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var errors = validate();

      if (errors.length) {
        confirmation.hidden = true;
        list.innerHTML = '';
        errors.forEach(function (e) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + e[2];
          a.textContent = e[1];
          // Move focus straight to the field rather than changing the URL hash.
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            var target = document.getElementById(e[2]);
            if (target) target.focus();
          });
          li.appendChild(a);
          list.appendChild(li);
        });
        summary.hidden = false;
        summary.focus();
        return;
      }

      // Valid: show an honest confirmation. No result or grade is produced.
      summary.hidden = true;
      var fileName = document.getElementById('revised-file').files[0].name;
      confirmList.innerHTML = '';
      [
        'File selected (not uploaded): ' + fileName,
        'Barriers described for three community groups',
        'Checklist confirmed: plain language (4 of 4 items)',
        'Checklist confirmed: document structure (4 of 4 items)',
        'Two change-and-reason explanations written'
      ].forEach(function (t) {
        var li = document.createElement('li');
        li.textContent = t;
        confirmList.appendChild(li);
      });
      confirmation.hidden = false;
      confirmation.focus();
    });

    // Clear an inline error as soon as the learner fixes that field.
    form.addEventListener('change', function (event) {
      var t = event.target;
      if (t.name === 'plain' && checkGroup('plain')) setError('checklist-plain', '');
      if (t.name === 'structure' && checkGroup('structure')) setError('checklist-structure', '');
      if (t.id === 'revised-file' && t.files.length && /\.docx$/i.test(t.files[0].name)) setError('revised-file', '');
    });
    form.addEventListener('input', function (event) {
      var t = event.target;
      if (t.tagName === 'TEXTAREA' && t.value.trim()) setError(t.id, '');
    });

    var resetBtn = $('[data-reset-form]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        confirmation.hidden = true;
        summary.hidden = true;
        var first = document.getElementById('pl-1');
        if (first) first.focus();
      });
    }
  }

  /* ------------------------------------------------------------------------
     7. Skip link
     Moves focus to <main> and scrolls it into view. preventDefault stops the
     address changing to "#main", which would drop the current screen from the
     URL. This works the same on every screen, including after hash navigation,
     because <main> is shared by all screens. Without JavaScript the plain
     href="#main" link still works.
     ------------------------------------------------------------------------ */
  function initSkipLink() {
    var skip = $('.skip-link');
    var main = $('#main');
    if (!skip || !main) return;
    skip.addEventListener('click', function (event) {
      event.preventDefault();
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }

  /* ------------------------------------------------------------------------
     8. Accessibility menu
     - A disclosure button (aria-expanded / aria-controls) reveals a panel of
       ordinary buttons. Focus stays on the button when the panel opens, and Tab
       moves into the panel. Escape closes it and returns focus to the button.
       It also closes when focus tabs out of it or the page is clicked elsewhere.
     - Settings are kept in memory only, so they reset on reload.
     - Text size changes the root font size as a percentage, so it multiplies
       the browser's own text-size setting instead of replacing it. Browser zoom
       and keyboard shortcuts are untouched.
     - Buttons at their limit use aria-disabled (not disabled) so keyboard focus
       is never lost when the limit is reached.
     ------------------------------------------------------------------------ */
  function initAccessibility() {
    var root = document.documentElement;
    var box = $('[data-a11y]');
    if (!box) return;
    var toggle = $('[data-a11y-toggle]', box);
    var panel = $('[data-a11y-panel]', box);
    var statusEl = $('[data-a11y-status]', box);
    var helpToggle = $('[data-a11y-help-toggle]', box);
    var helpPanel = document.getElementById('a11y-help');

    function say(message) { announce(statusEl, message, 'info'); }
    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

    function setHelp(open) {
      helpToggle.setAttribute('aria-expanded', String(open));
      helpPanel.hidden = !open;
    }
    function openMenu() {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }
    function closeMenu(returnFocus) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      setHelp(false);
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) closeMenu(false); else openMenu();
    });
    helpToggle.addEventListener('click', function () {
      setHelp(helpToggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        event.preventDefault();
        closeMenu(true);
      }
    });
    document.addEventListener('click', function (event) {
      if (isOpen() && !box.contains(event.target)) closeMenu(false);
    });
    // relatedTarget is null when a click lands on something that can't take
    // focus (and in Safari), so only close when focus clearly moved elsewhere.
    box.addEventListener('focusout', function (event) {
      if (isOpen() && event.relatedTarget && !box.contains(event.relatedTarget)) closeMenu(false);
    });

    /* ---- Text size ---- */
    var SIZES = [100, 125, 150, 175, 200];
    var sizeIndex = 0;
    var sizeValue = $('[data-a11y-size-value]', box);
    var smaller = $('[data-a11y-smaller]', box);
    var larger = $('[data-a11y-larger]', box);
    var resetSize = $('[data-a11y-reset-size]', box);

    function applySize() {
      var pct = SIZES[sizeIndex];
      if (pct === 100) {
        root.style.removeProperty('font-size');
        root.removeAttribute('data-text-scale');
      } else {
        root.style.fontSize = pct + '%';
        root.setAttribute('data-text-scale', String(pct));
      }
      sizeValue.textContent = pct + '%';
      smaller.setAttribute('aria-disabled', String(sizeIndex === 0));
      larger.setAttribute('aria-disabled', String(sizeIndex === SIZES.length - 1));
      updateStickyOffset();
    }
    smaller.addEventListener('click', function () {
      if (sizeIndex === 0) { say('Text is already at the smallest setting, 100%.'); return; }
      sizeIndex--; applySize(); say('Text size ' + SIZES[sizeIndex] + '%.');
    });
    larger.addEventListener('click', function () {
      if (sizeIndex === SIZES.length - 1) { say('Text is already at the largest setting, 200%.'); return; }
      sizeIndex++; applySize(); say('Text size ' + SIZES[sizeIndex] + '%.');
    });
    resetSize.addEventListener('click', function () {
      sizeIndex = 0; applySize(); say('Text size reset to 100%.');
    });
    applySize();

    /* ---- Text mode ---- */
    var textBtn = $('[data-a11y-textmode]', box);
    textBtn.addEventListener('click', function () {
      var on = textBtn.getAttribute('aria-pressed') !== 'true';
      root.classList.toggle('text-mode', on);
      textBtn.setAttribute('aria-pressed', String(on));
      $('[data-a11y-state]', textBtn).textContent = on ? 'On' : 'Off';
      updateStickyOffset();
      say(on ? 'Text mode on.' : 'Text mode off.');
    });

    /* ---- Page mask (reading band) ----
       A fixed overlay that dims everything except one band. pointer-events: none
       lets clicks and touches pass through, and the overlay is aria-hidden, so it
       never affects keyboard navigation or screen readers. The band follows the
       pointer, a finger, and keyboard focus. */
    var maskBtn = $('[data-a11y-mask]', box);
    var mask = document.createElement('div');
    mask.className = 'page-mask';
    mask.setAttribute('aria-hidden', 'true');
    mask.hidden = true;
    var maskWindow = document.createElement('div');
    maskWindow.className = 'page-mask__window';
    mask.appendChild(maskWindow);
    document.body.appendChild(mask);

    var maskOn = false;
    var lastY = Math.round(window.innerHeight * 0.4);

    function moveMask(centreY) {
      var h = maskWindow.offsetHeight;
      var top = Math.max(0, Math.min(window.innerHeight - h, centreY - h / 2));
      maskWindow.style.top = top + 'px';
    }
    document.addEventListener('pointermove', function (e) {
      lastY = e.clientY;
      if (maskOn) moveMask(lastY);
    }, { passive: true });
    ['touchstart', 'touchmove'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        if (!e.touches || !e.touches.length) return;
        lastY = e.touches[0].clientY;
        if (maskOn) moveMask(lastY);
      }, { passive: true });
    });
    document.addEventListener('focusin', function () {
      if (!maskOn) return;
      // Wait a frame so the browser has finished scrolling the focused item into view.
      window.requestAnimationFrame(function () {
        var el = document.activeElement;
        if (!el || el === document.body) return;
        var rect = el.getBoundingClientRect();
        var half = maskWindow.offsetHeight / 2;
        lastY = rect.top + Math.min(rect.height / 2, half);
        moveMask(lastY);
      });
    });
    maskBtn.addEventListener('click', function () {
      maskOn = maskBtn.getAttribute('aria-pressed') !== 'true';
      maskBtn.setAttribute('aria-pressed', String(maskOn));
      $('[data-a11y-state]', maskBtn).textContent = maskOn ? 'On' : 'Off';
      mask.hidden = !maskOn;
      if (maskOn) moveMask(lastY);
      say(maskOn ? 'Page mask on. The reading band follows your pointer and keyboard focus.' : 'Page mask off.');
    });

    /* ---- Print or save as PDF ---- */
    $('[data-a11y-print]', box).addEventListener('click', function () {
      // Close the menu first so focus returns somewhere predictable; the print
      // stylesheet hides the menu either way.
      closeMenu(true);
      window.setTimeout(function () { window.print(); }, 50);
    });
  }

  /* ------------------------------------------------------------------------
     9. Footer notes
     The data-storage and reviewer notes sit in a collapsed <details>. Following
     the "How this prototype stores data" link opens it and moves focus to its
     heading. preventDefault keeps the current screen in the address.
     ------------------------------------------------------------------------ */
  function initFooterNotes() {
    var details = $('[data-footer-notes]');
    if (!details) return;
    function showNotes() {
      details.open = true;
      var heading = document.getElementById('about-data');
      if (heading) {
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    }
    document.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a[href="#about-data"]') : null;
      if (!link) return;
      event.preventDefault();
      showNotes();
    });
    window.addEventListener('hashchange', function () {
      if (window.location.hash === '#about-data') showNotes();
    });
    if (window.location.hash === '#about-data') showNotes();
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  function init() {
    stickyBar = $('[data-sticky-bar]');
    loadState();
    buildJourney();
    renderProgress();
    initAccordions();
    initChapterCompletion();
    initMockActions();
    initAssessment();
    initSkipLink();
    initAccessibility();
    initFooterNotes();

    // First load: show the screen in the URL but don't move focus,
    // so screen readers start reading from the top as on any page load.
    showScreen(routeFromHash() || 'overview', false);

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('resize', updateStickyOffset);
    if ('ResizeObserver' in window && stickyBar) {
      new ResizeObserver(updateStickyOffset).observe(stickyBar);
    }
  }

  init();
})();
