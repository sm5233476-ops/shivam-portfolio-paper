/* ==========================================================================
   SHIVAM MISHRA — THE ASTRONOMICAL UNIVERSE (NO PROPELLER BLADES / PURE 60FPS)
   Organic Soft Nebula Galaxies + Ringed Planet + Clean Space Horizon
   ========================================================================== */

import * as THREE from 'three';

import { 
  StarShader, 
  PlanetShader, 
  RingShader 
} from './shaders.js';

// ==========================================================================
// 1. MASTER TUNABLE SETTINGS
// ==========================================================================
export const UNIVERSE_SETTINGS = {
  // Starfield
  starBrightness: 1.25,
  nearStarsCount: 450,
  midStarsCount: 3800,
  farStarsCount: 10000,

  // Soft Cloud Galaxies (No Propeller Blades)
  galaxyBrightness: 1.2,
  galaxySpeed: 0.03,

  // Clusters & Planet
  clusterBrightness: 0.85,
  planetVisible: true,
  
  // Dynamics
  mouseParallax: 2.0
};

function kelvinToRGB(kelvin) {
  const temp = kelvin / 100;
  let r, g, b;

  if (temp <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    b = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    b = 255;
  }

  return new THREE.Color(
    Math.min(255, Math.max(0, r)) / 255,
    Math.min(255, Math.max(0, g)) / 255,
    Math.min(255, Math.max(0, b)) / 255
  );
}

// ==========================================================================
// 2. THE UNIVERSE ENGINE CLASS
// ==========================================================================
export class Universe {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;

    // Collections
    this.starTexture = null;
    this.starLayers = [];
    this.galaxies = [];
    this.clusters = [];
    this.planetGroup = null;
    this.moonMesh = null;
    this.meteors = [];

