/* ==========================================================================
   SHIVAM MISHRA — MAIN APPLICATION ENGINE (ES MODULE)
   3D Space Flight on Scroll + Native 120Hz Scroll + Smart Nav + Card Physics
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
// 2. 3D CAMERA SPACE FLIGHT ON SCROLL (FLYING DEEP INTO THE COSMOS!)
// ==========================================================================
(function initSpaceFlight() {
  function setupFlight() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(setupFlight, 50);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // As user scrolls down the page, camera glides forward through space
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        if (window.UNIVERSE && window.UNIVERSE.camera) {
          gsap.to(window.UNIVERSE.camera.position, {
            z: 850 - (self.progress * 420), // Glides from 850 down to 430 deep into stars
            duration: 0.6,
            ease: "power1.out",
            overwrite: "auto"
          });
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
// 3. SMART AUTO-HIDE NAVBAR (FAST NATIVE HARDWARE SCROLL)
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

    // 1. स्क्रीन के टॉप पर (Hero में) हमेशा दिखेगा
    if (currentY <= 60) {
      header.classList.remove('nav-hidden');
      isNavHidden = false;
    }
    // 2. नीचे स्क्रॉल करते ही (>100px) तुरंत 100% गायब हो जाएगा
    else if (diff > 4 && currentY > 100) {
      if (!isNavHidden) {
        header.classList.add('nav-hidden');
        isNavHidden = true;
      }
    }
    // 3. जब तुम जानबूझकर कम से कम 25px ऊपर स्क्रॉल करोगे, तभी वापस आएगा (ताकि रुकने पर सिर पर न चढ़े)
    else if (diff < -25) {
      if (isNavHidden) {
        header.classList.remove('nav-hidden');
        isNavHidden = false;
      }
    }

    lastScrollY = currentY;
  }, { passive: true });

  // Mouse near top brings it back
  window.addEventListener('mousemove', (e) => {
    if (e.clientY <= 70 && isNavHidden) {
      header.classList.remove('nav-hidden');
      isNavHidden = false;
    }
  }, { passive: true });

  // Active indicator tracking
  if (activeLine && typeof ScrollTrigger !== 'undefined') {
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
// 4. KINETIC MASK SLIDE WORD REVEAL (120FPS ZERO-LAG COMPOSITOR)
// ==========================================================================
(function initWordReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

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

  const targets = document.querySelectorAll('[data-reveal="words"]');
  targets.forEach(target => {
    splitWords(target);
    const words = target.querySelectorAll('.word');
    if (words.length === 0) return;

    const staggerTime = Math.min(0.035, 1.2 / Math.max(1, words.length));

    gsap.fromTo(words, 
      { opacity: 0, y: "110%" },
      {
        opacity: 1,
        y: "0%",
        duration: 0.8,
        ease: "power3.out",
        stagger: staggerTime,
        scrollTrigger: {
          trigger: target,
          start: "top 85%",
          once: true
        },
        onComplete: () => {
          gsap.set(words, { clearProps: "transform,opacity" });
        }
      }
    );
  });
})();

// ==========================================================================
// 5. FOUR CARDS ENTRANCE & ELASTIC HOVER PHYSICS
// ==========================================================================
(function initCards() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.card-flow');
  const grid = document.getElementById('about-cards-grid');
  if (!grid || cards.length === 0) return;

  gsap.from(cards, {
    scrollTrigger: {
      trigger: grid,
      start: "top 82%",
      once: true
    },
    y: 70,
    opacity: 0,
    scale: 0.95,
    duration: 1.1,
    stagger: 0.12,
    ease: "power3.out"
  });

  // Elastic spring hover on cards
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -8, scale: 1.025, duration: 0.5, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, scale: 1.0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    });
  });
})();

// ==========================================================================
// 6. 3D MAGNETIC BUTTON TILT
// ==========================================================================
(function initTilt() {
  const btns = document.querySelectorAll('.btn-connect, .btn-hero-primary, .btn-hero-secondary');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `perspective(500px) rotateX(${-(y / (rect.height / 2)) * 12}deg) rotateY(${(x / (rect.width / 2)) * 12}deg) translate3d(${x * 0.1}px, ${y * 0.1}px, 0)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
      btn.style.transition = 'transform 0.4s ease';
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });
  });
})();
