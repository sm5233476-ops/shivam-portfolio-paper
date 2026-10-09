/* ==========================================================================
   SHIVAM MISHRA — MAIN APPLICATION ENTRY POINT (ES MODULE)
   Universe Engine + Hero Reveal + Smart Auto-Hide Nav + About Wave Animations
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
// 1. INITIALIZE THE UNIVERSE 4K GRAPHICS ENGINE
// ==========================================================================
(function initCosmicWorld() {
  const canvas = document.getElementById('universe-canvas');
  if (!canvas) return;

  const universe = new Universe();
  universe.init(canvas);
})();

// ==========================================================================
// 2. SMART AUTO-HIDE NAVIGATION (Telegram Style Disappear/Reappear on Scroll)
// ==========================================================================
(function initSmartHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // If at top, always show
        if (currentScrollY <= 60) {
          header.classList.remove('nav-hidden');
        } 
        // Scrolling DOWN -> Hide
        else if (currentScrollY > lastScrollY && currentScrollY > 120) {
          header.classList.add('nav-hidden');
        } 
        // Scrolling UP -> Reveal smoothly
        else if (currentScrollY < lastScrollY) {
          header.classList.remove('nav-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ==========================================================================
// 3. 3D MAGNETIC BUTTON TILT MICRO-INTERACTION
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

// ==========================================================================
// 4. HERO CINEMATIC BLUR-TO-FOCUS REVEAL TIMELINE
// ==========================================================================
(function initHeroReveal() {
  function startReveal() {
    if (typeof gsap === 'undefined') {
      setTimeout(startReveal, 40);
      return;
    }

    gsap.set(".reveal-blur", {
      opacity: 0,
      y: 28,
      filter: "blur(6px)",
      willChange: "transform, opacity, filter"
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.to(".title-line", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.05,
      stagger: 0.14,
      delay: 0.15,
      clearProps: "filter,willChange"
    })
    .to(".hero-subtitle", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.95,
      clearProps: "filter,willChange"
    }, "-=0.75")
    .to(".hero-actions", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.9,
      clearProps: "filter,willChange"
    }, "-=0.75")
    .to(".hero-scroll", {
      opacity: 0.65,
      y: 0,
      filter: "blur(0px)",
      duration: 0.8,
      clearProps: "filter,willChange"
    }, "-=0.65");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startReveal);
  } else {
    startReveal();
  }
})();

// ==========================================================================
// 5. ABOUT SECTION CINEMATIC BLUR + 4-CARD FLOATING WAVE ENTRANCE
// ==========================================================================
(function initAboutScrollAnimations() {
  function startScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(startScrollTrigger, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initial state: Blur-to-focus for About text
    gsap.set(".about-anim", {
      opacity: 0,
      y: 32,
      filter: "blur(8px)",
      willChange: "transform, opacity, filter"
    });

    // Initial state: Wave float for 4 cards
    gsap.set(".card-flow", {
      opacity: 0,
      y: 55,
      scale: 0.96,
      willChange: "transform, opacity"
    });

    // 1. Tag & Left Headline Reveal (Blur-to-Focus)
    gsap.to(".section-tag-wrap.about-anim", {
      scrollTrigger: {
        trigger: "#about",
        start: "top 78%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.85,
      ease: "power2.out",
      clearProps: "filter,willChange"
    });

    gsap.to([".about-headline.about-anim", ".about-exp-pill.about-anim"], {
      scrollTrigger: {
        trigger: ".about-left",
        start: "top 75%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.05,
      stagger: 0.16,
      ease: "power2.out",
      clearProps: "filter,willChange"
    });

    // 2. Right Bio Paragraphs Reveal
    gsap.to(".about-p.about-anim", {
      scrollTrigger: {
        trigger: ".about-right",
        start: "top 75%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.95,
      stagger: 0.14,
      ease: "power2.out",
      clearProps: "filter,willChange"
    });

    // 3. Staggered Wave Entrance for the 4 Electric Beam Cards
    gsap.to(".card-flow", {
      scrollTrigger: {
        trigger: ".about-cards-grid",
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      stagger: 0.12,
      ease: "back.out(1.15)",
      clearProps: "willChange"
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startScrollTrigger);
  } else {
    startScrollTrigger();
  }
})();
