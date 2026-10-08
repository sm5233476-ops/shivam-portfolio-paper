/**
 * ============================================================================
 * THE COSMIC HORIZON — CORE ENGINE (REFINED)
 * Shivam Mishra | Procedural Nebula, 3D Parallax & Spotlight Controllers
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. UPGRADED PROCEDURAL COSMIC NEBULA & STAR ENGINE
     ========================================================================== */

  class CosmicCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Mouse Parallax Physics
      this.mouse = {
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        ease: 0.045
      };

      // Entities
      this.stars = [];
      this.microParticles = [];
      this.nebulaClouds = [];
      this.starCount = this.calculateStarCount();
      this.microCount = 28;

      this.init();
    }

    calculateStarCount() {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(Math.floor(area / 8500), 130);
    }

    init() {
      this.resize();
      this.createNebula();
      this.createStars();
      this.createMicroParticles();
      this.bindEvents();
      this.render();
    }

    bindEvents() {
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Cursor Parallax Tracker (-1.0 to 1.0)
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
        this.mouse.targetY = (e.clientY / this.height - 0.5) * 2;
      }, { passive: true });

      // Mobile Touch Parallax Support
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          this.mouse.targetX = (touch.clientX / this.width - 0.5) * 1.5;
          this.mouse.targetY = (touch.clientY / this.height - 0.5) * 1.5;
        }
      }, { passive: true });
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.scale(this.dpr, this.dpr);

      const newStarCount = this.calculateStarCount();
      if (Math.abs(this.stars.length - newStarCount) > 25) {
        this.starCount = newStarCount;
        this.createStars();
      }
    }

    createNebula() {
      // Atmospheric deep-blue and indigo nebula clouds
      this.nebulaClouds = [
        {
          xRel: 0.25,
          yRel: 0.35,
          radius: Math.max(this.width, this.height) * 0.42,
          colorCenter: 'rgba(12, 74, 110, 0.16)', // Deep Cyan/Sky
          colorOuter: 'rgba(3, 7, 18, 0)',
          phase: 0,
          speed: 0.003,
          depth: 0.15
        },
        {
          xRel: 0.75,
          yRel: 0.65,
          radius: Math.max(this.width, this.height) * 0.48,
          colorCenter: 'rgba(30, 27, 75, 0.22)', // Indigo Abyss
          colorOuter: 'rgba(3, 7, 18, 0)',
          phase: 1.8,
          speed: 0.0025,
          depth: 0.2
        },
        {
          xRel: 0.5,
          yRel: 0.48,
          radius: Math.max(this.width, this.height) * 0.32,
          colorCenter: 'rgba(56, 189, 248, 0.07)', // Electric Sky Heart
          colorOuter: 'rgba(3, 7, 18, 0)',
          phase: 3.2,
          speed: 0.004,
          depth: 0.35
        }
      ];
    }

    createStars() {
      this.stars = [];
      const tints = [
        'rgba(255, 255, 255, ',        // Pure White
        'rgba(224, 242, 254, ',        // Ice Blue
        'rgba(56, 189, 248, ',         // Electric Sky Blue
        'rgba(186, 230, 253, '         // Soft Sky
      ];

      for (let i = 0; i < this.starCount; i++) {
        const depth = Math.random() * 0.85 + 0.15; // 3D depth layer
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: (Math.random() * 1.3 + 0.4) * depth,
          colorBase: tints[Math.floor(Math.random() * tints.length)],
          baseAlpha: Math.random() * 0.6 + 0.25,
          twinkleSpeed: Math.random() * 0.02 + 0.006,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.15 * depth,
          vy: (Math.random() - 0.5) * 0.15 * depth,
          depth: depth
        });
      }
    }

    createMicroParticles() {
      this.microParticles = [];
      for (let i = 0; i < this.microCount; i++) {
        this.microParticles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 16 + 8, // Soft micro-glow bubble
          alpha: Math.random() * 0.05 + 0.015,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -Math.random() * 0.25 - 0.05, // Gentle upward cosmic float
          depth: Math.random() * 0.5 + 0.2
        });
      }
    }

    render() {
      // 60fps Damped Parallax Mouse Lerp
      this.mouse.currentX += (this.mouse.targetX - this.mouse.currentX) * this.mouse.ease;
      this.mouse.currentY += (this.mouse.targetY - this.mouse.currentY) * this.mouse.ease;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Render Procedural Deep Nebula Clouds
      for (let i = 0; i < this.nebulaClouds.length; i++) {
        const c = this.nebulaClouds[i];
        c.phase += c.speed;

        const pulse = Math.sin(c.phase) * 25;
        const currentRadius = c.radius + pulse;

        const posX = c.xRel * this.width + this.mouse.currentX * 50 * c.depth;
        const posY = c.yRel * this.height + this.mouse.currentY * 50 * c.depth;

        const grad = this.ctx.createRadialGradient(posX, posY, 0, posX, posY, currentRadius);
        grad.addColorStop(0, c.colorCenter);
        grad.addColorStop(0.65, c.colorCenter.replace(/[\d\.]+\)$/, '0.04)'));
        grad.addColorStop(1, c.colorOuter);

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, currentRadius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 2. Render Floating Micro-Bubbles
      for (let i = 0; i < this.microParticles.length; i++) {
        const m = this.microParticles[i];
        m.x += m.vx;
        m.y += m.vy;

        if (m.y < -m.radius) {
          m.y = this.height + m.radius;
          m.x = Math.random() * this.width;
        }

        const renderX = m.x + this.mouse.currentX * 30 * m.depth;
        const renderY = m.y + this.mouse.currentY * 30 * m.depth;

        const bubbleGrad = this.ctx.createRadialGradient(
          renderX, renderY, 0,
          renderX, renderY, m.radius
        );
        bubbleGrad.addColorStop(0, `rgba(56, 189, 248, ${m.alpha * 1.5})`);
        bubbleGrad.addColorStop(0.6, `rgba(56, 189, 248, ${m.alpha * 0.4})`);
        bubbleGrad.addColorStop(1, 'transparent');

        this.ctx.fillStyle = bubbleGrad;
        this.ctx.beginPath();
        this.ctx.arc(renderX, renderY, m.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 3. Render Multi-Depth Twinkling Stars
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = this.width;
        if (s.x > this.width) s.x = 0;
        if (s.y < 0) s.y = this.height;
        if (s.y > this.height) s.y = 0;

        s.twinklePhase += s.twinkleSpeed;
        const alpha = Math.max(0.08, s.baseAlpha + Math.sin(s.twinklePhase) * 0.28);

        const renderX = s.x + this.mouse.currentX * 42 * s.depth;
        const renderY = s.y + this.mouse.currentY * 42 * s.depth;

        this.ctx.fillStyle = `${s.colorBase}${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(renderX, renderY, s.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      requestAnimationFrame(() => this.render());
    }
  }

  /* ==========================================================================
     2. DYNAMIC BUTTON SPOTLIGHT CONTROLLER ("LET'S CONNECT")
     ========================================================================== */

  class ButtonSpotlightController {
    constructor() {
      this.buttons = document.querySelectorAll('.btn-connect');
      this.init();
    }

    init() {
      this.buttons.forEach((button) => {
        button.addEventListener('mousemove', (e) => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          button.style.setProperty('--mouse-x', `${x}px`);
          button.style.setProperty('--mouse-y', `${y}px`);
        });

        button.addEventListener('mouseleave', () => {
          button.style.removeProperty('--mouse-x');
          button.style.removeProperty('--mouse-y');
        });
      });
    }
  }

  /* ==========================================================================
     3. NAVIGATION & MOBILE DRAWER CONTROLLER
     ========================================================================== */

  class NavigationController {
    constructor() {
      this.header = document.getElementById('site-header');
      this.mobileToggle = document.getElementById('mobile-toggle');
      this.mobileMenu = document.getElementById('mobile-menu');
      this.mobileLinks = document.querySelectorAll('.mobile-nav-link');
      this.isOpen = false;

      this.init();
    }

    init() {
      if (!this.mobileToggle || !this.mobileMenu) return;

      this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());

      this.mobileLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMobileMenu());
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMobileMenu();
        }
      });

      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          this.header.style.backgroundColor = 'rgba(3, 7, 18, 0.82)';
          this.header.style.backdropFilter = 'blur(16px)';
          this.header.style.webkitBackdropFilter = 'blur(16px)';
        } else {
          this.header.style.backgroundColor = 'transparent';
          this.header.style.backdropFilter = 'none';
          this.header.style.webkitBackdropFilter = 'none';
        }
      }, { passive: true });
    }

    toggleMobileMenu() {
      this.isOpen ? this.closeMobileMenu() : this.openMobileMenu();
    }

    openMobileMenu() {
      this.isOpen = true;
      this.mobileToggle.classList.add('is-active');
      this.mobileToggle.setAttribute('aria-expanded', 'true');
      this.mobileMenu.classList.add('is-active');
      this.mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
      this.isOpen = false;
      this.mobileToggle.classList.remove('is-active');
      this.mobileToggle.setAttribute('aria-expanded', 'false');
      this.mobileMenu.classList.remove('is-active');
      this.mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  /* ==========================================================================
     4. SLOT MARKERS & EXTENSIONS
     ========================================================================== */

  // @@SLOT:hero @@

  // @@SLOT:about @@

  // @@SLOT:works @@

  // @@SLOT:skills @@

  // @@SLOT:contact @@

  /* ==========================================================================
     5. BOOTSTRAP APPLICATION
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Cosmic Deep Space Nebula & Stars Canvas
    new CosmicCanvas('cosmic-canvas');

    // 2. Interactive Spotlight on Connect Buttons
    new ButtonSpotlightController();

    // 3. Navigation Controller
    new NavigationController();

    if (window.CONTACT) {
      console.log(`%c[The Cosmic Horizon]%c Initialized for ${window.CONTACT.name}`, 'color: #38bdf8; font-weight: bold;', 'color: #94A3B8;');
    }
  });

})();
