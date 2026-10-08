/**
 * MIDNIGHT SIGNATURE - CORE ENGINE
 * Developer: Shivam Mishra
 * Shared across index.html and works.html
 */

(function () {
  "use strict";

  // 1. FAIL-SAFE: Immediately replace no-js with has-js on root
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("has-js");

  // 2. CONTACT DATA (The single source of truth)
  window.CONTACT = {
    name: "Shivam Mishra",
    email: "8hivammishra8@gmail.com",
    whatsapp: "919899452192",
    instagram: "shivam.0nyx",
  };

  // 3. FEATURE SWITCHES
  window.SITE = {
    INTRO: true,
    MOTION_LEVEL: "rich", // "rich" or "calm"
    CURSOR: "none", // "none" or "ring"
    AMBIENT: true,
    SIGNATURE_FONT: "pinyon-script",
    SHOW_TOOLS_LINE: true,
  };

  // 4. MOTION ENVIRONMENT CHECKS
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCalmMode = window.SITE.MOTION_LEVEL === "calm" || prefersReducedMotion;

  // 5. LENIS + GSAP UNIFIED RAF LOOP
  let lenisInstance = null;

  function initSmoothScroll() {
    if (typeof window.Lenis === "undefined") {
      console.warn("Lenis library not detected. Running native scroll.");
      return;
    }

    lenisInstance = new window.Lenis({
      duration: isCalmMode ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    if (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
      lenisInstance.on("scroll", window.ScrollTrigger.update);

      window.gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });

      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // 6. CONTACT LINK GENERATORS & DOM FILLER
  function getWhatsAppUrl(customText) {
    const text = customText || "Hi Shivam, I saw your portfolio and would like to discuss a website.";
    return `https://wa.me/${window.CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  function getEmailUrl(customSubject) {
    const subject = customSubject || "Website project";
    return `mailto:${window.CONTACT.email}?subject=${encodeURIComponent(subject)}`;
  }

  function getInstagramUrl() {
    return `https://instagram.com/${window.CONTACT.instagram}`;
  }

  function fillContactLinks() {
    // Fill WhatsApp triggers
    document.querySelectorAll('[data-contact="whatsapp"]').forEach((el) => {
      const msg = el.getAttribute("data-msg");
      el.href = getWhatsAppUrl(msg);
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });

    // Fill Email triggers
    document.querySelectorAll('[data-contact="email"]').forEach((el) => {
      const sub = el.getAttribute("data-subject");
      el.href = getEmailUrl(sub);
    });

    // Fill Instagram triggers
    document.querySelectorAll('[data-contact="instagram"]').forEach((el) => {
      el.href = getInstagramUrl();
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      // Update label if the element is meant to display the handle
      if (el.getAttribute("data-contact-text") === "handle") {
        el.textContent = `@${window.CONTACT.instagram}`;
      }
    });
  }

  // 7. TEXT SPLITTER (Preserves real spaces and layout stability)
  function splitWords(element) {
    if (!element || element.dataset.splitDone === "true") return [];

    const rawText = element.textContent.trim();
    if (!rawText) return [];

    const words = rawText.split(/\s+/);
    element.innerHTML = "";
    element.dataset.splitDone = "true";

    const wordInners = [];

    words.forEach((word, index) => {
      const wrap = document.createElement("span");
      wrap.className = "word-wrap";
      wrap.setAttribute("aria-hidden", "true");

      const inner = document.createElement("span");
      inner.className = "word-inner";
      inner.textContent = word;

      wrap.appendChild(inner);
      element.appendChild(wrap);
      wordInners.push(inner);

      // Preserve real space between words
      if (index < words.length - 1) {
        const space = document.createTextNode(" ");
        element.appendChild(space);
      }
    });

    // Accessibility: preserve accessible name for assistive technology
    element.setAttribute("aria-label", rawText);

    return wordInners;
  }

  // 8. ANIMATION HELPERS (GSAP based with calm mode fallback)
  function reveal(targets, options = {}) {
    if (!window.gsap || !targets) return;

    if (isCalmMode) {
      return window.gsap.fromTo(
        targets,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: options.duration || 0.7,
          stagger: options.stagger || 0.06,
          ease: "power2.out",
          scrollTrigger: options.scrollTrigger || null,
        }
      );
    }

    return window.gsap.fromTo(
      targets,
      {
        opacity: 0,
        y: options.y !== undefined ? options.y : 32,
        scale: options.scale !== undefined ? options.scale : 1,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: options.duration || 1.1,
        stagger: options.stagger || 0.08,
        ease: options.ease || "power3.out",
        scrollTrigger: options.scrollTrigger || null,
      }
    );
  }

  function drawPath(pathElement, options = {}) {
    if (!window.gsap || !pathElement) return;

    const length = pathElement.getTotalLength ? pathElement.getTotalLength() : 300;
    window.gsap.set(pathElement, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    return window.gsap.to(pathElement, {
      strokeDashoffset: 0,
      duration: options.duration || 1.4,
      ease: options.ease || "power2.out",
      scrollTrigger: options.scrollTrigger || null,
      delay: options.delay || 0,
    });
  }

  function fillWords(container, options = {}) {
    if (!window.gsap || !window.ScrollTrigger || !container) return;

    const inners = splitWords(container);
    if (!inners.length) return;

    window.gsap.set(inners, { opacity: 0.16 });

    return window.gsap.to(inners, {
      opacity: 1,
      stagger: {
        each: 0.05,
        from: "start",
      },
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: options.start || "top 78%",
        end: options.end || "bottom 55%",
        scrub: isCalmMode ? false : 0.6,
      },
    });
  }

  // 9. TOP PROGRESS LINE
  function initProgressLine() {
    const progressEl = document.getElementById("scroll-progress");
    if (!progressEl) return;

    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        progressEl.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
      },
      { passive: true }
    );
  }

  // 10. NAVIGATION HIGHLIGHT & MOBILE MENU DIALOG
  function initNavigation() {
    // Nav links active state based on page URL
    const currentPath = window.location.pathname.replace(/\/$/, "");
    const isWorks = currentPath.endsWith("works.html") || currentPath.endsWith("/works");

    document.querySelectorAll(".nav-link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (isWorks && href.includes("works.html")) {
        link.classList.add("is-active");
      } else if (!isWorks && (href === "index.html" || href === "./" || href === "#")) {
        // Default highlight handled per section on scroll
      }
    });

    // Mobile menu toggle
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const closeBtn = document.getElementById("mobile-menu-close");
    const menuDialog = document.getElementById("mobile-menu-dialog");

    if (toggleBtn && menuDialog) {
      function openMenu() {
        menuDialog.classList.add("is-open");
        menuDialog.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (lenisInstance) lenisInstance.stop();
        if (closeBtn) closeBtn.focus();
      }

      function closeMenu() {
        menuDialog.classList.remove("is-open");
        menuDialog.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (lenisInstance) lenisInstance.start();
        toggleBtn.focus();
      }

      toggleBtn.addEventListener("click", openMenu);
      if (closeBtn) closeBtn.addEventListener("click", closeMenu);

      // Close when clicking mobile nav links
      menuDialog.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          closeMenu();
        });
      });

      // Close on Escape key
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuDialog.classList.contains("is-open")) {
          closeMenu();
        }
      });
    }
  }

  // 11. CUSTOM RING CURSOR (Only active when SITE.CURSOR === 'ring')
  function initCursorRing() {
    if (window.SITE.CURSOR !== "ring" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let ring = document.getElementById("cursor-ring");
    if (!ring) {
      ring = document.createElement("div");
      ring.id = "cursor-ring";
      document.body.appendChild(ring);
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      },
      { passive: true }
    );

    function loop() {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Enlarge on interactive targets
    const hoverTargets = 'a, button, [role="button"], input, textarea, select';
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverTargets)) {
        ring.classList.add("cursor-hover");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) {
        ring.classList.remove("cursor-hover");
      }
    });
  }

  // 12. IMAGE FALLBACK & PREWARM
  function initImageFallbacks() {
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", function () {
        this.classList.add("img-fallback");
        // Dark placeholder styling
        this.style.backgroundColor = "#111113";
        this.style.border = "1px solid rgba(244, 241, 234, 0.12)";
        this.removeAttribute("src");
      });
    });
  }

  // 13. REFRESH SCROLLTRIGGER AFTER FONTS & ASSETS LOAD
  function refreshScrollTrigger() {
    if (typeof window.ScrollTrigger !== "undefined") {
      window.ScrollTrigger.refresh();
    }
  }

  // 14. PUBLIC API EXPOSURE
  window.Midnight = {
    lenis: () => lenisInstance,
    splitWords,
    reveal,
    drawPath,
    fillWords,
    fillContactLinks,
    getWhatsAppUrl,
    getEmailUrl,
    getInstagramUrl,
    refreshScrollTrigger,
    isCalm: isCalmMode,
    isReducedMotion: prefersReducedMotion,
  };

  // 15. DOM READY BOOTSTRAP
  function onReady() {
    fillContactLinks();
    initSmoothScroll();
    initProgressLine();
    initNavigation();
    initCursorRing();
    initImageFallbacks();

    // Fonts ready refresh
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshScrollTrigger);
    }

    // Window load refresh
    window.addEventListener("load", refreshScrollTrigger);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
