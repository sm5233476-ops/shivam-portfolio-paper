/**
 * ============================================================================
 * THE COSMIC HORIZON — THREE.JS WEBGL 3D ENGINE
 * Shivam Mishra | 3D Deep Space Starfield, Nebula Clusters & 3D Parallax
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. THREE.JS WEBGL 3D UNIVERSE ENGINE (BEHFAR.DEV STYLE)
     ========================================================================== */

  class CosmicUniverse {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas || typeof THREE === 'undefined') {
        console.warn('[The Cosmic Horizon] Three.js not detected or canvas missing.');
        return;
      }

      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Mouse Parallax Physics
      this.mouse = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        ease: 0.05
      };

      this.clock = new THREE.Clock();

      this.init();
    }

    init() {
      // 1. Scene, Camera, Renderer Setup
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 2500);
      this.camera.position.z = 400;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(this.width, this.height);
      this.renderer.setClearColor(0x000000, 0);

      // 2. Generate Textures & Entities
      this.particleTexture = this.createGlowingParticleTexture();
      this.createDeepStarfield();
      this.createNebulaClusters();

      // 3. Event Listeners & Animation Loop
      this.bindEvents();
      this.render();
    }

    // Procedural Glowing Circular Particle Texture (Awwwards-quality soft glow)
    createGlowingParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(224, 242, 254, 0.85)');
      gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    // 3,200+ 3D Deep Space Stars (z: -1000 to +500)
    createDeepStarfield() {
      const starCount = 3200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const scales = new Float32Array(starCount);

      const colorPalette = [
        new THREE.Color(0xffffff), // Crisp Diamond White
        new THREE.Color(0xe0f2fe), // Soft Ice Starlight
        new THREE.Color(0x38bdf8), // Electric Sky Blue
        new THREE.Color(0xfde68a)  // Soft Warm Starlight
      ];

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Spread stars widely across 3D viewport
        positions[i3] = (Math.random() - 0.5) * 1600;
        positions[i3 + 1] = (Math.random() - 0.5) * 1600;
        positions[i3 + 2] = (Math.random() - 0.5) * 1500 - 250; // z: -1000 to +500

        const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = chosenColor.r;
        colors[i3 + 1] = chosenColor.g;
        colors[i3 + 2] = chosenColor.b;

        scales[i] = Math.random() * 2.2 + 0.6;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

      const material = new THREE.PointsMaterial({
        size: 3.2,
        map: this.particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.starField = new THREE.Points(geometry, material);
      this.scene.add(this.starField);
    }

    // Procedural Glowing Nebula Dust Clusters (Amber/Gold, Electric Cyan, and Ethereal White)
    createNebulaClusters() {
      const clusterCount = 1400;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(clusterCount * 3);
      const colors = new Float32Array(clusterCount * 3);

      const nebulaColors = [
        new THREE.Color(0x38bdf8), // Electric Cyan
        new THREE.Color(0x0284c7), // Deep Ocean Azure
        new THREE.Color(0xf59e0b), // Amber / Gold Starlight
        new THREE.Color(0xd97706), // Warm Nebula Core
        new THREE.Color(0x818cf8)  // Soft Celestial Indigo
      ];

      for (let i = 0; i < clusterCount; i++) {
        const i3 = i * 3;

        // Clustered celestial distribution
        const radius = Math.random() * 550 + 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.7;

        positions[i3] = radius * Math.cos(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi);
        positions[i3 + 2] = radius * Math.cos(phi) * Math.sin(theta) - 200;

        const col = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        colors[i3] = col.r;
        colors[i3 + 1] = col.g;
        colors[i3 + 2] = col.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 14.0,
        map: this.particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.nebulaMesh = new THREE.Points(geometry, material);
      this.scene.add(this.nebulaMesh);
    }

    bindEvents() {
      window.addEventListener('resize', () => this.onResize(), { passive: true });

      // Cursor Parallax Tracker: Normalized [-1.0, 1.0]
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
        this.mouse.targetY = (e.clientY / this.height - 0.5) * 2;
      }, { passive: true });

      // Mobile Gyro/Touch Parallax Fallback
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          this.mouse.targetX = (touch.clientX / this.width - 0.5) * 1.5;
          this.mouse.targetY = (touch.clientY / this.height - 0.5) * 1.5;
        }
      }, { passive: true });
    }

    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    render() {
      const delta = this.clock.getDelta();

      // Smooth 3D Mouse Parallax Lerping
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * this.mouse.ease;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * this.mouse.ease;

      // 3D Camera Translation (behfar.dev style responsive navigation)
      const targetCamX = this.mouse.x * 120;
      const targetCamY = -this.mouse.y * 90;
      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, 0, -200);

      // Subtle Galactic Drift Rotations
      if (this.starField) {
        this.starField.rotation.y += 0.00025;
        this.starField.rotation.x += 0.0001;
      }

      if (this.nebulaMesh) {
        this.nebulaMesh.rotation.y -= 0.0004;
        this.nebulaMesh.rotation.z += 0.00015;
      }

      this.renderer.render(this.scene, this.camera);
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

      // Close drawer when any mobile nav link is selected
      this.mobileLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMobileMenu());
      });

      // Keyboard escape accessibility support
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
    // 1. Initialize Three.js WebGL 3D Universe
    new CosmicUniverse('cosmic-canvas');

    // 2. Cursor Spotlight on Connect Button
    new ButtonSpotlightController();

    // 3. Navigation Controller
    new NavigationController();

    // Verification Log
    if (window.CONTACT) {
      console.log(`%c[The Cosmic Horizon]%c Three.js WebGL Universe Online for ${window.CONTACT.name}`, 'color: #38bdf8; font-weight: bold;', 'color: #94A3B8;');
    }
  });

})();
