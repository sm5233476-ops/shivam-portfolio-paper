/**
 * MIDNIGHT SIGNATURE - HOME PAGE CONTROLLER
 * Developer: Shivam Mishra
 * Controls animations and interactions for index.html
 */

(function () {
  "use strict";

  /* ==========================================================================
     PHASE MODULE SLOTS (Will be populated in upcoming phases)
     ========================================================================== */

  /* SLOT: HOME_INTRO */

  /* SLOT: HOME_HERO */

  /* SLOT: HOME_MARQUEE */

  /* SLOT: HOME_ABOUT */

  /* SLOT: HOME_WORK */

  /* SLOT: HOME_SKILLS */

  /* SLOT: HOME_CONTACT */

  /* SLOT: HOME_FOOTER */

  // --------------------------------------------------------------------------
  // SAFE INITIALIZATION BOOTSTRAP
  // --------------------------------------------------------------------------
  function initHomePage() {
    // Check if core engine is available
    if (typeof window.Midnight === "undefined") {
      console.warn("Midnight core engine not yet ready. Retrying...");
      setTimeout(initHomePage, 50);
      return;
    }

    // Refresh layout calculations once ready
    window.Midnight.refreshScrollTrigger();
  }

  // Ensure DOM is ready before executing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomePage);
  } else {
    initHomePage();
  }
})();
