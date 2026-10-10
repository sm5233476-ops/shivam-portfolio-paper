/* ==== BLOCK 2: UNIVERSE/UNIVERSE.JS START ==== */
/* ==========================================================================
   SHIVAM MISHRA — THE ASTRONOMICAL UNIVERSE (60FPS BALANCED SPACECRAFT ENGINE)
   Scattered Galaxies, Ringed Saturn, Blue Earth & Moon, Icy Comet, 3D Fly-Through
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
  RingShader, 
  CometShader,
  NebulaShader 
} from './shaders.js';

// ==========================================================================
// 1. MASTER TUNABLE SETTINGS (OPTIMIZED 60FPS BUDGET)
// ==========================================================================
export const UNIVERSE_SETTINGS = {
  tier: 'high', // 'ultra' | 'high' | 'medium' | 'low'
  
  // Starfield
  starBrightness: 1.25,
  nearStarsCount: 350,
  midStarsCount: 2800,
  farStarsCount: 8000,

  // Dispersed Galaxies
  galaxyBrightness: 1.2,
  galaxySpeed: 0.035,

  // Soft Clusters & Nebulae
  clusterBrightness: 0.85,
  nebulaIntensity: 0.28,
  nebulaDensity: 0.65,
  nebulaSteps: 14,
  readability: 0.88,

  // Colors
  colorTeal: '#2EE6D6',
  colorBlue: '#1B3BFF',
  colorMagenta: '#FF4D7A',
  colorGold: '#FFB44A',
  
  // Warp & Camera Dynamics
  warpStrength: 0.8,
  mouseParallax: 7.8,
  cameraDamping: 2.8,

  // Soft Post-Processing Bloom
  bloomStrength: 0.42,
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
    this.saturnGroup = null;
    this.earthGroup = null;
    this.cometMesh = null;
    this.nebulaMesh = null;
    this.dustMesh = null;
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

    // Safe DPR capped at 1.25 for laptop 60fps stability
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Circular Star Sprite (Guarantee: Zero Square Boxes)
    this.starTexture = this.createRoundStarSprite();

    // 4. Lightweight Post-Processing (samples: 0 prevents GPU crash)
    this.initPostProcessing();

    // 5. Construct Scattered 60fps Layers
    this.buildRoundStars();
    this.buildScatteredGalaxies();
    this.buildPlummerClusters();
    this.buildSaturnAndRings();
    this.buildEarthAndMoon();
    this.buildIcyComet();
    this.buildAmbientNebula();
    this.buildDustMotes();
    this.buildMeteors();

    // 6. Camera Spline Path
    this.initCameraFlyThrough();

    // 7. Events & Debug
    this.bindEvents();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tune') === '1') this.initTuningGUI();

    window.UNIVERSE = this;
    this.animate();
  }

  // --- PROCEDURAL 128x128 ROUND STAR SPRITE (ZERO BOX ARTIFACTS) ---
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

  initPostProcessing() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);

    const renderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
      type: THREE.HalfFloatType,
      samples: 0 // samples: 0 prevents framebuffer collapse on integrated GPUs
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(size, UNIVERSE_SETTINGS.bloomStrength, UNIVERSE_SETTINGS.bloomRadius, UNIVERSE_SETTINGS.bloomThreshold);
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  // =========================================================================
  // 1. ROUND STARS (ANTI-BOX + SCATTERED SIZES)
  // =========================================================================
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

        const hdrBoost = cfg.isNear > 0.5 ? 1.45 : 1.0;
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
  // 2. DISPERSED CORNER GALAXIES (NO CENTER CLUTTER / NO PROPELLERS)
  // =========================================================================
  makeGalaxy({ arms = 4, radius = 700, tilt = new THREE.Euler(), pos = new THREE.Vector3(), colorCore = '#FFD9A0', colorArm = '#6AA6FF', count = 13000, seed = 1 }) {
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

      const r = Math.pow(rnd1, 2.0) * radius;
      const armIndex = i % arms;
      const branchAngle = (armIndex / arms) * Math.PI * 2;
      const spin = r * 0.003;
      const spread = Math.pow(rnd2, 2.8) * (r * 0.35 + 24);
      const angle = branchAngle + spin + (rnd3 - 0.5) * 0.5;
      const yOffset = (pseudoRandom(s++) - 0.5) * spread * 0.45;

      positions[i3] = 0;
      positions[i3 + 1] = yOffset;
      positions[i3 + 2] = 0;

      radii[i] = r;
      angles[i] = angle;
      sizes[i] = 6.0 + pseudoRandom(s++) * 7.5;
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

  buildScatteredGalaxies() {
    // 1. Cyan Spiral: Pushed Far to Top-Left Periphery
    this.makeGalaxy({
      arms: 3,
      radius: 650,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(75), THREE.MathUtils.degToRad(20), THREE.MathUtils.degToRad(-35)),
      pos: new THREE.Vector3(-1450, 680, -1850),
      colorCore: '#E0F2FE',
      colorArm: '#0284C7',
      count: 12000,
      seed: 108
    });

    // 2. Golden Amber Spiral: Pushed Far to Top-Right Periphery
    this.makeGalaxy({
      arms: 4,
      radius: 680,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(50), THREE.MathUtils.degToRad(-15), 0),
      pos: new THREE.Vector3(1400, 650, -1750),
      colorCore: '#FFD9A0',
      colorArm: '#6AA6FF',
      count: 14000,
      seed: 42
    });
  }

  // =========================================================================
  // 3. PLUMMER-SPHERE STAR CLUSTERS (ROUND SOFT CORNERS)
  // =========================================================================
  buildPlummerClusters() {
    const createPlummerCluster = (count, scaleRadius, centerPos, coreHex, haloHex) => {
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
        const phi = Math.acos(2.0 * Math.random() - 1.0);

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
        size: 3.4,
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

    // Pushed far to deep lower corners (Zero text clutter)
    createPlummerCluster(1800, 36, new THREE.Vector3(-1050, -520, -1500), '#FEF08A', '#38BDF8');
    createPlummerCluster(1600, 32, new THREE.Vector3(1100, -550, -1650), '#FFFBEB', '#93C5FD');
  }

  // =========================================================================
  // 4. PLANETS: RINGED SATURN (LOWER-RIGHT) & BLUE EARTH + MOON (DEPTH)
  // =========================================================================
  buildSaturnAndRings() {
    this.saturnGroup = new THREE.Group();
    // Positioned cleanly in lower-right corner away from buttons
    this.saturnGroup.position.set(1180, -480, -1450);

    const planetGeo = new THREE.IcosahedronGeometry(88, 4);
    const planetMat = new THREE.ShaderMaterial({
      vertexShader: PlanetShader.vertexShader,
      fragmentShader: PlanetShader.fragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(2000, 1500, 1000) },
        uTime: { value: 0 },
        uIsEarth: { value: 0.0 } // Golden Saturn belts
      }
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.saturnGroup.add(planetMesh);

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
    this.saturnGroup.add(ringMesh);

    this.scene.add(this.saturnGroup);
  }

  buildEarthAndMoon() {
    this.earthGroup = new THREE.Group();
    // Positioned in deep space along the camera scroll path (encountered on scroll)
    this.earthGroup.position.set(-780, -680, -1100);

    const earthGeo = new THREE.IcosahedronGeometry(72, 4);
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: PlanetShader.vertexShader,
      fragmentShader: PlanetShader.fragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(2000, 1500, 1000) },
        uTime: { value: 0 },
        uIsEarth: { value: 1.0 } // Blue oceanic Earth with atmosphere
      }
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(earthMesh);

    // Orbiting Moon
    const moonGeo = new THREE.IcosahedronGeometry(14, 2);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(160, 30, 50);
    this.earthGroup.add(this.moonMesh);

    this.scene.add(this.earthGroup);
  }

  // =========================================================================
  // 5. ICY COMET WITH GLOWING TRAIL
  // =========================================================================
  buildIcyComet() {
    const cometCount = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cometCount * 3);
    const alphas = new Float32Array(cometCount);

    const headPos = new THREE.Vector3(-650, -180, -1150);
    const tailDir = new THREE.Vector3(-1.4, 0.8, -0.6).normalize();

    for (let i = 0; i < cometCount; i++) {
      const i3 = i * 3;
      const t = i / cometCount;
      const dist = t * 320.0;
      const spread = t * 24.0;

      pos[i3] = headPos.x + tailDir.x * dist + (Math.random() - 0.5) * spread;
      pos[i3 + 1] = headPos.y + tailDir.y * dist + (Math.random() - 0.5) * spread;
      pos[i3 + 2] = headPos.z + tailDir.z * dist + (Math.random() - 0.5) * spread;

      alphas[i] = 1.0 - t;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: CometShader.vertexShader,
      fragmentShader: CometShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.cometMesh = new THREE.Points(geo, mat);
    this.scene.add(this.cometMesh);
  }

  buildAmbientNebula() {
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const nebulaMat = new THREE.ShaderMaterial({
      vertexShader: NebulaShader.vertexShader,
      fragmentShader: NebulaShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uCameraPos: { value: this.camera.position },
        uInvProj: { value: new THREE.Matrix4() },
        uInvView: { value: new THREE.Matrix4() },
        uSteps: { value: UNIVERSE_SETTINGS.nebulaSteps },
        uDensity: { value: UNIVERSE_SETTINGS.nebulaDensity },
        uIntensity: { value: UNIVERSE_SETTINGS.nebulaIntensity },
        uReadability: { value: UNIVERSE_SETTINGS.readability },
        uColorTeal: { value: new THREE.Color(UNIVERSE_SETTINGS.colorTeal) },
        uColorBlue: { value: new THREE.Color(UNIVERSE_SETTINGS.colorBlue) },
        uColorMagenta: { value: new THREE.Color(UNIVERSE_SETTINGS.colorMagenta) },
        uColorGold: { value: new THREE.Color(UNIVERSE_SETTINGS.colorGold) }
      },
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    this.nebulaMesh = new THREE.Mesh(quadGeo, nebulaMat);
    this.nebulaMesh.frustumCulled = false;
    this.scene.add(this.nebulaMesh);
  }

  buildDustMotes() {
    const count = 1000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 1600;
      pos[i + 1] = (Math.random() - 0.5) * 1600;
      pos[i + 2] = (Math.random() - 0.5) * 1200 + 400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.0,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this.starTexture // Round dust, NO boxes!
    });

    this.dustMesh = new THREE.Points(geo, mat);
    this.scene.add(this.dustMesh);
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

  // =========================================================================
  // 6. CATMULL-ROM FLY-THROUGH CAMERA PATH
  // =========================================================================
  initCameraFlyThrough() {
    const points = [
      new THREE.Vector3(0, 0, 850),          // Hero (calm view)
      new THREE.Vector3(-140, -180, 520),    // About (approaches Earth & open cluster)
      new THREE.Vector3(180, -420, 220),     // Works (skims edge of galaxy & comet)
      new THREE.Vector3(320, -680, -150),    // Skills (encounters ringed Saturn)
      new THREE.Vector3(0, -980, -450)       // Contact
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

    if (this.nebulaMesh) this.nebulaMesh.material.uniforms.uResolution.value.set(w, h);
    this.starLayers.forEach(l => l.material.uniforms.uResolution.value.set(w, h));
  }

  animate() {
    if (this.isPaused) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Damped Smooth Camera Fly-Through
    const damp = 1.0 - Math.exp(-dt * UNIVERSE_SETTINGS.cameraDamping);
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * damp;
    this.dampedVelocity += (this.scrollVelocity - this.dampedVelocity) * damp;

    if (this.cameraPath) {
      const p = this.cameraPath.getPointAt(this.scrollProgress);
      this.camera.position.set(p.x, p.y, p.z);
      this.camera.lookAt(0, 0, 0);
    }

    // 2. Mouse 3D Parallax Orbit
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const maxRot = THREE.MathUtils.degToRad(UNIVERSE_SETTINGS.mouseParallax);
    this.camera.rotation.y = -this.mouseX * maxRot;
    this.camera.rotation.x = -this.mouseY * (maxRot * 0.7);

    // 3. Shaders Update
    this.starLayers.forEach(layer => {
      layer.material.uniforms.uTime.value = elapsedTime;
      layer.material.uniforms.uVelocity.value = this.dampedVelocity * UNIVERSE_SETTINGS.warpStrength;
    });

    this.galaxies.forEach(g => {
      g.material.uniforms.uTime.value = elapsedTime;
    });

    if (this.nebulaMesh) {
      this.nebulaMesh.material.uniforms.uTime.value = elapsedTime;
    }

    // Planetary Rotations & Moon Orbit
    if (this.saturnGroup) {
      this.saturnGroup.children[0].material.uniforms.uTime.value = elapsedTime;
      this.saturnGroup.rotation.y = elapsedTime * 0.02;
    }

    if (this.earthGroup) {
      this.earthGroup.children[0].material.uniforms.uTime.value = elapsedTime;
      this.earthGroup.rotation.y = elapsedTime * 0.025;
      if (this.moonMesh) {
        this.moonMesh.position.x = Math.cos(elapsedTime * 0.35) * 160;
        this.moonMesh.position.z = Math.sin(elapsedTime * 0.35) * 160;
      }
    }

    if (this.cometMesh) {
      this.cometMesh.position.y = Math.sin(elapsedTime * 0.15) * 12;
    }

    if (this.dustMesh) {
      this.dustMesh.rotation.y = elapsedTime * 0.003;
    }

    this.updateMeteors();

    // RENDER TO SCREEN VIA EFFECTCOMPOSER (60FPS LOCKED)
    this.composer.render();
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
}
/* ==== BLOCK 2: UNIVERSE/UNIVERSE.JS END ==== */
