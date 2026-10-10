/* ==========================================================================
   SHIVAM MISHRA — MAIN APPLICATION ENTRY POINT (ES MODULE)
   3D Universe Engine (Bulletproof Init) + Smart Nav + Word Blur + Cards Motion
   ========================================================================== */

import { Universe } from './universe/universe.js';

// Configuration
const NAV_BLUR = false;
const MOTION_LEVEL = "rich";

// Global Contact Details
window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// ==========================================================================
// 1. TOP PRIORITY: START 3D UNIVERSE ENGINE (NEVER BLOCKED)
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
// 2. UNIFIED LENIS + GSAP TICKER ENGINE (ONE LOOP)
// ==========================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || MOTION_LEVEL === 'calm';
let lenis = null;

if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    autoRaf: false
  });

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }
}

// ==========================================================================
// 3. SMART AUTO-HIDE NAVIGATION (Hysteresis Direction)
// ==========================================================================
(function initSmartHeader() {
  const header = document.getElementById('site-header');
  const navLinks = document.getElementById('nav-links');
  const activeLine = document.getElementById('nav-active-line');
  if (!header || !navLinks) return;

  let isNavHidden = false;
  let isNavScrolling = false;
  let accumulatedDown = 0;
  let accumulatedUp = 0;
  let lastScrollY = window.scrollY;
  let pointerNearTop = false;

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      pointerNearTop = e.clientY <= 80;
      if (pointerNearTop && isNavHidden) {
        showNav();
      }
    }, { passive: true });
  }

  function hideNav() {
    if (isNavHidden || isNavScrolling) return;
    isNavHidden = true;
    if (typeof gsap !== 'undefined') {
      gsap.to(header, { yPercent: -120, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    } else {
      header.classList.add('nav-hidden');
    }
  }

  function showNav() {
    if (!isNavHidden) return;
    isNavHidden = false;
    if (typeof gsap !== 'undefined') {
      gsap.to(header, { yPercent: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    } else {
      header.classList.remove('nav-hidden');
    }
  }

  function handleScroll(scrollY, dir) {
    if (scrollY >= 24) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    const hasFocus = header.contains(document.activeElement);
    const isAtBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 20);

    if (scrollY < 80 || pointerNearTop || hasFocus || isAtBottom || isNavScrolling) {
      showNav();
      accumulatedDown = 0;
      accumulatedUp = 0;
      lastScrollY = scrollY;
      return;
    }

    if (dir > 0) {
      accumulatedUp = 0;
      accumulatedDown += Math.max(0, scrollY - lastScrollY);
      if (scrollY > 120 && accumulatedDown > 24) {
        hideNav();
      }
    } else if (dir < 0) {
      accumulatedDown = 0;
      accumulatedUp += Math.max(0, lastScrollY - scrollY);
      if (accumulatedUp > 12) {
        showNav();
      }
    }

    lastScrollY = scrollY;
  }

  if (lenis) {
    lenis.on('scroll', ({ scroll, direction }) => handleScroll(scroll, direction));
  } else {
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const dir = currentY >= lastScrollY ? 1 : -1;
      handleScroll(currentY, dir);
    }, { passive: true });
  }

  // Smooth click scroll with -88px offset
  const navItems = navLinks.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      isNavScrolling = true;
      showNav();

      if (lenis) {
        lenis.scrollTo(targetEl, {
          offset: -88,
          duration: 1.2,
          onComplete: () => { isNavScrolling = false; }
        });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { isNavScrolling = false; }, 800);
      }
    });
  });

  // Active Line Indicator
  if (activeLine && typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    function updateActive(activeItem) {
      if (!activeItem) {
        gsap.to(activeLine, { scaleX: 0, duration: 0.3, ease: "power3.out" });
        return;
      }
      navItems.forEach(i => i.classList.remove('is-active'));
      activeItem.classList.add('is-active');

      const itemRect = activeItem.getBoundingClientRect();
      const parentRect = navLinks.getBoundingClientRect();
      gsap.to(activeLine, {
        x: itemRect.left - parentRect.left,
        width: itemRect.width,
        scaleX: 1,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto"
      });
    }

    const sections = [
      { id: 'hero', nav: null },
      { id: 'about', nav: navLinks.querySelector('[data-nav="about"]') },
      { id: 'works', nav: navLinks.querySelector('[data-nav="works"]') },
      { id: 'skills', nav: navLinks.querySelector('[data-nav="skills"]') },
      { id: 'contact', nav: navLinks.querySelector('[data-nav="contact"]') }
    ];

    sections.forEach(({ id, nav }) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 45%",
        end: "bottom 45%",
        onEnter: () => updateActive(nav),
        onEnterBack: () => updateActive(nav)
      });
    });
  }
})();

