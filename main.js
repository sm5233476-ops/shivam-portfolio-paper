/**
 * ============================================================================
 * THE COSMIC HORIZON — CORE ENGINE
 * Shivam Mishra | Elite Creative Technologist Portfolio
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. COSMIC CANVAS ENGINE (STARS, DUST & GLOWING BUBBLES)
     ========================================================================== */

  class CosmicCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Viewport Dimensions
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Mouse Parallax Physics
      this.mouse = {
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        ease: 0.05
      };

      // Entities
      this.particles = [];
      this.bubbles = [];
      this.particleCount = this.calculateParticleCount();
      this.bubbleCount = 6;

      this.animationFrameId = null;

      this.init();
    }

    calculateParticleCount() {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(Math.floor(area / 7500), 160);
    }

    init() {
      this.resize();
      this.createParticles();
      this.createBubbles();
      this.bindEvents();
      this.render();
    }

    bindEvents() {
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Cursor Parallax Tracker
      window.addEventListener('mousemove', (e) => {
        // Map cursor coordinates from -1.0 to 1.0 relative to screen center
        this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
        this.mouse.targetY = (e.clientY / this.height - 0.5) * 2;
      }, { passive: true });

      // Subtle Touch Parallax for Mobile Devices
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

      // Re-populate counts if screen size changes drastically
      const newCount = this.calculateParticleCount();
      if (Math.abs(this.particles.length - newCount) > 30) {
        this.particleCount = newCount;
        this.createParticles();
      }
    }

    createParticles() {
      this.particles = [];
      const colors = [
        'rgba(243, 243, 247, ', // Crisp Starlight
        'rgba(230, 198, 135, ', // Champagne Accent
        'rgba(100, 210, 255, ', // Subtle Electric Cyan
        'rgba(180, 175, 220, '  // Ethereal Violet
      ];

      for (let i = 0; i < this.particleCount; i++) {
        const depth = Math.random() * 0.85 + 0.15; // 3D depth layer (0.15 - 1.0)
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: (Math.random() * 1.4 + 0.4) * depth,
          colorBase: colors[Math.floor(Math.random() * colors.length)],
          baseAlpha: Math.random() * 0.65 + 0.25,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.18 * depth,
          vy: (Math.random() - 0.5) * 0.18 * depth,
          depth: depth
        });
      }
    }

    createBubbles() {
      this.bubbles = [];
      const palettes = [
        {
          start: 'rgba(230, 198, 135, 0.08)',
          mid: 'rgba(230, 198, 135, 0.02)'
        },
        {
          start: 'rgba(137, 112, 255, 0.07)',
          mid: 'rgba(100, 150, 255, 0.02)'
        },
        {
          start: 'rgba(100, 210, 255, 0.06)',
          mid: 'rgba(80, 120, 240, 0.015)'
        }
      ];

      for (let i = 0; i < this.bubbleCount; i++) {
        const palette = palettes[i % palettes.length];
        this.bubbles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 180 + 140, // 140px to 320px soft radius
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          palette: palette,
          pulseSpeed: Math.random() * 0.008 + 0.004,
          pulsePhase: Math.random() * Math.PI * 2,
          depth: Math.random() * 0.4 + 0.2
        });
      }
    }

    render() {
      // Smooth Damped Mouse Lerp for 60fps Parallax
      this.mouse.currentX += (this.mouse.targetX - this.mouse.currentX) * this.mouse.ease;
      this.mouse.currentY += (this.mouse.targetY - this.mouse.currentY) * this.mouse.ease;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render Soft Drifting Glowing Bubbles (withhoney.com inspiration)
      for (let i = 0; i < this.bubbles.length; i++) {
        const b = this.bubbles[i];

        // Drift
        b.x += b.vx;
        b.y += b.vy;

        // Wrap viewport edges smoothly with padding
        if (b.x < -b.radius) b.x = this.width + b.radius;
        if (b.x > this.width + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = this.height + b.radius;
        if (b.y > this.height + b.radius) b.y = -b.radius;

        // Subtle Breathing Radius
        b.pulsePhase += b.pulseSpeed;
        const dynamicRadius = b.radius + Math.sin(b.pulsePhase) * 20;

        // 3D Parallax offset
        const parallaxX = b.x + this.mouse.currentX * 35 * b.depth;
        const parallaxY = b.y + this.mouse.currentY * 35 * b.depth;

        // Draw Soft Radial Glow
        const gradient = this.ctx.createRadialGradient(
          parallaxX, parallaxY, 0,
          parallaxX, parallaxY, dynamicRadius
        );
        gradient.addColorStop(0, b.palette.start);
        gradient.addColorStop(0.55, b.palette.mid);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(parallaxX, parallaxY, dynamicRadius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Render Cosmic Dust & Twinkling Starfield (behfar.dev inspiration)
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Boundary wrap
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        // Twinkle Alpha Modulation
        p.twinklePhase += p.twinkleSpeed;
        const alpha = Math.max(0.08, p.baseAlpha + Math.sin(p.twinklePhase) * 0.3);

        // 3D Depth Perspective Parallax Displacement
        const offsetX = this.mouse.currentX * 45 * p.depth;
        const offsetY = this.mouse.currentY * 45 * p.depth;
        const renderX = p.x + offsetX;
        const renderY = p.y + offsetY;

        this.ctx.fillStyle = `${p.colorBase}${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.animationFrameId = requestAnimationFrame(() => this.render());
    }
  }

  /* ==========================================================================
     2. NAVIGATION & MOBILE DRAWER CONTROLLER
     ========================================================================== */

  class NavigationController {
    constructor() {
      this.header = document.getElementById('site-header');
      this.mobileToggle = document.getElementById('mobile-toggle');
      this.mobileMenu = document.getElementById('mobile-menu');
      this.mobileLinks = document.querySelectorAll('.mobile-nav-link');
      this.pillLinks = document.querySelectorAll('.nav-pill-link');
      this.isOpen = false;

      this.init();
    }

    init() {
      if (!this.mobileToggle || !this.mobileMenu) return;

      this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());

      // Close drawer when any mobile nav link is clicked
      this.mobileLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMobileMenu());
      });

      // Escape key accessibility support
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMobileMenu();
        }
      });

      // Scroll listener for subtle header elevation
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          this.header.style.backgroundColor = 'rgba(3, 3, 5, 0.75)';
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
     3. SLOT MARKERS & EXTENSIONS
     ========================================================================== */

  // @@SLOT:hero @@

  // @@SLOT:about @@

  // @@SLOT:works @@

  // @@SLOT:skills @@

  // @@SLOT:contact @@

  /* ==========================================================================
     4. BOOTSTRAP APPLICATION
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    // Initialize Cosmic Canvas
    new CosmicCanvas('cosmic-canvas');

    // Initialize Navigation
    new NavigationController();

    // Verification log
    if (window.CONTACT) {
      console.log(`%c[Cosmic Horizon]%c Ready for ${window.CONTACT.name}`, 'color: #E6C687; font-weight: bold;', 'color: #A0A0B0;');
    }
  });

})();
