/**
 * ============================================================================
 * THE COSMIC HORIZON — CORE ENGINE (PHASE 1 FINAL LOCK)
 * Shivam Mishra | 3D Perspective Parallax, Nebula Currents & Micro-Interactions
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. DEEP 3D PARALLAX & COSMIC CANVAS ENGINE (BEHFAR.DEV & VISUVATE.COM)
     ========================================================================== */

  class CosmicCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // High-Reactivity 3D Parallax Tracking
      this.mouse = {
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        ease: 0.055 // Snappy yet silky-smooth spring response
      };

      // Cosmic Entities
      this.stars = [];
      this.nebulaNodes = [];
      this.dustParticles = [];

      this.starCount = this.calculateStarCount();
      this.dustCount = 32;

      this.init();
    }

    calculateStarCount() {
      const area = window.innerWidth * window.innerHeight;
      // Balanced rich starlight without overcrowding
      return Math.min(Math.floor(area / 5500), 195);
    }

    init() {
      this.resize();
      this.createNebulaCurrents();
      this.createMultiDepthStars();
      this.createDustParticles();
      this.bindEvents();
      this.render();
    }

    bindEvents() {
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Cursor Parallax Tracker: Normalized coordinate space (-1.0 to +1.0)
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
        this.mouse.targetY = (e.clientY / this.height - 0.5) * 2;
      }, { passive: true });

      // Responsive Touch Parallax
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          this.mouse.targetX = (touch.clientX / this.width - 0.5) * 1.6;
          this.mouse.targetY = (touch.clientY / this.height - 0.5) * 1.6;
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
      if (Math.abs(this.stars.length - newStarCount) > 30) {
        this.starCount = newStarCount;
        this.createMultiDepthStars();
      }
    }

    createNebulaCurrents() {
      // Visuvate.com inspired glowing blue & indigo energetic backdrops
      this.nebulaNodes = [
        {
          xRel: 0.28,
          yRel: 0.38,
          baseRadius: Math.max(this.width, this.height) * 0.44,
          colorCenter: 'rgba(14, 116, 144, 0.18)', // Cyan energy core
          colorOuter: 'rgba(3, 7, 18, 0)',
          phase: 0,
          speed: 0.003,
          tiltFactor: 24 // Midground moderate parallax (~24px)
        },
        {
          xRel: 0.72,
          yRel: 0.62,
          baseRadius: Math.max(this.width, this.height) * 0.5,
          colorCenter: 'rgba(30, 27, 75, 0.24)', // Deep indigo abyss
          colorOuter: 'rgba(3, 7, 18, 0)',
          phase: 2.1,
          speed: 0.002,
          tiltFactor: 18
        },
        {
          xRel: 0.5,
          yRel: 0.46,
          baseRadius: Math.max(this.width, this.height) * 0.35,
          colorCenter: 'rgba(56, 189, 248, 0.09)', // Electric Sky spotlight
          colorOuter: 'rgba(3, 7, 18, 0)',
          phase: 4.3,
          speed: 0.004,
          tiltFactor: 32
        }
      ];
    }

    createMultiDepthStars() {
      this.stars = [];
      const palettes = [
        'rgba(255, 255, 255, ',     // Crisp diamond white
        'rgba(224, 242, 254, ',     // Ice starlight
        'rgba(56, 189, 248, ',      // Electric Sky Blue
        'rgba(186, 230, 253, '      // Soft galactic blue
      ];

      for (let i = 0; i < this.starCount; i++) {
        // Depth gradient: 0.15 (deep background) to 1.0 (crisp foreground)
        const depth = Math.random() * 0.85 + 0.15;
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: (Math.random() * 1.35 + 0.4) * depth,
          colorBase: palettes[Math.floor(Math.random() * palettes.length)],
          baseAlpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.025 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.14 * depth,
          vy: (Math.random() - 0.5) * 0.14 * depth,
          depth: depth
        });
      }
    }

    createDustParticles() {
      this.dustParticles = [];
      for (let i = 0; i < this.dustCount; i++) {
        this.dustParticles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 20 + 8,
          alpha: Math.random() * 0.045 + 0.012,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -Math.random() * 0.3 - 0.06, // Soft upward drift
          depth: Math.random() * 0.6 + 0.3
        });
      }
    }

    render() {
      // 60fps Spring/Lerp Parallax update
      this.mouse.currentX += (this.mouse.targetX - this.mouse.currentX) * this.mouse.ease;
      this.mouse.currentY += (this.mouse.targetY - this.mouse.currentY) * this.mouse.ease;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Render Deep Blue Nebula Energy Currents
      for (let i = 0; i < this.nebulaNodes.length; i++) {
        const node = this.nebulaNodes[i];
        node.phase += node.speed;

        const pulse = Math.sin(node.phase) * 28;
        const currentRadius = node.baseRadius + pulse;

        // Midground tilt parallax (~18px - 32px)
        const posX = node.xRel * this.width + this.mouse.currentX * node.tiltFactor;
        const posY = node.yRel * this.height + this.mouse.currentY * node.tiltFactor;

        const grad = this.ctx.createRadialGradient(posX, posY, 0, posX, posY, currentRadius);
        grad.addColorStop(0, node.colorCenter);
        grad.addColorStop(0.65, node.colorCenter.replace(/[\d\.]+\)$/, '0.035)'));
        grad.addColorStop(1, node.colorOuter);

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, currentRadius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 2. Render Drifting Cosmic Dust Specks
      for (let i = 0; i < this.dustParticles.length; i++) {
        const d = this.dustParticles[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.y < -d.radius) {
          d.y = this.height + d.radius;
          d.x = Math.random() * this.width;
        }

        const renderX = d.x + this.mouse.currentX * 32 * d.depth;
        const renderY = d.y + this.mouse.currentY * 32 * d.depth;

        const dustGrad = this.ctx.createRadialGradient(
          renderX, renderY, 0,
          renderX, renderY, d.radius
        );
        dustGrad.addColorStop(0, `rgba(56, 189, 248, ${d.alpha * 1.5})`);
        dustGrad.addColorStop(0.6, `rgba(56, 189, 248, ${d.alpha * 0.3})`);
        dustGrad.addColorStop(1, 'transparent');

        this.ctx.fillStyle = dustGrad;
        this.ctx.beginPath();
        this.ctx.arc(renderX, renderY, d.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 3. Render Multi-Depth Sparkling Stars (Foreground moves up to 55px)
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = this.width;
        if (s.x > this.width) s.x = 0;
        if (s.y < 0) s.y = this.height;
        if (s.y > this.height) s.y = 0;

        // Sparkling twinkle modulation
        s.twinklePhase += s.twinkleSpeed;
        const alpha = Math.max(0.08, s.baseAlpha + Math.sin(s.twinklePhase) * 0.32);

        // Deep 3D perspective displacement: foreground stars displace significantly faster
        const parallaxDisplacement = 55 * s.depth;
        const renderX = s.x + this.mouse.currentX * parallaxDisplacement;
        const renderY = s.y + this.mouse.currentY * parallaxDisplacement;

        this.ctx.fillStyle = `${s.colorBase}${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(renderX, renderY, s.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      requestAnimationFrame(() => this.render());
    }
  }

  /* ==========================================================================
     2. INTERACTIVE SPOTLIGHT CONTROLLER ("LET'S CONNECT")
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
          button.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          button.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
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
      this.mobileToggle = document.getElementById('mobile-toggle');
      this.mobileMenu = document.getElementById('mobile-menu');
      this.mobileLinks = document.querySelectorAll('.mobile-nav-link');
      this.isOpen = false;

      this.init();
    }

    init() {
      if (!this.mobileToggle || !this.mobileMenu) return;

      this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());

      // Auto-close drawer on mobile link click
      this.mobileLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMobileMenu());
      });

      // Keyboard accessibility
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMobileMenu();
        }
      });
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
    // 1. High-Reactivity 3D Cosmic Canvas
    new CosmicCanvas('cosmic-canvas');

    // 2. Cursor Spotlight on Connect Button
    new ButtonSpotlightController();

    // 3. Navigation Controller
    new NavigationController();

    // Verification Log
    if (window.CONTACT) {
      console.log(`%c[The Cosmic Horizon]%c Phase 1 Locked for ${window.CONTACT.name}`, 'color: #38bdf8; font-weight: bold;', 'color: #94A3B8;');
    }
  });

})();
