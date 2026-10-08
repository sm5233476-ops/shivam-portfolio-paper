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
  // WORKS CHAPTERS & BROWSER SCROLL ENGINE (Animation Plan 8)
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

    // 2. Per Chapter: Mockup Rise + Tall Screenshot Scroll Scrub
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

      // Tall screenshot scrub inside browser viewport
      function setupImageScrub() {
        if (!viewport || !scrollImg) return;

        const viewportHeight = viewport.clientHeight;
        const imgHeight = scrollImg.naturalHeight
          ? (scrollImg.clientWidth / scrollImg.naturalWidth) * scrollImg.naturalHeight
          : scrollImg.clientHeight;

        const travelDistance = Math.max(0, imgHeight - viewportHeight);

        if (travelDistance > 20 && !window.Midnight.isCalm) {
          window.gsap.fromTo(
            scrollImg,
            { y: 0 },
            {
              y: -travelDistance,
              ease: "none",
              scrollTrigger: {
                trigger: stage,
                start: "top 70%",
                end: "bottom 20%",
                scrub: 0.7,
                invalidateOnRefresh: true
              }
            }
          );
        }
      }

      // If image is already cached/loaded, calculate immediately; else wait for load
      if (scrollImg.complete) {
        setupImageScrub();
      } else {
        scrollImg.addEventListener("load", setupImageScrub, { once: true });
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