// ==========================================================================
// 4. RECURSIVE WORD SPLITTER & PREMIUM BLUR-REVEAL SYSTEM
// ==========================================================================
(function initWordRevealSystem() {
  if (typeof gsap === 'undefined') return;

  function splitWordsRecursively(node) {
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
      Array.from(node.childNodes).forEach(child => splitWordsRecursively(child));
    }
  }

  const targets = document.querySelectorAll('[data-reveal="words"]');
  targets.forEach(target => {
    splitWordsRecursively(target);
    const words = target.querySelectorAll('.word');
    if (words.length === 0) return;

    const useBlur = !prefersReducedMotion && words.length <= 90;
    const staggerTime = Math.min(0.035, 1.2 / Math.max(1, words.length));

    gsap.from(words, {
      opacity: 0,
      y: 18,
      filter: useBlur ? "blur(14px)" : "none",
      duration: 1.0,
      ease: "power3.out",
      stagger: staggerTime,
      scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
        trigger: target,
        start: "top 85%",
        once: true
      } : null,
      onComplete: () => {
        gsap.set(words, { clearProps: "filter,willChange,transform" });
      }
    });
  });
})();

// ==========================================================================
// 5. FOUR CARDS (3D ENTRANCE, IDLE FLOAT & ELASTIC SPRING HOVER)
// ==========================================================================
(function initCardsPhysics() {
  if (typeof gsap === 'undefined') return;

  const cardsContainer = document.getElementById('about-cards-grid');
  const cards = document.querySelectorAll('.card-flow');
  if (!cardsContainer || cards.length === 0) return;

  const idleTweens = [];

  function setupIdleAndHover() {
    cards.forEach((card, idx) => {
      if (!prefersReducedMotion) {
        const tween = gsap.to(card, {
          y: idx % 2 === 0 ? "-=4" : "+=4",
          duration: 4.5 + idx * 0.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: idx * 0.4
        });
        idleTweens.push(tween);
      }

      card.addEventListener('pointerenter', () => {
        if (window.matchMedia('(pointer: fine)').matches) {
          if (idleTweens[idx]) idleTweens[idx].pause();
          gsap.to(card, {
            y: -8,
            scale: 1.035,
            duration: 0.6,
            ease: "elastic.out(1, 0.55)",
            overwrite: "auto"
          });
        }
      });

      card.addEventListener('pointerleave', () => {
        if (window.matchMedia('(pointer: fine)').matches) {
          gsap.to(card, {
            y: 0,
            scale: 1.0,
            duration: 0.7,
            ease: "power3.out",
            overwrite: "auto",
            onComplete: () => {
              if (idleTweens[idx]) idleTweens[idx].resume();
            }
          });
        }
      });
    });
  }

  gsap.from(cards, {
    scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
      trigger: cardsContainer,
      start: "top 82%",
      once: true
    } : null,
    y: 90,
    opacity: 0,
    scale: 0.94,
    rotateX: 8,
    transformPerspective: 900,
    duration: 1.3,
    ease: "expo.out",
    stagger: 0.14,
    onComplete: setupIdleAndHover
  });
})();

// ==========================================================================
// 6. 3D MAGNETIC BUTTON TILT
// ==========================================================================
(function initMagneticTilt() {
  const tiltElements = document.querySelectorAll('.btn-connect, .btn-hero-primary, .btn-hero-secondary');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = -(y / (rect.height / 2)) * 12;
      const tiltY = (x / (rect.width / 2)) * 12;

      el.style.transform = `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)`;
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  });
})();
