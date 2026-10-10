/* ==========================================================================
   SHIVAM MISHRA — MAIN APPLICATION ENTRY POINT (ES MODULE)
   Universe Engine + Camera Space Flight + Smart Auto-Hide Nav + About Wave
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
// 2. SMART AUTO-HIDE NAVIGATION (Bulletproof ScrollTrigger Direction)
// ==========================================================================
(function initSmartHeader() {
  function setupHeaderTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(setupHeaderTrigger, 40);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const header = document.getElementById('site-header');
    if (!header) return;

    ScrollTrigger.create({
      start: 'top -60',
      end: 'max',
      onUpdate: (self) => {
        // Scrolling DOWN and not at the very top -> Hide Header
        if (self.direction === 1 && self.scroll() > 100) {
          header.classList.add('nav-hidden');
        } 
        // Scrolling UP -> Reveal smoothly
        else if (self.direction === -1) {
          header.classList.remove('nav-hidden');
        }
      }
    });

    // Safety: Always reveal when at the absolute top
    window.addEventListener('scroll', () => {
      if (window.scrollY <= 50) {
        header.classList.remove('nav-hidden');
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHeaderTrigger);
  } else {
    setupHeaderTrigger();
  }
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
// 5. ABOUT SCROLLTRIGGER + 3D SPACE FLIGHT PARALLAX
// ==========================================================================
(function initAboutAndSpaceFlight() {
  function setupScrollMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(setupScrollMotion, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // --- A. 3D CAMERA SPACE FLIGHT ON SCROLL ---
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        // As you scroll down the page, camera smoothly glides forward into the stars
        if (window.UNIVERSE && window.UNIVERSE.camera) {
          gsap.to(window.UNIVERSE.camera.position, {
            z: 850 - (self.progress * 380), // Glides from 850 to 470 deeper in 3D space
            duration: 0.8,
            ease: "power1.out",
            overwrite: "auto"
          });
        }
      }
    });

    // --- B. ABOUT HEADLINE & BIO BLUR-TO-FOCUS REVEAL ---
    gsap.set(".about-anim", {
      opacity: 0,
      y: 35,
      filter: "blur(10px)",
      willChange: "transform, opacity, filter"
    });

    gsap.to(".section-tag-wrap.about-anim", {
      scrollTrigger: {
        trigger: "#about",
        start: "top 78%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.9,
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
      duration: 1.1,
      stagger: 0.16,
      ease: "power2.out",
      clearProps: "filter,willChange"
    });

    gsap.to(".about-p.about-anim", {
      scrollTrigger: {
        trigger: ".about-right",
        start: "top 75%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.0,
      stagger: 0.15,
      ease: "power2.out",
      clearProps: "filter,willChange"
    });

    // --- C. 4 CARDS FLOATING WAVE ENTRANCE ---
    gsap.set(".card-flow", {
      opacity: 0,
      y: 60,
      scale: 0.94,
      willChange: "transform, opacity"
    });

    gsap.to(".card-flow", {
      scrollTrigger: {
        trigger: ".about-cards-grid",
        start: "top 82%",
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.1,
      stagger: 0.14,
      ease: "back.out(1.2)",
      clearProps: "willChange"
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupScrollMotion);
  } else {
    setupScrollMotion();
  }
})();
