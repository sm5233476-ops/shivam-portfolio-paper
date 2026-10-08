/**
 * MIDNIGHT SIGNATURE - WORKS PAGE CONTROLLER
 * Developer: Shivam Mishra
 * Controls chapter stages and interactive screenshot scroll for works.html
 */

(function () {
  "use strict";

  /* ==========================================================================
     PHASE MODULE SLOTS
     ========================================================================== */

  /* START: WORKS_CHAPTERS_JS */
  // --------------------------------------------------------------------------
  // WORKS CHAPTERS & INTERACTIVE BROWSER SCROLL ENGINE
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
      if (!window.Midnight || !window.Midnight.isCalm) {
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

      // 3. Dedicated Interactive Frame Scroll (Isolated - Never chains to outer page)
      if (viewport && scrollImg) {
        // Prevent Lenis smooth scroll from hijacking events inside this frame
        viewport.setAttribute("data-lenis-prevent", "true");

        let targetY = 0;
        const scrollSpeedMultiplier = 0.55; // Gentle, natural scroll speed

        function getMaxTravel() {
          const viewportH = viewport.clientHeight;
          const imgH = scrollImg.clientHeight || scrollImg.getBoundingClientRect().height;
          return Math.max(0, imgH - viewportH);
        }

        // Wheel Event: Strictly isolated to mockup viewport
        viewport.addEventListener("wheel", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const maxTravel = getMaxTravel();
          if (maxTravel <= 0) return;

          // Clamped strictly between 0 and maxTravel (locks at edges)
          targetY = Math.max(0, Math.min(maxTravel, targetY + e.deltaY * scrollSpeedMultiplier));

          window.gsap.to(scrollImg, {
            y: -targetY,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto"
          });
        }, { passive: false });

        // Touch Drag Event: Strictly isolated on mobile/tablet
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
          e.preventDefault();
          e.stopPropagation();

          const currentY = e.touches[0].clientY;
          const delta = (touchStartY - currentY) * 1.1;
          touchStartY = currentY;

          const maxTravel = getMaxTravel();
          if (maxTravel <= 0) return;

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
  /* END: WORKS_CHAPTERS_JS */

 /* START: WORKS_FOOTER_JS */
  // --------------------------------------------------------------------------
  // WORKS FOOTER SIGNATURE CONTROLLER
  // --------------------------------------------------------------------------
  function initWorksFooterSignature() {
    const sigWrap = document.getElementById("footer-sig-wrap");
    if (!sigWrap || !window.opentype) return;

    const fontUrl = "https://cdn.jsdelivr.net/fontsource/fonts/pinyon-script@latest/latin-400-normal.woff";

    window.opentype.load(fontUrl, (err, font) => {
      if (err || !font) return;

      try {
        const path = font.getPath("Shivam", 0, 0, 140);
        const box = path.getBoundingBox();

        const width = box.x2 - box.x1;
        const height = box.y2 - box.y1;
        const padX = width * 0.15;
        const padY = height * 0.15;

        const vx = box.x1 - padX;
        const vy = box.y1 - padY;
        const vw = width + padX * 2;
        const vh = height + padY * 2;

        const pathData = path.toPathData(2);

        sigWrap.innerHTML = `
          <svg viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" aria-label="Shivam">
            <path id="works-footer-sig-path" d="${pathData}"></path>
          </svg>
        `;

        const pathEl = document.getElementById("works-footer-sig-path");
        if (!pathEl || !window.gsap || !window.ScrollTrigger) return;

        const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 800;

        window.gsap.set(pathEl, {
          strokeDasharray: len,
          strokeDashoffset: len,
          fill: "transparent"
        });

        // Scrub write-on signature as user scrolls to footer
        window.gsap.to(pathEl, {
          strokeDashoffset: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#site-footer",
            start: "top 80%",
            end: "bottom 95%",
            scrub: window.Midnight && window.Midnight.isCalm ? false : 0.8
          }
        });
      } catch (e) {
        console.warn("Works footer signature render error:", e);
      }
    });
  }

  try {
    initWorksFooterSignature();
  } catch (e) {
    console.error("Works footer signature error:", e);
  }
  /* END: WORKS_FOOTER_JS */
  // --------------------------------------------------------------------------
  // SAFE INITIALIZATION BOOTSTRAP
  // --------------------------------------------------------------------------
  function initWorksPage() {
    if (typeof window.Midnight === "undefined") {
      setTimeout(initWorksPage, 50);
      return;
    }

    try {
      initWorksChapters();
    } catch (err) {
      console.error("Works page initialization error:", err);
    }

    // Refresh calculations once ready
    window.Midnight.refreshScrollTrigger();
  }

  // Ensure DOM is ready before executing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorksPage);
  } else {
    initWorksPage();
  }
})();
