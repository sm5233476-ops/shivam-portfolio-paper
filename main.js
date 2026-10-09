/* ==========================================================================
   SHIVAM MISHRA — MAIN APPLICATION ENTRY POINT (ES MODULE)
   Universe Engine + Hero Blur Reveal + About Section ScrollTrigger
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
// 2. 3D MAGNETIC BUTTON TILT MICRO-INTERACTION
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
// 3. HERO CINEMATIC BLUR-TO-FOCUS REVEAL TIMELINE
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
// 4. ABOUT SECTION GSAP SCROLLTRIGGER REVEAL
// ==========================================================================
(function initAboutScrollAnimations() {
  function startScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(startScrollTrigger, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initial Hidden State for About Elements
    gsap.set([".section-tag-wrap", ".about-headline", ".about-exp-pill", ".about-p", ".about-card"], {
      opacity: 0,
      y: 35,
      willChange: "transform, opacity"
    });

    // 1. Tag & Left Headline Reveal
    gsap.to(".section-tag-wrap", {
      scrollTrigger: {
        trigger: "#about",
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power2.out"
    });

    gsap.to([".about-headline", ".about-exp-pill"], {
      scrollTrigger: {
        trigger: ".about-left",
        start: "top 78%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.18,
      ease: "power2.out"
    });

    // 2. Right Paragraphs Story Reveal
    gsap.to(".about-p", {
      scrollTrigger: {
        trigger: ".about-right",
        start: "top 78%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.16,
      ease: "power2.out"
    });

    // 3. Staggered 3D Entrance for Glass Capability Cards
    gsap.to(".about-card", {
      scrollTrigger: {
        trigger: ".about-cards-grid",
        start: "top 82%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      duration: 0.95,
      stagger: 0.14,
      ease: "power2.out",
      clearProps: "willChange"
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startScrollTrigger);
  } else {
    startScrollTrigger();
  }
})();
