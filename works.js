/**
 * MIDNIGHT SIGNATURE - WORKS PAGE CONTROLLER
 * Developer: Shivam Mishra
 * Controls chapter stages and scroll interactions for works.html
 */

(function () {
  "use strict";

  /* ==========================================================================
     PHASE MODULE SLOTS (Will be populated in upcoming phases)
     ========================================================================== */

  /* SLOT: WORKS_CHAPTERS_INIT */

  /* SLOT: WORKS_FOOTER_INIT */

  // --------------------------------------------------------------------------
  // SAFE INITIALIZATION BOOTSTRAP
  // --------------------------------------------------------------------------
  function initWorksPage() {
    // Check if core engine is ready
    if (typeof window.Midnight === "undefined") {
      console.warn("Midnight core engine not yet ready. Retrying...");
      setTimeout(initWorksPage, 50);
      return;
    }

    // Refresh layout calculations once ready
    window.Midnight.refreshScrollTrigger();
  }

  // Ensure DOM is ready before executing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorksPage);
  } else {
    initWorksPage();
  }
})();
