/* ==========================================================================
   LUMIFEX — MASTER APPLICATION ENGINE (ES MODULE)
   3D Space Flight + Visuvate Morphing Dock + Calm 3D Helical Orbit (60 FPS)
   ========================================================================== */

import { Universe } from './universe/universe.js';

// Global Contact Details
window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// ==========================================================================
// 1. START 3D UNIVERSE ENGINE
// ==========================================================================
(function initCosmicWorld() {
  try {
    const canvas = document.getElementById('universe-canvas');
    if (canvas) {
      const universe = new Universe();
      universe.init(canvas);
      window.__motionReady = true;
    }
  } catch (err) {
    console.error('Universe Engine Error:', err);
  }
})();

// ==========================================================================
// 2. 3D CAMERA SPACE FLIGHT ON SCROLL (STRAIGHT FORWARD GLIDE)
// ==========================================================================
(function initSpaceFlight() {
  function setupFlight() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(setupFlight, 50);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.0,
      onUpdate: (self) => {
        if (window.UNIVERSE && window.UNIVERSE.setScrollProgress) {
          window.UNIVERSE.setScrollProgress(self.progress, self.getVelocity());
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFlight);
  } else {
    setupFlight();
  }
})();

// ==========================================================================
// 3. TRUE VISUVATE MORPHING DOCK & SMART SCROLL HIDE/SHOW
// ==========================================================================
(function initSmartNav() {
  const header = document.getElementById('site-header');
  const navLinks = document.getElementById('nav-links');
  const activeLine = document.getElementById('nav-active-line');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let isNavHidden = false;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const diff = currentY - lastScrollY;

    // 1. Morph between Wide Hero and Compact Center Pill
    if (currentY > 60) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // 2. Smart Scroll Hide/Show
    // At top (< 60px): Always visible
    if (currentY <= 60) {
      if (isNavHidden) {
        header.classList.remove('nav-hidden');
        isNavHidden = false;
      }
    }
    // Scrolling DOWN (> 6px diff & > 120px depth): Hide cleanly
    else if (diff > 6 && currentY > 120) {
      if (!isNavHidden) {
        header.classList.add('nav-hidden');
        isNavHidden = true;
      }
    }
    // Scrolling UP (intentional > 8px): Show smoothly
    else if (diff < -8) {
      if (isNavHidden) {
        header.classList.remove('nav-hidden');
        isNavHidden = false;
      }
    }

    lastScrollY = currentY;
  }, { passive: true });

  // Reveal when mouse approaches top
  window.addEventListener('mousemove', (e) => {
    if (e.clientY <= 65 && isNavHidden) {
      header.classList.remove('nav-hidden');
      isNavHidden = false;
    }
  }, { passive: true });

  // Active indicator tracking
  if (activeLine && typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    const navItems = navLinks ? navLinks.querySelectorAll('.nav-item') : [];
    const sections = ['about', 'works', 'skills', 'contact'];

    sections.forEach(id => {
      const sec = document.getElementById(id);
      const link = navLinks ? navLinks.querySelector(`[data-nav="${id}"]`) : null;
      if (!sec || !link) return;

      ScrollTrigger.create({
        trigger: sec,
        start: "top 45%",
        end: "bottom 45%",
        onEnter: () => updateLine(link),
        onEnterBack: () => updateLine(link)
      });
    });

    function updateLine(link) {
      navItems.forEach(i => i.classList.remove('is-active'));
      link.classList.add('is-active');
      const rect = link.getBoundingClientRect();
      const parentRect = navLinks.getBoundingClientRect();
      gsap.to(activeLine, {
        x: rect.left - parentRect.left,
        width: rect.width,
        scaleX: 1,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  }
})();

// ==========================================================================
// 4. KINETIC WORD REVEAL (HERO & ABOUT TEXT SLIDE-UP)
// ==========================================================================
(function initWordReveal() {
  if (typeof gsap === 'undefined') return;

  function splitWords(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text || text.trim() === '') return;
      const fragment = document.createDocumentFragment();
      const tokens = text.split(/(\s+)/);

      tokens.forEach(token => {
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
        } else if (token.length > 0) {
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          const word = document.createElement('span');
          word.className = 'word';
          word.textContent = token;
          mask.appendChild(word);
          fragment.appendChild(mask);
        }
      });
      node.parentNode.replaceChild(fragment, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'SCRIPT' || node.tagName === 'SVG') return;
      Array.from(node.childNodes).forEach(child => splitWords(child));
    }
  }

  const heroTitle = document.querySelector('.hero-title');
  const heroSub = document.querySelector('.hero-subtitle');
  const aboutHeadline = document.querySelector('.about-headline');
  const aboutPs = document.querySelectorAll('.about-p');

  if (heroTitle) splitWords(heroTitle);
  if (heroSub) splitWords(heroSub);
  if (aboutHeadline) splitWords(aboutHeadline);
  aboutPs.forEach(p => splitWords(p));

  const heroWords = document.querySelectorAll('.hero-title .word, .hero-subtitle .word');
  if (heroWords.length > 0) {
    gsap.fromTo(heroWords, 
      { opacity: 0, y: "115%" },
      {
        opacity: 1,
        y: "0%",
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.04,
        delay: 0.25,
        onComplete: () => {
          gsap.set(heroWords, { clearProps: "transform,opacity" });
        }
      }
    );
  }

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const aboutWords = document.querySelectorAll('.about-headline .word, .about-p .word');
    if (aboutWords.length > 0) {
      gsap.fromTo(aboutWords,
        { opacity: 0, y: "115%" },
        {
          opacity: 1,
          y: "0%",
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.025,
          scrollTrigger: {
            trigger: "#about",
            start: "top 75%",
            once: true
          },
          onComplete: () => {
            gsap.set(aboutWords, { clearProps: "transform,opacity" });
          }
        }
      );
    }
  }
})();

