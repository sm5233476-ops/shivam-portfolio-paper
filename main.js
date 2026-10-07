/* ==========================================================================
   THE DESK — PERSONAL PORTFOLIO OF SHIVAM MISHRA
   Creative Development Engine (GSAP, ScrollTrigger, Lenis & Handcrafted Motion)
   ========================================================================== */

/* --------------------------------------------------------------------------
   01. CONFIGURATION SWITCHES & CONTACT CONTRACT
   -------------------------------------------------------------------------- */
window.SITE = {
  INTRO: true,
  MOTION_LEVEL: "rich", // "rich" = full creative paper motion; "calm" = simple fades & rise only
  PENCIL_CURSOR: false
};

// THE ONLY SOURCE OF TRUTH FOR CONTACT DETAILS
window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// PROJECT DATA FOR PULL-OUT SHEET DRAWER
const PROJECTS_DATA = [
  {
    number: "01",
    name: "Lumina Dental Studio",
    desc: "Dental clinic website. Booking flow, financing calculator, before/after slider.",
    url: "https://lumina-dental-studio-iota.vercel.app/",
    image: "dental.jpg"
  },
  {
    number: "02",
    name: "Ironcrest Roofing & Restoration",
    desc: "Roofing company website. Instant estimate calculator, inspection booking, project sliders.",
    url: "https://roofing-portfolio-two.vercel.app/",
    image: "roofing.jpg"
  },
  {
    number: "03",
    name: "Cinder & Cedar Coffee Roasters",
    desc: "Online coffee store. Product search, cart drawer, demo checkout, subscriptions.",
    url: "https://cinder-cedar-coffee-roasters.vercel.app/",
    image: "coffee.jpg"
  }
];

// Motion safety flag for <head> fallback
window.__motionReady = true;
if (window.__motionTimeout) {
  clearTimeout(window.__motionTimeout);
}

/* --------------------------------------------------------------------------
   02. WORD SPLITTER (No Paid Plugins; Real Spaces Preserved)
   -------------------------------------------------------------------------- */
function splitElementIntoWords(element) {
  if (!element) return [];
  const words = [];

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text.trim()) return;

      const tokens = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();

      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
        } else if (token.length > 0) {
          const mask = document.createElement("span");
          mask.className = "word-mask";
          const span = document.createElement("span");
          span.className = "word";
          span.textContent = token;
          mask.appendChild(span);
          frag.appendChild(mask);
          words.push(span);
        }
      });

      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains("circled-word")) {
        const mask = document.createElement("span");
        mask.className = "word-mask";
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = node.textContent;
        mask.appendChild(span);
        node.textContent = "";
        node.appendChild(mask);
        words.push(span);
      } else if (!node.classList.contains("doodle-circle") && !node.classList.contains("doodle-arrow")) {
        Array.from(node.childNodes).forEach(processNode);
      }
    }
  }

  Array.from(element.childNodes).forEach(processNode);
  return words;
}

/* --------------------------------------------------------------------------
   03. CONTACT & LINK HYDRATION
   -------------------------------------------------------------------------- */
function hydrateContactLinks() {
  const c = window.CONTACT;

  // WhatsApp prefilled URL
  const waMessage = encodeURIComponent("Hi Shivam, I saw your portfolio and would like to discuss a website.");
  const waUrl = `https://wa.me/${c.whatsapp}?text=${waMessage}`;

  // Email mailto URL
  const mailSubject = encodeURIComponent("Website project");
  const emailUrl = `mailto:${c.email}?subject=${mailSubject}`;

  // Instagram URL
  const instaUrl = `https://instagram.com/${c.instagram}`;

  // Hero WhatsApp button
  const heroWa = document.getElementById("hero-whatsapp");
  if (heroWa) {
    heroWa.href = waUrl;
  }

  // Contact Stamp 1: WhatsApp
  const contactWa = document.getElementById("contact-whatsapp");
  const valWa = document.getElementById("val-whatsapp");
  if (contactWa) {
    contactWa.href = waUrl;
  }
  if (valWa) {
    valWa.textContent = "Chat on WhatsApp";
  }

  // Contact Stamp 2: Email
  const contactEmail = document.getElementById("contact-email");
  const valEmail = document.getElementById("val-email");
  if (contactEmail) {
    contactEmail.href = emailUrl;
  }
  if (valEmail) {
    valEmail.textContent = c.email;
  }

  // Contact Stamp 3: Instagram
  const contactInsta = document.getElementById("contact-instagram");
  const valInsta = document.getElementById("val-instagram");
  if (contactInsta) {
    contactInsta.href = instaUrl;
  }
  if (valInsta) {
    valInsta.textContent = `@${c.instagram}`;
  }
}