    // Scroll
    this.scrollProgress = 0;
    this.targetScrollZ = 850;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.clock = new THREE.Clock();
    this.isPaused = false;
  }

  init(canvas) {
    this.canvas = canvas;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5500);
    this.camera.position.set(0, 0, 850);
    this.camera.lookAt(0, 0, 0);

    // 2. Direct WebGL2 Renderer (Pure 60fps)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setClearColor(0x02030a, 1.0);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Perfect Round Star Sprite (No Boxes)
    this.starTexture = this.createRoundStarSprite();

    // 4. Construct GPU Layers
    this.buildRoundStars();
    this.buildSoftCloudGalaxies(); // Organic Soft Clouds (No Ninja Stars!)
    this.buildCornerClusters();
    this.buildCornerRingedPlanet();
    this.buildMeteors();

    // 5. Events
    this.bindEvents();

    window.UNIVERSE = this;
    this.animate();
  }

  createRoundStarSprite() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');          // Brilliant Diamond Core
    grad.addColorStop(0.18, 'rgba(240, 248, 255, 0.95)');       // Smooth White Halo
    grad.addColorStop(0.42, 'rgba(186, 230, 253, 0.6)');        // Ice Blue Ring
    grad.addColorStop(0.72, 'rgba(56, 189, 248, 0.15)');       // Soft Outer Glow
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');                // Zero Hard Edges
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // --- LAYER 1: STARS (BALANCED FOR 60FPS) ---
  buildRoundStars() {
    const layers = [
      { count: UNIVERSE_SETTINGS.farStarsCount, sizeMin: 1.2, sizeMax: 2.0, isNear: 0.0, radiusMin: 1900, radiusMax: 3500 },
      { count: UNIVERSE_SETTINGS.midStarsCount, sizeMin: 2.0, sizeMax: 3.2, isNear: 0.0, radiusMin: 1200, radiusMax: 2700 },
      { count: UNIVERSE_SETTINGS.nearStarsCount, sizeMin: 4.5, sizeMax: 7.5, isNear: 1.0, radiusMin: 650, radiusMax: 1800 }
    ];

    layers.forEach(cfg => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(cfg.count * 3);
      const sizes = new Float32Array(cfg.count);
      const colors = new Float32Array(cfg.count * 3);
      const twinkles = new Float32Array(cfg.count * 2);
      const isNear = new Float32Array(cfg.count);

      for (let i = 0; i < cfg.count; i++) {
        const i3 = i * 3;
        const i2 = i * 2;

        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = cfg.radiusMin + Math.random() * (cfg.radiusMax - cfg.radiusMin);

        pos[i3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = r * Math.cos(phi);

        sizes[i] = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);

        const temp = 3500 + Math.random() * 8500;
        const c = kelvinToRGB(temp);

        const hdrBoost = cfg.isNear > 0.5 ? 1.5 : 1.0;
        colors[i3] = c.r * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 1] = c.g * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 2] = c.b * hdrBoost * UNIVERSE_SETTINGS.starBrightness;

        twinkles[i2] = Math.random() * Math.PI * 2;
        twinkles[i2 + 1] = 0.5 + Math.random() * 2.0;
        isNear[i] = cfg.isNear;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles, 2));
      geo.setAttribute('aIsNear', new THREE.BufferAttribute(isNear, 1));

      const mat = new THREE.ShaderMaterial({
        vertexShader: StarShader.vertexShader,
        fragmentShader: StarShader.fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: this.renderer.getPixelRatio() },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uReadability: { value: 0.0 },
          uVelocity: { value: 0 }
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
      });

      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);
      this.starLayers.push(pts);
    });
  }

  // =========================================================================
  // LAYER 2: ORGANIC SOFT CLOUD GALAXIES (NO PROPELLERS / NO BLADES!)
  // =========================================================================
  buildSoftCloudGalaxies() {
    const galaxyConfigs = [
      // 1. Golden Amber Cloud Galaxy: Top-Right Corner
      {
        pos: new THREE.Vector3(1200, 520, -1650),
        rot: new THREE.Euler(0.7, -0.4, 0.45),
        radius: 480,
        particles: 14000,
        coreColor: '#FFFBEB',
        outerColor: '#F59E0B',
        speed: 0.03
      },
      // 2. Cyan Ice Cloud Galaxy: Top-Left Corner
      {
        pos: new THREE.Vector3(-1250, 480, -1700),
        rot: new THREE.Euler(0.85, 0.35, -0.55),
        radius: 460,
        particles: 14000,
        coreColor: '#E0F2FE',
        outerColor: '#0284C7',
        speed: -0.025
      }
    ];

    galaxyConfigs.forEach(cfg => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(cfg.particles * 3);
      const colors = new Float32Array(cfg.particles * 3);

      const c1 = new THREE.Color(cfg.coreColor);
      const c2 = new THREE.Color(cfg.outerColor);

      for (let i = 0; i < cfg.particles; i++) {
        const i3 = i * 3;

        // Organic Volumetric Disc Scatter (Fluffy Cloud Distribution, No Thin Lines!)
        const r = Math.pow(Math.random(), 1.7) * cfg.radius;
        const angle = Math.random() * Math.PI * 2;
        const swirl = r * 0.0022;

        // Broad fluffy scatter prevents propeller blades
        const spreadX = (Math.random() - 0.5) * (r * 0.55 + 30);
        const spreadY = (Math.random() - 0.5) * (r * 0.35 + 20);
        const spreadZ = (Math.random() - 0.5) * (r * 0.55 + 30);

        pos[i3] = Math.cos(angle + swirl) * r + spreadX;
        pos[i3 + 1] = spreadY;
        pos[i3 + 2] = Math.sin(angle + swirl) * r + spreadZ;

        const mixRatio = Math.min(1.0, r / (cfg.radius * 0.7));
        const c = c1.clone().lerp(c2, mixRatio);

        colors[i3] = c.r * UNIVERSE_SETTINGS.galaxyBrightness;
        colors[i3 + 1] = c.g * UNIVERSE_SETTINGS.galaxyBrightness;
        colors[i3 + 2] = c.b * UNIVERSE_SETTINGS.galaxyBrightness;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Uses procedural round star sprite (Soft, Luminous, Round)
      const mat = new THREE.PointsMaterial({
        size: 5.5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        map: this.starTexture,
        opacity: 0.82
      });

      const mesh = new THREE.Points(geo, mat);
      mesh.position.copy(cfg.pos);
      mesh.rotation.copy(cfg.rot);
      this.scene.add(mesh);
      this.galaxies.push({ mesh, speed: cfg.speed });
    });
  }

  // =========================================================================
  // LAYER 3: 2 SOFT ROUND CORNER CLUSTERS
  // =========================================================================
  buildCornerClusters() {
    const createSoftCluster = (count, scaleRadius, centerPos, coreHex, haloHex) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const c1 = new THREE.Color(coreHex);
      const c2 = new THREE.Color(haloHex);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const U = Math.max(0.001, Math.random());
        const r = scaleRadius / Math.sqrt(Math.pow(U, -2.0 / 3.0) - 1.0);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2.0 * v_rnd() - 1.0);

        pos[i3] = centerPos.x + r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = centerPos.y + r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = centerPos.z + r * Math.cos(phi);

        const mixRatio = Math.min(1.0, r / (scaleRadius * 4.2));
        const c = c1.clone().lerp(c2, mixRatio);
        col[i3] = c.r * UNIVERSE_SETTINGS.clusterBrightness;
        col[i3 + 1] = c.g * UNIVERSE_SETTINGS.clusterBrightness;
        col[i3 + 2] = c.b * UNIVERSE_SETTINGS.clusterBrightness;
      }

      function v_rnd() { return Math.random(); }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        map: this.starTexture
      });

      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);
      this.clusters.push(pts);
    };

    createSoftCluster(1600, 36, new THREE.Vector3(-1050, -520, -1500), '#FEF08A', '#38BDF8');
    createSoftCluster(1400, 32, new THREE.Vector3(1100, -550, -1650), '#FFFBEB', '#93C5FD');
  }

  // =========================================================================
  // LAYER 4: RINGED GAS GIANT PLANET (CORNER POSITIONED)
  // =========================================================================
  buildCornerRingedPlanet() {
    this.planetGroup = new THREE.Group();
    // Shifted into the lower-right quadrant away from text and buttons
    this.planetGroup.position.set(1150, -480, -1450);

    const planetGeo = new THREE.IcosahedronGeometry(90, 4);
    const planetMat = new THREE.ShaderMaterial({
      vertexShader: PlanetShader.vertexShader,
      fragmentShader: PlanetShader.fragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(2000, 1500, 1000) },
        uTime: { value: 0 }
      }
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.planetGroup.add(planetMesh);

    const ringGeo = new THREE.PlaneGeometry(440, 440);
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: RingShader.vertexShader,
      fragmentShader: RingShader.fragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(2000, 1500, 1000) }
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = THREE.MathUtils.degToRad(68);
    ringMesh.rotation.y = THREE.MathUtils.degToRad(18);
    this.planetGroup.add(ringMesh);

    // Orbiting Moon
    const moonGeo = new THREE.IcosahedronGeometry(14, 2);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(200, 35, 70);
    this.planetGroup.add(this.moonMesh);

    this.scene.add(this.planetGroup);
  }

  buildMeteors() {
    for (let i = 0; i < 2; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        linewidth: 2
      });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);

      this.meteors.push({
        line, geo, mat,
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        length: 220,
        life: 0,
        maxLife: 50,
        timer: Math.random() * 450 + 150
      });
    }
  }

  updateMeteors() {
    this.meteors.forEach(m => {
      if (!m.active) {
        m.timer--;
        if (m.timer <= 0) {
          m.active = true;
          m.life = 0;
          m.maxLife = Math.floor(Math.random() * 22 + 35);
          m.pos.set((Math.random() - 0.5) * 1800 + 300, Math.random() * 900 + 300, (Math.random() - 0.5) * 500);
          const spd = Math.random() * 24 + 28;
          m.vel.set(-spd, -spd * 0.72, (Math.random() - 0.5) * 6);
          m.mat.opacity = 1;
        }
      } else {
        m.life++;
        m.pos.add(m.vel);
        const head = m.pos;
        const tail = m.pos.clone().sub(m.vel.clone().normalize().multiplyScalar(m.length));

        const arr = m.geo.attributes.position.array;
        arr[0] = tail.x; arr[1] = tail.y; arr[2] = tail.z;
        arr[3] = head.x; arr[4] = head.y; arr[5] = head.z;
        m.geo.attributes.position.needsUpdate = true;

        m.mat.opacity = Math.max(0, 1.0 - (m.life / m.maxLife));
        if (m.life >= m.maxLife) {
          m.active = false;
          m.mat.opacity = 0;
          m.timer = Math.random() * 600 + 350;
        }
      }
    });
  }

  setScrollProgress(progress) {
    this.scrollProgress = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    this.targetScrollZ = 850 - (this.scrollProgress * 350);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      this.targetMouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.starLayers.forEach(l => l.material.uniforms.uResolution.value.set(w, h));
  }

  // =========================================================================
  // DIRECT 60FPS HARDWARE RENDER LOOP
  // =========================================================================
  animate() {
    if (this.isPaused) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Camera Z-Flight on Scroll
    this.camera.position.z += (this.targetScrollZ - this.camera.position.z) * 0.06;

    // 2. Mouse 3D Parallax Orbit
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const maxRot = THREE.MathUtils.degToRad(UNIVERSE_SETTINGS.mouseParallax);
    this.camera.rotation.y = -this.mouseX * maxRot;
    this.camera.rotation.x = -this.mouseY * (maxRot * 0.7);

    // 3. Update Shaders
    this.starLayers.forEach(layer => {
      layer.material.uniforms.uTime.value = elapsedTime;
    });

    // Slow majestic organic drift of cloud galaxies
    this.galaxies.forEach(g => {
      g.mesh.rotation.y = elapsedTime * g.speed;
    });

    if (this.planetGroup && UNIVERSE_SETTINGS.planetVisible) {
      this.planetGroup.children[0].material.uniforms.uTime.value = elapsedTime;
      this.planetGroup.rotation.y = elapsedTime * 0.02;
      if (this.moonMesh) {
        this.moonMesh.position.x = Math.cos(elapsedTime * 0.4) * 200;
        this.moonMesh.position.z = Math.sin(elapsedTime * 0.4) * 200;
      }
    }

    this.updateMeteors();

    // DIRECT HARDWARE RENDER (PURE 60FPS / ZERO OVERHEAD)
    this.renderer.render(this.scene, this.camera);
  }
}
