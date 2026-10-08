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

/* START: WORKS_CHAPTERS_JS */
  // --------------------------------------------------------------------------
  // WORKS CHAPTERS & INTERACTIVE BROWSER SCROLL ENGINE (Phase 5 Fix)
  // --------------------------------------------------------------------------
  function initWorksChapters() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const stages = document.querySelectorAll(".works-chapter-stage");
    const tracker = document.getElementById("works-tracker");
    const currentNumEl = document.getElementById("tracker-current");

    if (!stages.length) return;

    // 1. Sticky Progress Indicator Visibility
    window.ScrollTrigger.create({
      trigger: stages[0],
      start: "top 60%",
      endTrigger: stages[stages.length - 1],
      end: "bottom 30%",
      onEnter: () => tracker && tracker.classList.add("is-visible"),
      onLeave: () => tracker && tracker.classList.remove("is-visible"),
      onEnterBack: () => tracker && tracker.classList.add("is-visible"),
      onLeaveBack: () => tracker && tracker.classList.remove("is-visible"),
    });

    // 2. Per Chapter Setup
    stages.forEach((stage, idx) => {
      const chapterIndex = idx + 1;
      const mockup = stage.querySelector(".browser-mockup");
      const viewport = stage.querySelector(".browser-viewport");
      const scrollImg = stage.querySelector(".browser-scroll-img");

      // Update tracker current number
      window.ScrollTrigger.create({
        trigger: stage,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => {
          if (currentNumEl) currentNumEl.textContent = `0${chapterIndex}`;
        },
        onEnterBack: () => {
          if (currentNumEl) currentNumEl.textContent = `0${chapterIndex}`;
        }
      });

      // Browser mockup entrance reveal
      if (!window.Midnight.isCalm) {
        window.gsap.from(mockup, {
          y: 44,
          opacity: 0.85,
          scale: 0.96,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stage,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        });
      }

      // 3. Dedicated Interactive Frame Scroll (Direct Hover / Drag on Frame only)
      if (viewport && scrollImg) {
        let targetY = 0;
        const scrollSpeedMultiplier = 0.55; // Gentle, natural speed

        function getMaxTravel() {
          const viewportH = viewport.clientHeight;
          const imgH = scrollImg.clientHeight || scrollImg.getBoundingClientRect().height;
          return Math.max(0, imgH - viewportH);
        }

        // Wheel Event inside browser frame
        viewport.addEventListener("wheel", (e) => {
          const maxTravel = getMaxTravel();
          if (maxTravel <= 0) return;

          const scrollingDown = e.deltaY > 0;
          const scrollingUp = e.deltaY < 0;

          const atBottom = targetY >= maxTravel - 2;
          const atTop = targetY <= 2;

          // If reached edges, release wheel event to let main page scroll normally
          if ((scrollingDown && atBottom) || (scrollingUp && atTop)) {
            return;
          }

          // Otherwise, capture wheel and gently scroll screenshot inside the frame
          e.preventDefault();
          targetY = Math.max(0, Math.min(maxTravel, targetY + e.deltaY * scrollSpeedMultiplier));

          window.gsap.to(scrollImg, {
            y: -targetY,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto"
          });
        }, { passive: false });

        // Touch Drag Support for mobile/tablet inside frame
        let touchStartY = 0;
        let isTouching = false;

        viewport.addEventListener("touchstart", (e) => {
          if (e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
            isTouching = true;
          }
        }, { passive: true });

        viewport.addEventListener("touchmove", (e) => {
          if (!isTouching || e.touches.length !== 1) return;
          const currentY = e.touches[0].clientY;
          const delta = (touchStartY - currentY) * 1.1;
          touchStartY = currentY;

          const maxTravel = getMaxTravel();
          if (maxTravel <= 0) return;

          const movingDown = delta > 0;
          const movingUp = delta < 0;
          const atBottom = targetY >= maxTravel - 2;
          const atTop = targetY <= 2;

          if ((movingDown && atBottom) || (movingUp && atTop)) {
            return;
          }

          e.preventDefault();
          targetY = Math.max(0, Math.min(maxTravel, targetY + delta));

          window.gsap.to(scrollImg, {
            y: -targetY,
            duration: 0.35,
            ease: "power1.out",
            overwrite: "auto"
          });
        }, { passive: false });

        viewport.addEventListener("touchend", () => {
          isTouching = false;
        }, { passive: true });
      }
    });

    // Handle incoming hash link smooth scroll (e.g., works.html#chapter-1)
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target && window.Midnight && window.Midnight.lenis()) {
          window.Midnight.lenis().scrollTo(target, { offset: -60 });
        }
      }, 400);
    }
  }

  // Safe bootstrap
  try {
    initWorksChapters();
  } catch (err) {
    console.error("Works chapters initialization error:", err);
  }
  /* END: WORKS_CHAPTERS_JS */

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
