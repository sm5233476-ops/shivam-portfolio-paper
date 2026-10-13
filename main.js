/* ==========================================================================
   SHIVAM MISHRA — MAIN APPLICATION ENGINE (ES MODULE - COMPLETE SUITE)
   3D Space Flight + Visuvate 3D Cylinder Works + Smart Nav + 120FPS Text
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
      scrub: 1.2,
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
// 3. SMART HYSTERESIS NAVBAR (ACCIDENTAL POP-UP FIX)
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

    // Top (< 60px): always visible
    if (currentY <= 60) {
      if (isNavHidden) {
        header.classList.remove('nav-hidden');
        isNavHidden = false;
      }
    }
    // Scrolling DOWN (> 100px): hide cleanly
    else if (diff > 4 && currentY > 100) {
      if (!isNavHidden) {
        header.classList.add('nav-hidden');
        isNavHidden = true;
      }
    }
    // Scrolling UP (intentional > 20px): show
    else if (diff < -20) {
      if (isNavHidden) {
        header.classList.remove('nav-hidden');
        isNavHidden = false;
      }
    }

    lastScrollY = currentY;
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    if (e.clientY <= 70 && isNavHidden) {
      header.classList.remove('nav-hidden');
      isNavHidden = false;
    }
  }, { passive: true });

  // Active indicator tracking
  if (activeLine && typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    const navItems = navLinks ? navLinks.querySelectorAll('.nav-item') : [];
    const sections = ['hero', 'about', 'works', 'skills', 'contact'];

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
// 4. SYNCHRONIZED KINETIC WORD REVEAL (HERO & ABOUT TEXT SLIDE-UP)
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

  // Hero page-load reveal
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

  // About scroll reveal
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
// 5. FOUR CARDS ENTRANCE & CALM LUXURY LIFT (ABOUT SECTION)
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

  // Calm Tactile Lift on Hover
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
// 6. VISUVATE 3D CYLINDER WORKS ROTATION ENGINE (DESKTOP PERSPECTIVE)
// ==========================================================================
(function initWorksCylinder() {
  function setupCylinder() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(setupCylinder, 50);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const cylinder = document.getElementById('works-cylinder');
    const worksSection = document.getElementById('works');
    if (!cylinder || !worksSection) return;

    // Only enable 3D cylindrical pinning on desktop (> 900px)
    if (window.innerWidth <= 900) return;

    // Pins the works section while scroll scrubs the 3D cylinder from 0° to -270°
    ScrollTrigger.create({
      trigger: worksSection,
      start: "top top",
      end: "+=2400", // Smooth scroll distance to cycle through all 4 projects
      pin: true,
      scrub: 1.2,
      onUpdate: (self) => {
        const rotationY = -self.progress * 270;
        gsap.to(cylinder, {
          rotateY: rotationY,
          duration: 0.4,
          ease: "power1.out",
          overwrite: "auto"
        });
      }
    });

    // Subtle 3D mouse parallax on the cylinder viewport
    const viewport = document.getElementById('works-3d-viewport');
    if (viewport && window.matchMedia('(pointer: fine)').matches) {
      viewport.addEventListener('mousemove', (e) => {
        const rect = viewport.getBoundingClientRect();
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        gsap.to(cylinder, {
          rotateX: -y * 8, // Gentle 3D vertical tilt
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
      viewport.addEventListener('mouseleave', () => {
        gsap.to(cylinder, {
          rotateX: 0,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCylinder);
  } else {
    setupCylinder();
  }
})();

// ==========================================================================
// 7. 3D MAGNETIC BUTTON TILT
// ==========================================================================
(function initTilt() {
  const btns = document.querySelectorAll('.btn-connect, .btn-hero-primary, .btn-hero-secondary');
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
