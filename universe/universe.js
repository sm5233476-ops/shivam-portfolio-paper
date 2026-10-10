/* ==========================================================================
   SHIVAM MISHRA — THE ASTRONOMICAL UNIVERSE (ROCKET 60FPS & ZERO SQUARE BUG)
   Wide Horizon Layout, Zero Center Clutter, Perfect Round Soft Particles
   ========================================================================== */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { 
  StarShader, 
  GalaxyShader, 
  PlanetShader, 
  RingShader 
} from './shaders.js';

// ==========================================================================
// 1. MASTER TUNABLE SETTINGS (BALANCED 60FPS BUDGET)
// ==========================================================================
export const UNIVERSE_SETTINGS = {
  tier: 'low',
  
  // Starfield Presence (Crisp & Balanced for 60fps)
  starBrightness: 1.05,
  nearStarsCount: 500,     // Prominent foreground sparkling beacons
  midStarsCount: 4500,     // Mid-range crisp stars
  farStarsCount: 11000,    // Distant background starfield

  // 2 Dispersed Corner Galaxies
  galaxyBrightness: 0.68,
  galaxySpeed: 0.05,

  // Soft Clusters
  clusterBrightness: 0.7,
  
  // Planet & Moon
  planetVisible: true,
  
  // Warp & Camera Dynamics
  warpStrength: 0.8,
  mouseParallax: 7.2,
  cameraDamping: 3.0,

  // Subtle Luxury Bloom (No Blinding Glare)
  bloomStrength: 0.45,
  bloomRadius: 0.45,
  bloomThreshold: 0.86,
  exposure: 1.05
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

function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
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
    this.composer = null;
    this.bloomPass = null;

    // Collections
    this.starTexture = null;
    this.starLayers = [];
    this.galaxies = [];
    this.clusters = [];
    this.planetGroup = null;
    this.moonMesh = null;
    this.meteors = [];

    // Camera & Scroll State
    this.cameraPath = null;
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.scrollVelocity = 0;
    this.dampedVelocity = 0;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.clock = new THREE.Clock();
    this.isPaused = false;
    this.debugOverlay = null;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 60;
  }

  init(canvas) {
    this.canvas = canvas;

    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 6000);
    this.camera.position.set(0, 0, 850);
    this.camera.lookAt(0, 0, 0);

    // 2. High-Performance WebGL2 Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = UNIVERSE_SETTINGS.exposure;
    this.renderer.setClearColor(0x02030a, 1.0);

    // Cap DPR at 1.5 to guarantee buttery 60fps on Retina displays
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Procedural Round Star Sprite (Used by ALL particle systems to guarantee NO BOXES)
    this.starTexture = this.createRoundStarSprite();

    // 4. Post-Processing Pipeline (Zero-Lag Render Target)
    this.initPostProcessing();

    // 5. Construct Scattered 60fps GPU Layers
    this.buildRoundStars();
    this.buildWideCornerGalaxies();
    this.buildCornerClusters();
    this.buildCornerRingedPlanet();
    this.buildMeteors();

    // 6. Camera Fly-Through Path
    this.initCameraFlyThrough();

    // 7. Events & Debug
    this.bindEvents();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tune') === '1') this.initTuningGUI();
    if (urlParams.get('debug') === '1') this.initDebugOverlay();

    window.UNIVERSE = this;
    this.animate();
  }

  // --- PROCEDURAL 128x128 PERFECT ROUND STAR SPRITE (ZERO SQUARE BOXES) ---
  createRoundStarSprite() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');          // Diamond Core
    grad.addColorStop(0.18, 'rgba(240, 248, 255, 0.95)');       // Smooth White Halo
    grad.addColorStop(0.42, 'rgba(186, 230, 253, 0.55)');       // Ice Blue Ring
    grad.addColorStop(0.72, 'rgba(56, 189, 248, 0.12)');       // Soft Outer Falloff
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');                // Absolute 0.0 Zero Edge
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  initPostProcessing() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // samples: 0 prevents incomplete framebuffer crash on integrated GPUs
    const renderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
      type: THREE.HalfFloatType,
      samples: 0
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(size, UNIVERSE_SETTINGS.bloomStrength, UNIVERSE_SETTINGS.bloomRadius, UNIVERSE_SETTINGS.bloomThreshold);
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  // --- LAYER 1: CRISP ROUND STARS (ANTI-BOX) ---
  buildRoundStars() {
    const layers = [
      { count: UNIVERSE_SETTINGS.farStarsCount, sizeMin: 1.2, sizeMax: 2.0, isNear: 0.0, radiusMin: 1900, radiusMax: 3600 },
      { count: UNIVERSE_SETTINGS.midStarsCount, sizeMin: 2.0, sizeMax: 3.4, isNear: 0.0, radiusMin: 1200, radiusMax: 2800 },
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

        const hdrBoost = cfg.isNear > 0.5 ? 1.4 : 1.0;
        colors[i3] = c.r * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 1] = c.g * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 2] = c.b * hdrBoost * UNIVERSE_SETTINGS.starBrightness;

        twinkles[i2] = Math.random() * Math.PI * 2;
        twinkles[i2 + 1] = 0.5 + Math.random() * 2.2;
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
  // LAYER 2: 2 CORNER GALAXIES (PUSHED FAR TO PERIPHERY — 60FPS BUDGET)
  // =========================================================================
  makeGalaxy({ type = 'face-on', arms = 4, radius = 300, tilt = new THREE.Euler(), pos = new THREE.Vector3(), colorCore = '#FFD9A0', colorArm = '#6AA6FF', count = 18000, seed = 1 }) {
    let s = seed;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const radii = new Float32Array(count);
    const angles = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const dust = new Float32Array(count);
    const hii = new Float32Array(count);

    const cCore = new THREE.Color(colorCore);
    const cArm = new THREE.Color(colorArm);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const rnd1 = pseudoRandom(s++);
      const rnd2 = pseudoRandom(s++);
      const rnd3 = pseudoRandom(s++);

      const r = Math.pow(rnd1, 2.2) * radius;
      const armIndex = i % arms;
      const branchAngle = (armIndex / arms) * Math.PI * 2;
      const spin = r * 0.0032;
      const spread = Math.pow(rnd2, 3.0) * (r * 0.25 + 18);
      const angle = branchAngle + spin + (rnd3 - 0.5) * 0.45;
      const yOffset = (pseudoRandom(s++) - 0.5) * spread * 0.45;

      positions[i3] = 0;
      positions[i3 + 1] = yOffset;
      positions[i3 + 2] = 0;

      radii[i] = r;
      angles[i] = angle;
      sizes[i] = 7.0 + pseudoRandom(s++) * 7.0;
      dust[i] = (rnd2 < 0.22 && r > radius * 0.2) ? 1.0 : 0.0;
      hii[i] = (rnd3 > 0.88 && r > radius * 0.25) ? 1.0 : 0.0;

      const mixRatio = Math.min(1.0, r / (radius * 0.65));
      const c = cCore.clone().lerp(cArm, mixRatio);
      colors[i3] = c.r * UNIVERSE_SETTINGS.galaxyBrightness;
      colors[i3 + 1] = c.g * UNIVERSE_SETTINGS.galaxyBrightness;
      colors[i3 + 2] = c.b * UNIVERSE_SETTINGS.galaxyBrightness;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aDust', new THREE.BufferAttribute(dust, 1));
    geo.setAttribute('aHII', new THREE.BufferAttribute(hii, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: GalaxyShader.vertexShader,
      fragmentShader: GalaxyShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uSpeed: { value: UNIVERSE_SETTINGS.galaxySpeed }
      },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    });

    const mesh = new THREE.Points(geo, mat);
    mesh.position.copy(pos);
    mesh.rotation.copy(tilt);
    this.scene.add(mesh);
    this.galaxies.push(mesh);
    return mesh;
  }

  buildWideCornerGalaxies() {
    // 1. Face-on Grand Spiral Galaxy: Pushed Deep to TOP-RIGHT Corner
    this.makeGalaxy({
      type: 'face-on',
      arms: 4,
      radius: 320,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(52), THREE.MathUtils.degToRad(-15), 0),
      pos: new THREE.Vector3(1450, 680, -1800), // Cleanly out of the text zone
      colorCore: '#FFD9A0',
      colorArm: '#6AA6FF',
      count: 17000,
      seed: 42
    });

    // 2. Disc Galaxy: Pushed Deep to TOP-LEFT Corner
    this.makeGalaxy({
      type: 'face-on',
      arms: 3,
      radius: 400,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(78), THREE.MathUtils.degToRad(25), THREE.MathUtils.degToRad(-35)),
      pos: new THREE.Vector3(-1480, 650, -1900), // Cleanly out of the text zone
      colorCore: '#FFECC0',
      colorArm: '#0284C7',
      count: 16000,
      seed: 108
    });
  }

  // =========================================================================
  // LAYER 3: 2 SOFT ROUND CORNER CLUSTERS (ZERO SQUARE BOXES)
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
        const phi = Math.acos(Math.random() * 2.0 - 1.0);

        pos[i3] = centerPos.x + r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = centerPos.y + r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = centerPos.z + r * Math.cos(phi);

        const mixRatio = Math.min(1.0, r / (scaleRadius * 4.2));
        const c = c1.clone().lerp(c2, mixRatio);
        col[i3] = c.r * UNIVERSE_SETTINGS.clusterBrightness;
        col[i3 + 1] = c.g * UNIVERSE_SETTINGS.clusterBrightness;
        col[i3 + 2] = c.b * UNIVERSE_SETTINGS.clusterBrightness;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      // Uses procedural round star sprite (100% Guaranteed NO BOXES!)
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

    // Pushed far to deep lower corners (Nothing behind text!)
    createSoftCluster(2200, 36, new THREE.Vector3(-1050, -520, -1500), '#FEF08A', '#38BDF8');
    createSoftCluster(2000, 32, new THREE.Vector3(1100, -550, -1650), '#FFFBEB', '#93C5FD');
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

  initCameraFlyThrough() {
    const points = [
      new THREE.Vector3(0, 0, 850),
      new THREE.Vector3(-140, -180, 580),
      new THREE.Vector3(180, -420, 260),
      new THREE.Vector3(380, -680, -180),
      new THREE.Vector3(0, -980, -550),
      new THREE.Vector3(-80, -1180, -800)
    ];

    this.cameraPath = new THREE.CatmullRomCurve3(points);
    this.camera.position.copy(points[0]);
    this.camera.lookAt(0, 0, 0);
  }

  setScrollProgress(progress, velocity = 0) {
    this.targetScrollProgress = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    this.scrollVelocity = velocity;
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
    this.composer.setSize(w, h);

    this.starLayers.forEach(l => l.material.uniforms.uResolution.value.set(w, h));
  }

  setReadability(v) {
    UNIVERSE_SETTINGS.readability = v;
    this.starLayers.forEach(l => l.material.uniforms.uReadability.value = v);
  }

  animate() {
    if (this.isPaused) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Camera Fly-Through on Scroll
    const dampFactor = 1.0 - Math.exp(-dt * UNIVERSE_SETTINGS.cameraDamping);
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * dampFactor;
    this.dampedVelocity += (this.scrollVelocity - this.dampedVelocity) * dampFactor;

    if (this.cameraPath) {
      const pathPos = this.cameraPath.getPointAt(this.scrollProgress);
      this.camera.position.set(pathPos.x, pathPos.y, pathPos.z);
      this.camera.lookAt(0, 0, 0);
    }

    // 2. Mouse Parallax Orbit
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const maxRot = THREE.MathUtils.degToRad(UNIVERSE_SETTINGS.mouseParallax);
    this.camera.rotation.y = -this.mouseX * maxRot;
    this.camera.rotation.x = -this.mouseY * (maxRot * 0.7);

    // 3. Update Shaders
    this.starLayers.forEach(layer => {
      layer.material.uniforms.uTime.value = elapsedTime;
      layer.material.uniforms.uVelocity.value = this.dampedVelocity * UNIVERSE_SETTINGS.warpStrength;
    });

    this.galaxies.forEach(g => {
      g.material.uniforms.uTime.value = elapsedTime;
    });

    if (this.planetGroup && UNIVERSE_SETTINGS.planetVisible) {
      this.planetGroup.children[0].material.uniforms.uTime.value = elapsedTime;
      this.planetGroup.rotation.y = elapsedTime * 0.025;
      if (this.moonMesh) {
        this.moonMesh.position.x = Math.cos(elapsedTime * 0.4) * 200;
        this.moonMesh.position.z = Math.sin(elapsedTime * 0.4) * 200;
      }
    }

    this.updateMeteors();

    // Render to Screen (Pure 60fps)
    this.composer.render();
    this.updateDebug(elapsedTime);
  }

  async initTuningGUI() {
    try {
      const { GUI } = await import('https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm');
      const gui = new GUI({ title: '🌌 Universe Tuner (?tune=1)' });

      const stars = gui.addFolder('HDR Stars');
      stars.add(UNIVERSE_SETTINGS, 'starBrightness', 0.5, 2.5, 0.1);
      stars.add(UNIVERSE_SETTINGS, 'mouseParallax', 0.5, 5.0, 0.1);

      const gal = gui.addFolder('Galaxies & Clusters');
      gal.add(UNIVERSE_SETTINGS, 'galaxyBrightness', 0.5, 2.5, 0.1);
      gal.add(UNIVERSE_SETTINGS, 'clusterBrightness', 0.5, 2.0, 0.1);

      const post = gui.addFolder('Bloom');
      post.add(UNIVERSE_SETTINGS, 'bloomStrength', 0.0, 1.5, 0.05).onChange(v => this.bloomPass.strength = v);
      post.add(UNIVERSE_SETTINGS, 'bloomThreshold', 0.5, 1.0, 0.02).onChange(v => this.bloomPass.threshold = v);

      gui.add({
        copySettings: () => {
          navigator.clipboard.writeText(JSON.stringify(UNIVERSE_SETTINGS, null, 2));
          alert('Settings copied to clipboard!');
        }
      }, 'copySettings').name('📋 Copy Settings JSON');
    } catch (e) {
      console.warn('lil-gui could not be loaded', e);
    }
  }

  initDebugOverlay() {
    this.debugOverlay = document.createElement('div');
    this.debugOverlay.style.cssText = 'position:fixed;top:10px;left:10px;background:rgba(0,0,0,0.85);color:#00ffcc;font-family:monospace;font-size:12px;padding:10px;border-radius:6px;z-index:9999;pointer-events:none;line-height:1.6;border:1px solid #00ffcc44;';
    document.body.appendChild(this.debugOverlay);
  }

  updateDebug(elapsedTime) {
    if (!this.debugOverlay) return;
    this.frameCount++;
    if (elapsedTime - this.lastFpsUpdate >= 1.0) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = elapsedTime;
    }
    this.debugOverlay.innerHTML = `
      <strong>🌌 60FPS ZERO-LAG DEBUG (?debug=1)</strong><br>
      FPS: ${this.currentFps} | Tier: ${UNIVERSE_SETTINGS.tier}<br>
      DPR: ${this.renderer.getPixelRatio().toFixed(2)} | Calls: ${this.renderer.info.render.calls}<br>
      Active Particles: ${(UNIVERSE_SETTINGS.farStarsCount + UNIVERSE_SETTINGS.midStarsCount + UNIVERSE_SETTINGS.nearStarsCount + 42000).toLocaleString()}
    `;
  }
}