/* --------------------------------------------------------------------------
   04. INITIALIZATION & SMOOTH SCROLL (LENIS + GSAP SINGLE RAF LOOP)
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  hydrateContactLinks();

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const motionMode = isReducedMotion ? "reduced" : window.SITE.MOTION_LEVEL;

  // Lenis setup on a single unified GSAP ticker loop
  let lenis = null;
  if (typeof Lenis !== "undefined" && !isReducedMotion && !isTouch) {
    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        autoRaf: false
      });

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      lenis.on("scroll", () => {
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.update();
        }
      });
    } catch (e) {
      lenis = null;
    }
  }

  // Pencil Lead Scroll Progress Bar
  const progressLead = document.getElementById("pencil-progress-lead");
  function updateScrollProgress(currentScroll, maxScroll) {
    if (!progressLead) return;
    const progress = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 0;
    progressLead.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  if (lenis) {
    lenis.on("scroll", (e) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      updateScrollProgress(e.scroll, max);
    });
  } else {
    window.addEventListener("scroll", () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      updateScrollProgress(scrollY, max);
    }, { passive: true });
  }

  // Active Tab Highlight Tracker
  const sections = ["about", "works", "skills", "contact"];
  if (typeof ScrollTrigger !== "undefined") {
    sections.forEach((id) => {
      const sec = document.getElementById(id);
      const tab = document.getElementById(`tab-${id}`);
      if (sec && tab) {
        ScrollTrigger.create({
          trigger: sec,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) {
              document.querySelectorAll(".paper-tab").forEach((t) => t.classList.remove("active"));
              tab.classList.add("active");
            }
          }
        });
      }
    });

    // Smooth tab link scrolling
    document.querySelectorAll(".paper-tab").forEach((tabLink) => {
      tabLink.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = tabLink.getAttribute("data-target");
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: -60 });
          } else {
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });
  }

  /* /* @@SLOT:js-intro @@ */
  /* --------------------------------------------------------------------------
     05. INTRO OPENING PAPER LIFT ANIMATION
     -------------------------------------------------------------------------- */
  const introSheet = document.getElementById("intro-sheet");
  const introCursive = document.getElementById("intro-cursive");
  const penDot = document.getElementById("pen-dot");
  const introSquigglePath = document.getElementById("intro-squiggle-path");
  const introStarPath = document.getElementById("intro-star-path");
  const introSkipBtn = document.getElementById("intro-skip-btn");

  let introTimeline = null;

  function runOpeningSequence(onComplete) {
    if (!window.SITE.INTRO || motionMode === "reduced" || !introSheet) {
      if (introSheet) introSheet.style.display = "none";
      if (onComplete) onComplete();
      return;
    }

    introTimeline = gsap.timeline({
      onComplete: () => {
        if (introSheet) introSheet.style.display = "none";
        if (onComplete) onComplete();
      }
    });

    // Step 1: Pen dot appears and cursive "Portfolio" writes on left-to-right
    introTimeline
      .set(introSheet, { display: "flex", opacity: 1, y: 0, rotate: 0 })
      .set(penDot, { opacity: 1, left: "2%" })
      .to(introCursive, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.25,
        ease: "power2.inOut"
      })
      .to(penDot, {
        left: "98%",
        duration: 1.25,
        ease: "power2.inOut"
      }, "<")
      .to(penDot, {
        opacity: 0,
        duration: 0.15
      })
      // Step 2: Red squiggle doodle and star doodle draw
      .to(introSquigglePath, {
        strokeDashoffset: 0,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(introStarPath, {
        strokeDashoffset: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.25")
      // Step 3: Entire intro sheet lifts up and off the desk with slight rotation
      .to(introSheet, {
        y: "-110%",
        rotate: -3,
        opacity: 0,
        duration: 0.95,
        ease: "power3.inOut"
      }, "+=0.3");
  }

  if (introSkipBtn) {
    introSkipBtn.addEventListener("click", () => {
      if (introTimeline) {
        introTimeline.progress(1);
      } else if (introSheet) {
        introSheet.style.display = "none";
      }
    });
  }

  /* /* @@SLOT:js-hero @@ */
  /* --------------------------------------------------------------------------
     06. HERO SECTION MOTION
     -------------------------------------------------------------------------- */
  function initHeroAnimations() {
    const headlineEl = document.getElementById("hero-headline");
    const circlePath = document.getElementById("doodle-circle-path");
    const arrowStem = document.getElementById("doodle-arrow-stem");
    const arrowHead = document.getElementById("doodle-arrow-head");
    const stickyNote = document.querySelector(".hero-card .sticky-note");

    const headlineWords = splitElementIntoWords(headlineEl);

    if (motionMode === "reduced") {
      gsap.set(headlineWords, { opacity: 1, y: 0 });
      gsap.set([circlePath, arrowStem, arrowHead], { strokeDashoffset: 0 });
      return;
    }

    const heroTl = gsap.timeline({ delay: 0.1 });

    // Words drop onto the paper sheet with stagger
    heroTl.to(headlineWords, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.045,
      ease: "power3.out"
    });

    if (motionMode === "rich") {
      // Red pencil circle around "customers" draws itself
      heroTl.to(circlePath, {
        strokeDashoffset: 0,
        duration: 0.65,
        ease: "power2.out"
      }, "-=0.35");

      // Pointer arrow draws towards the action buttons
      heroTl.to(arrowStem, {
        strokeDashoffset: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.15");

      heroTl.to(arrowHead, {
        strokeDashoffset: 0,
        duration: 0.3,
        ease: "power2.out"
      });

      // Sticky note settles with a small paper overshoot
      if (stickyNote) {
        heroTl.fromTo(stickyNote, 
          { scale: 0.85, opacity: 0, rotate: 8 },
          { scale: 1, opacity: 1, rotate: 3.5, duration: 0.55, ease: "back.out(1.6)" },
          "-=0.7"
        );
      }
    } else {
      // Calm mode: simple reveals without loops/overshoot
      gsap.set([circlePath, arrowStem, arrowHead], { strokeDashoffset: 0 });
    }
  }

 /* ==== WORKS START ==== */
  /* --------------------------------------------------------------------------
     07. WORKS SECTION: SHEETS & PULL-OUT MODAL VIEW
     -------------------------------------------------------------------------- */
  function initWorksAnimations() {
    const sheets = document.querySelectorAll(".project-sheet");

    if (motionMode === "reduced") {
      gsap.set(sheets, { opacity: 1, y: 0 });
      return;
    }

    sheets.forEach((sheet, index) => {
      const defaultRotations = [-1.2, 0.8, -0.6];
      const targetRotate = defaultRotations[index] || 0;

      gsap.to(sheet, {
        opacity: 1,
        y: 0,
        rotate: targetRotate,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sheet,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });
  }

  // PULL-OUT MODAL SETUP
  const projectModal = document.getElementById("project-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalTitle = document.getElementById("modal-project-title");
  const modalAddressBar = document.getElementById("modal-address-bar");
  const modalLiveLink = document.getElementById("modal-live-link");
  const modalImg = document.getElementById("modal-img");
  const modalScrollFrame = document.getElementById("modal-scroll-frame");
  let lastActiveElement = null;

  // Lenis wheel interception bypass & flex scroll frame setup
  if (projectModal) {
    projectModal.setAttribute("data-lenis-prevent", "true");
  }

  if (modalScrollFrame) {
    modalScrollFrame.setAttribute("data-lenis-prevent", "true");
    modalScrollFrame.style.flex = "1 1 auto";
    modalScrollFrame.style.minHeight = "0";
    modalScrollFrame.style.overflowY = "auto";
    modalScrollFrame.style.webkitOverflowScrolling = "touch";

    // Stop wheel event bubbling to prevent background scroll interference
    modalScrollFrame.addEventListener("wheel", (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  function openProjectModal(index) {
    const data = PROJECTS_DATA[index];
    if (!data || !projectModal) return;

    lastActiveElement = document.activeElement;

    modalTitle.textContent = `${data.number} ${data.name}`;
    modalAddressBar.textContent = data.url;
    modalLiveLink.href = data.url;
    modalImg.src = data.image;
    modalImg.alt = `${data.name} full preview`;
    modalImg.style.display = "block";

    // Reset screenshot view to top on open
    if (modalScrollFrame) {
      modalScrollFrame.scrollTop = 0;
    }

    const fallback = document.getElementById("modal-fallback");
    if (fallback) fallback.style.display = "none";

    projectModal.showModal();

    if (lenis) {
      lenis.stop();
    }
    modalCloseBtn.focus();
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.close();

    if (lenis) {
      lenis.start();
    }
    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  // Trigger modal from cards or action buttons
  document.querySelectorAll("[data-project-idx]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(trigger.getAttribute("data-project-idx"), 10);
      openProjectModal(idx);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeProjectModal();
    });

    // Close on backdrop click outside the modal sheet
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }
/* ==== WORKS END ==== */
  /* /* @@SLOT:js-skills @@ */
  /* --------------------------------------------------------------------------
     08. SKILLS SECTION: CHECKLIST TICKS & HIGHLIGHTER WIPE
     -------------------------------------------------------------------------- */
  function initSkillsAnimations() {
    const checklistItems = document.querySelectorAll(".checklist-item");
    const ticks = document.querySelectorAll(".tick-path");
    const highlighterWipe = document.getElementById("skills-wipe-path");

    if (motionMode === "reduced") {
      gsap.set(checklistItems, { opacity: 1, y: 0 });
      gsap.set(ticks, { strokeDashoffset: 0 });
      if (highlighterWipe) gsap.set(highlighterWipe, { strokeDashoffset: 0 });
      return;
    }

    // Yellow highlighter wipe under "What I can do"
    if (highlighterWipe) {
      gsap.to(highlighterWipe, {
        strokeDashoffset: 0,
        duration: 0.75,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: highlighterWipe,
          start: "top 80%"
        }
      });
    }

    // Checklist items fade in with pen ticks drawing sequentially
    const skillsTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".skills-checklist",
        start: "top 80%"
      }
    });

    skillsTl.to(checklistItems, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: "power3.out"
    });

    if (motionMode === "rich") {
      skillsTl.to(ticks, {
        strokeDashoffset: 0,
        duration: 0.35,
        stagger: 0.08,
        ease: "power2.out"
      }, "<0.1");
    } else {
      gsap.set(ticks, { strokeDashoffset: 0 });
    }
  }

  /* /* @@SLOT:js-contact @@ */
  /* --------------------------------------------------------------------------
     09. CONTACT SECTION: ENVELOPE OPEN & STAMP BUTTONS
     -------------------------------------------------------------------------- */
  function initContactAnimations() {
    const flap = document.getElementById("envelope-flap");
    const letter = document.getElementById("envelope-letter");
    const stamps = document.querySelectorAll(".stamp-btn");

    if (motionMode === "reduced") {
      gsap.set(stamps, { opacity: 1, scale: 1, rotate: 0 });
      return;
    }

    const contactTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#contact",
        start: "top 75%"
      }
    });

    if (motionMode === "rich" && flap && letter) {
      // Flap unfolds open
      contactTl.to(flap, {
        rotateX: 180,
        duration: 0.7,
        ease: "power2.inOut"
      });

      // Letter slides out slightly
      contactTl.fromTo(letter,
        { y: 30 },
        { y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );
    }

    // Three stamps stamp onto the page with slight paper tilt
    contactTl.to(stamps, {
      opacity: 1,
      scale: 1,
      rotate: (idx) => (idx === 0 ? -1.5 : idx === 1 ? 1 : -0.5),
      duration: 0.55,
      stagger: 0.09,
      ease: motionMode === "rich" ? "back.out(1.4)" : "power3.out"
    }, "-=0.2");
  }

  /* --------------------------------------------------------------------------
     10. FOOTER SIGNATURE & REPLAY INTRO
     -------------------------------------------------------------------------- */
  function initFooterAnimations() {
    const footerSig = document.getElementById("footer-signature");
    if (!footerSig) return;

    if (motionMode === "reduced") {
      footerSig.style.clipPath = "none";
      return;
    }

    gsap.to(footerSig, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.25,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: "#footer",
        start: "top 85%"
      }
    });
  }

  // Replay Intro Button
  const replayBtn = document.getElementById("replay-intro-btn");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (introCursive) introCursive.style.clipPath = "inset(0 100% 0 0)";
      if (introSquigglePath) introSquigglePath.style.strokeDashoffset = "260";
      if (introStarPath) introStarPath.style.strokeDashoffset = "90";

      runOpeningSequence(() => {
        initHeroAnimations();
      });
    });
  }

  /* --------------------------------------------------------------------------
     11. ASSET OPTIMIZATION & STARTUP SEQUENCE
     -------------------------------------------------------------------------- */
  // Decode images cleanly in background
  function decodeProjectImages() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(decodeProjectImages);
  } else {
    setTimeout(decodeProjectImages, 200);
  }

  // Start sequence when fonts are ready
  document.fonts.ready.then(() => {
    runOpeningSequence(() => {
      initHeroAnimations();
    });

    initWorksAnimations();
    initSkillsAnimations();
    initContactAnimations();
    initFooterAnimations();

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
});