// ==========================================================================
// 5. FOUR CARDS ENTRANCE (ABOUT SECTION)
// ==========================================================================
(function initCards() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.about-card');
  const grid = document.getElementById('about-cards-grid');
  if (!grid || cards.length === 0) return;

  gsap.from(cards, {
    scrollTrigger: {
      trigger: grid,
      start: "top 82%",
      once: true
    },
    y: 50,
    opacity: 0,
    duration: 0.95,
    stagger: 0.12,
    ease: "power2.out"
  });

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -5, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    });
  });
})();

// ==========================================================================
// 6. VISUVATE TRUE 3D HELICAL VORTEX ENGINE (CALM, LUXURIOUS 60 FPS ORBIT)
// ==========================================================================
(function initVisuvateHelix() {
  function setupHelix() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(setupHelix, 50);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const pinStage = document.getElementById('visuvate-stage-pin');
    const stage = document.getElementById('visuvate-stage');
    const helixContainer = document.getElementById('visuvate-helix');
    const cards = document.querySelectorAll('.helix-card');

    if (!pinStage || !stage || !helixContainer || cards.length === 0) return;

    // Desktop/Tablet only (> 900px)
    if (window.innerWidth <= 900) return;

    const totalCards = cards.length;
    const angleStep = (Math.PI * 2) / totalCards;
    const radiusX = 510; // Horizontal orbit width
    const radiusZ = 370; // Depth orbit
    const verticalPitch = 100; // Vertical stagger per card

    function updateHelix(progress) {
      // Calm, majestic rotation cadence (increased runway prevents rushing)
      const scrollAngle = progress * Math.PI * 2.0;
      const scrollYOffset = progress * (verticalPitch * totalCards * 0.65);

      cards.forEach((card, i) => {
        const theta = (i * angleStep) - scrollAngle;
        const x = Math.sin(theta) * radiusX;
        const z = Math.cos(theta) * radiusZ;
        
        const baseY = (i - (totalCards - 1) / 2) * verticalPitch;
        const y = baseY - scrollYOffset + (progress * 130);

        // Camera-facing dynamic banking: Cards stay readable, zero backwards flipping
        const rotY = -Math.sin(theta) * 36;
        const rotX = -Math.cos(theta) * 16 + 4;
        const rotZ = -Math.sin(theta) * 6;

        // Depth calculations: Front cards are crisp, distant cards soften
        const depthFactor = (z + radiusZ) / (2 * radiusZ);
        const opacity = gsap.utils.clamp(0.45, 1.0, 0.45 + depthFactor * 0.55);
        const scale = gsap.utils.clamp(0.86, 1.05, 0.88 + depthFactor * 0.17);

        // Direct hardware-accelerated 60 FPS matrix transform
        card.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(2);
        card.style.zIndex = Math.round((z + radiusZ) * 10);
      });
    }

    // Set initial layout
    updateHelix(0);

    // Pin ONLY the 3D Stage after heading has scrolled (ZERO collision!)
    ScrollTrigger.create({
      trigger: pinStage,
      start: "top top",
      end: "+=4600", // Calm, smooth runway
      pin: true,
      scrub: 1.0,
      onUpdate: (self) => {
        updateHelix(self.progress);
      }
    });

    // 3D Spatial Mouse Parallax
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const mx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const my = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      gsap.to(helixContainer, {
        rotateY: mx * 10,
        rotateX: -my * 7,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    stage.addEventListener('mouseleave', () => {
      gsap.to(helixContainer, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.9,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHelix);
  } else {
    setupHelix();
  }
})();

// ==========================================================================
// 7. 3D MAGNETIC BUTTON TILT
// ==========================================================================
(function initTilt() {
  const btns = document.querySelectorAll('.btn-connect, .btn-hero-primary, .btn-hero-secondary, .btn-contact-primary');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `perspective(500px) rotateX(${-(y / (rect.height / 2)) * 10}deg) rotateY(${(x / (rect.width / 2)) * 10}deg) translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
      btn.style.transition = 'transform 0.35s ease';
      setTimeout(() => { btn.style.transition = ''; }, 350);
    });
  });
})();
