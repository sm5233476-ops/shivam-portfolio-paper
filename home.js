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

 /* START: HOME_INTRO */
  // --------------------------------------------------------------------------
  // INTRO ANIMATION CONTROLLER (Animation Plan 1)
  // --------------------------------------------------------------------------
  let resolveIntroPromise;
  window.SITE.introReady = new Promise((resolve) => {
    resolveIntroPromise = resolve;
  });

  const FONT_MAP = {
    "pinyon-script": "https://cdn.jsdelivr.net/fontsource/fonts/pinyon-script@latest/latin-400-normal.woff",
    "great-vibes": "https://cdn.jsdelivr.net/fontsource/fonts/great-vibes@latest/latin-400-normal.woff",
    "allura": "https://cdn.jsdelivr.net/fontsource/fonts/allura@latest/latin-400-normal.woff"
  };

  function playIntroAnimation() {
    const introEl = document.getElementById("intro");
    if (!introEl) {
      if (resolveIntroPromise) resolveIntroPromise();
      return;
    }

    const wrapEl = document.getElementById("intro-svg-wrap");
    const glintEl = document.getElementById("intro-glint");
    const skipBtn = document.getElementById("intro-skip-btn");

    // 1. Checks: Force replay URL, reduced motion, SITE toggle & SessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const forceReplay = urlParams.get("intro") === "1";
    let alreadySeen = false;

    try {
      alreadySeen = window.sessionStorage.getItem("introSeen") === "true";
    } catch (e) {
      alreadySeen = false;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ((alreadySeen && !forceReplay) || !window.SITE.INTRO || prefersReducedMotion) {
      introEl.style.display = "none";
      if (resolveIntroPromise) resolveIntroPromise();
      return;
    }

    // 2. Lock scroll & Lenis while playing
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (window.Midnight && window.Midnight.lenis()) {
      window.Midnight.lenis().stop();
    }

    let isFinished = false;
    let masterTl = null;

    function finishIntro(instant = false) {
      if (isFinished) return;
      isFinished = true;

      try {
        window.sessionStorage.setItem("introSeen", "true");
      } catch (e) {}

      // Unlock scroll & Lenis
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (window.Midnight && window.Midnight.lenis()) {
        window.Midnight.lenis().start();
      }

      if (instant || !window.gsap) {
        if (masterTl) masterTl.kill();
        introEl.style.display = "none";
        if (window.Midnight) window.Midnight.refreshScrollTrigger();
        if (resolveIntroPromise) resolveIntroPromise();
        return;
      }

      window.gsap.to(introEl, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          introEl.style.display = "none";
          if (window.Midnight) window.Midnight.refreshScrollTrigger();
          if (resolveIntroPromise) resolveIntroPromise();
        }
      });
    }

    // Fail-safe 1: 7-second hard cutoff timer
    const hardTimer = setTimeout(() => {
      finishIntro(false);
    }, 7000);

    // Escape key & Skip button listeners
    function onSkip() {
      clearTimeout(hardTimer);
      finishIntro(false);
    }

    if (skipBtn) skipBtn.addEventListener("click", onSkip);
    window.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        window.removeEventListener("keydown", escHandler);
        onSkip();
      }
    });

    // 3. Fallback text renderer if font or opentype fails
    function renderFallback() {
      if (!wrapEl) return;
      wrapEl.innerHTML = '<div class="intro-fallback-text" id="intro-fallback-word">Portfolio</div>';
      const wordEl = document.getElementById("intro-fallback-word");

      masterTl = window.gsap.timeline({
        onComplete: () => {
          clearTimeout(hardTimer);
          finishIntro(false);
        }
      });

      masterTl
        .to(wordEl, { opacity: 1, duration: 1.2, ease: "power2.out" })
        .to(glintEl, { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.7)" }, "-=0.3")
        .to(glintEl, { scale: 1.3, opacity: 0.9, yoyo: true, repeat: 1, duration: 0.25 })
        .to([wordEl, glintEl], { opacity: 0, scale: 1.04, duration: 0.6, ease: "power2.in", delay: 0.4 });
    }

    // 4. Render opentype SVG Path
    function renderVectorSignature(font) {
      try {
        const textToRender = "Portfolio";
        const fontSize = 160;
        const opentypePath = font.getPath(textToRender, 0, 0, fontSize);
        const box = opentypePath.getBoundingBox();

        // 15% safe padding around bounding box
        const width = box.x2 - box.x1;
        const height = box.y2 - box.y1;
        const padX = width * 0.15;
        const padY = height * 0.15;

        const vx = box.x1 - padX;
        const vy = box.y1 - padY;
        const vw = width + padX * 2;
        const vh = height + padY * 2;

        const pathData = opentypePath.toPathData(2);

        wrapEl.innerHTML = `
          <svg viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path id="intro-signature-path" d="${pathData}"></path>
          </svg>
        `;

        const pathEl = document.getElementById("intro-signature-path");
        if (!pathEl || !window.gsap) {
          renderFallback();
          return;
        }

        const totalLength = pathEl.getTotalLength ? pathEl.getTotalLength() : 1800;

        window.gsap.set(pathEl, {
          strokeDasharray: totalLength,
          strokeDashoffset: totalLength,
          fill: "transparent"
        });

        masterTl = window.gsap.timeline({
          onComplete: () => {
            clearTimeout(hardTimer);
            finishIntro(false);
          }
        });

        masterTl
          // Outline draws itself
          .to(pathEl, {
            strokeDashoffset: 0,
            duration: 2.6,
            ease: "power1.inOut"
          })
          // White fill fades in
          .to(pathEl, {
            fill: "#F4F1EA",
            duration: 0.8,
            ease: "power2.out"
          }, "-=0.4")
          // Champagne star glints
          .to(glintEl, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: "back.out(2)"
          }, "-=0.2")
          .to(glintEl, {
            scale: 1.35,
            opacity: 1,
            yoyo: true,
            repeat: 1,
            duration: 0.25
          })
          // Outro: Signature & star scale slightly while fading out
          .to([wrapEl, glintEl], {
            scale: 1.04,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
            delay: 0.3
          });

      } catch (err) {
        console.warn("Error rendering vector signature, switching to fallback:", err);
        renderFallback();
      }
    }

    // 5. Load Font with 2.5s Timeout Fail-safe
    const targetFontKey = window.SITE.SIGNATURE_FONT || "pinyon-script";
    const fontUrl = FONT_MAP[targetFontKey] || FONT_MAP["pinyon-script"];

    let fontLoaded = false;
    const fontTimer = setTimeout(() => {
      if (!fontLoaded) {
        console.warn("Font loading timed out (2.5s). Using fallback.");
        renderFallback();
      }
    }, 2500);

    if (typeof window.opentype !== "undefined") {
      window.opentype.load(fontUrl, (err, font) => {
        clearTimeout(fontTimer);
        fontLoaded = true;
        if (err || !font) {
          console.warn("Could not load opentype font file:", err);
          renderFallback();
        } else {
          renderVectorSignature(font);
        }
      });
    } else {
      clearTimeout(fontTimer);
      renderFallback();
    }
  }

  // Expose Replay method globally
  window.SITE.replayIntro = function () {
    try {
      window.sessionStorage.removeItem("introSeen");
    } catch (e) {}

    const introEl = document.getElementById("intro");
    if (introEl) {
      introEl.style.display = "flex";
      introEl.style.opacity = "1";
      playIntroAnimation();
    }
  };

  // Safe invocation on boot
  try {
    playIntroAnimation();
  } catch (err) {
    console.error("Intro initialization error:", err);
    const introEl = document.getElementById("intro");
    if (introEl) introEl.style.display = "none";
    if (resolveIntroPromise) resolveIntroPromise();
  }
  /* END: HOME_INTRO */

 /* START: HOME_HERO */
  // --------------------------------------------------------------------------
  // AMBIENT LIVING BACKGROUND (Animation Plan 2)
  // --------------------------------------------------------------------------
  function initAmbientBackground() {
    const ambientContainer = document.getElementById("ambient-container");
    if (!ambientContainer || window.SITE.AMBIENT === false || window.Midnight.isReducedMotion) {
      return;
    }

    // 1. Inject 3 radial glow layers
    ambientContainer.innerHTML = `
      <div class="ambient-glow ambient-glow-1" id="ambient-glow-1"></div>
      <div class="ambient-glow ambient-glow-2" id="ambient-glow-2"></div>
      <div class="ambient-glow ambient-glow-3" id="ambient-glow-3"></div>
    `;

    // 2. Inject twinkling champagne stars
    const starCount = 14;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("span");
      star.className = "ambient-star";
      star.textContent = "✦";
      star.style.left = `${(Math.random() * 94 + 3).toFixed(1)}%`;
      star.style.top = `${(Math.random() * 92 + 4).toFixed(1)}%`;
      star.style.fontSize = `${Math.floor(Math.random() * 6 + 7)}px`;
      const duration = (Math.random() * 2.5 + 2.5).toFixed(2);
      const delay = (Math.random() * 3).toFixed(2);
      star.style.animation = `starTwinkle ${duration}s ease-in-out ${delay}s infinite`;
      ambientContainer.appendChild(star);
    }

    if (!window.gsap) return;

    const g1 = document.getElementById("ambient-glow-1");
    const g2 = document.getElementById("ambient-glow-2");
    const g3 = document.getElementById("ambient-glow-3");

    // 3. Slow drift animations (18s-26s yoyo loops)
    const driftTweens = [
      window.gsap.to(g1, { x: 70, y: 50, duration: 20, ease: "sine.inOut", repeat: -1, yoyo: true }),
      window.gsap.to(g2, { x: -80, y: 65, duration: 25, ease: "sine.inOut", repeat: -1, yoyo: true }),
      window.gsap.to(g3, { x: 60, y: -70, duration: 22, ease: "sine.inOut", repeat: -1, yoyo: true })
    ];

    // 4. Soft mouse reaction (max 20px delta)
    const setGlow1X = window.gsap.quickTo(g1, "x", { duration: 1.8, ease: "power2.out" });
    const setGlow1Y = window.gsap.quickTo(g1, "y", { duration: 1.8, ease: "power2.out" });
    const setGlow2X = window.gsap.quickTo(g2, "x", { duration: 2.2, ease: "power2.out" });
    const setGlow2Y = window.gsap.quickTo(g2, "y", { duration: 2.2, ease: "power2.out" });

    let currentMouseX = 0;
    let currentMouseY = 0;

    window.addEventListener("mousemove", (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Clamp between -20px and +20px
      currentMouseX = Math.max(-20, Math.min(20, (e.clientX - centerX) * 0.03));
      currentMouseY = Math.max(-20, Math.min(20, (e.clientY - centerY) * 0.03));

      setGlow1X(currentMouseX);
      setGlow1Y(currentMouseY);
      setGlow2X(-currentMouseX);
      setGlow2Y(-currentMouseY);
    }, { passive: true });

    // 5. Pause when tab is inactive to preserve performance
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        driftTweens.forEach((t) => t.pause());
      } else {
        driftTweens.forEach((t) => t.resume());
      }
    });
  }

  // --------------------------------------------------------------------------
  // HERO REVEAL ANIMATION (Animation Plan 3)
  // --------------------------------------------------------------------------
  function playHeroReveal() {
    const heroTitle = document.getElementById("hero-title");
    if (!heroTitle || !window.gsap) return;

    const wordInners = heroTitle.querySelectorAll(".word-inner");
    const underlinePath = document.getElementById("hero-underline-path");
    const subtext = document.getElementById("hero-subtext");
    const actions = document.getElementById("hero-actions");
    const scrollCue = document.getElementById("hero-scroll-cue");

    // Dynamic underline path length calculation
    const pathLen = underlinePath && underlinePath.getTotalLength ? underlinePath.getTotalLength() : 250;
    if (underlinePath) {
      window.gsap.set(underlinePath, {
        strokeDasharray: pathLen,
        strokeDashoffset: pathLen
      });
    }

    const tl = window.gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    if (window.Midnight.isCalm) {
      // Calm mode: gentle fade & rise without aggressive masks
      tl.to(wordInners, { opacity: 1, y: 0, duration: 0.8, stagger: 0.04 })
        .to(underlinePath, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, "-=0.3")
        .to([subtext, actions, scrollCue], { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.4");
    } else {
      // Rich mode: words rise through masks, champagne underline draws itself
      tl.to(wordInners, {
        y: "0%",
        opacity: 1,
        duration: 1.1,
        stagger: 0.045,
        ease: "power3.out"
      })
      .to(underlinePath, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power2.inOut"
      }, "-=0.5")
      .to(subtext, {
        opacity: 1,
        y: 0,
        duration: 0.9
      }, "-=0.7")
      .to(actions, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, "-=0.6")
      .to(scrollCue, {
        opacity: 1,
        duration: 0.8
      }, "-=0.4");
    }

    // Ensure links are prefilled
    if (window.Midnight && window.Midnight.fillContactLinks) {
      window.Midnight.fillContactLinks();
    }
  }

  // Hook Hero animation to intro completion
  function setupHeroSequence() {
    initAmbientBackground();

    if (window.SITE && window.SITE.introReady && typeof window.SITE.introReady.then === "function") {
      window.SITE.introReady.then(() => {
        playHeroReveal();
      });
    } else {
      playHeroReveal();
    }
  }

  try {
    setupHeroSequence();
  } catch (e) {
    console.error("Hero initialization error:", e);
  }
  /* END: HOME_HERO */

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
