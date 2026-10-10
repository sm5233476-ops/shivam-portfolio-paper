/* ==========================================================================
   SHIVAM MISHRA — ASTRONOMICAL UNIVERSE GRAPHICS ENGINE (PROMPT B ARCHITECTURE)
   Galaxy Factory (3 Types), Plummer Clusters, Ringed Planet, POIS Fly-Through
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
  NebulaShader 
} from './shaders.js';

// ==========================================================================
// 1. MASTER TUNABLE SETTINGS OBJECT (Adjustable via ?tune=1)
// ==========================================================================
export const UNIVERSE_SETTINGS = {
  tier: 'high', // 'ultra' | 'high' | 'medium' | 'low'
  
  // Starfield
  starBrightness: 1.35,
  nearStarsCount: 1800,
  midStarsCount: 12000,
  farStarsCount: 30000,

  // Galaxy Factory
  galaxyBrightness: 1.4,
  galaxySpeed: 0.08,

  // Clusters & Deep Space
  clusterBrightness: 1.35,
  
  // Volumetric Nebula
  nebulaIntensity: 0.35,
  nebulaDensity: 0.85,
  nebulaSteps: 24,
  readability: 0.85,
  colorTeal: '#2EE6D6',
  colorBlue: '#1B3BFF',
  colorMagenta: '#FF4D7A',
  colorGold: '#FFB44A',

  // Planet & Moon
  planetVisible: true,
  
  // Warp & Camera Dynamics
  warpStrength: 1.0,
  mouseParallax: 2.2,
  cameraDamping: 3.0,

  // Post-Processing
  bloomStrength: 0.72,
  bloomRadius: 0.5,
  bloomThreshold: 0.82,
  exposure: 1.1
};

// Astronomical Blackbody Radiation (3000K to 12000K)
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
    this.nebulaMesh = null;
    this.starLayers = [];
    this.galaxies = [];
    this.clusters = [];
    this.planetGroup = null;
    this.moonMesh = null;
    this.dustMesh = null;
    this.meteors = [];

    // Camera & Scroll State
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

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tier')) UNIVERSE_SETTINGS.tier = urlParams.get('tier');

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 6000);
    this.camera.position.set(0, 0, 850);
    this.camera.lookAt(0, 0, 0);

    // 2. WebGL2 Renderer
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

    const dprCap = UNIVERSE_SETTINGS.tier === 'ultra' ? 2.0 :
                   UNIVERSE_SETTINGS.tier === 'high' ? 1.75 :
                   UNIVERSE_SETTINGS.tier === 'medium' ? 1.5 : 1.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Post-Processing Pipeline (Safe Order: RenderPass -> Bloom -> OutputPass)
    this.initPostProcessing();

    // 4. Construct GPU Layers
    this.buildRoundStars();
    this.buildAllGalaxies();
    this.buildStarClusters();
    this.buildVolumetricNebula();
    this.buildRingedPlanetAndMoon();
    this.buildDustMotes();
    this.buildMeteors();

    // 5. Events & GUI
    this.bindEvents();

    if (urlParams.get('tune') === '1') this.initTuningGUI();
    if (urlParams.get('debug') === '1') this.initDebugOverlay();

    window.UNIVERSE = this;
    this.animate();
  }

  // --- CLEAN POST-PROCESSING (NEVER BLACKS OUT) ---
  initPostProcessing() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const msaaSamples = (UNIVERSE_SETTINGS.tier === 'ultra' || UNIVERSE_SETTINGS.tier === 'high') ? 4 : 
                        (UNIVERSE_SETTINGS.tier === 'medium') ? 2 : 0;

    const renderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
      type: THREE.HalfFloatType,
      samples: msaaSamples
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(size, UNIVERSE_SETTINGS.bloomStrength, UNIVERSE_SETTINGS.bloomRadius, UNIVERSE_SETTINGS.bloomThreshold);
    this.composer.addPass(this.bloomPass);

    // OutputPass is always the final pass for tone mapping and screen output
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  // --- 1. ROUND STARS (ANTI-BOX FORMULA) ---
  buildRoundStars() {
    const layers = [
      { count: UNIVERSE_SETTINGS.farStarsCount, sizeMin: 1.0, sizeMax: 1.8, isNear: 0.0, radiusMin: 1800, radiusMax: 3600 },
      { count: UNIVERSE_SETTINGS.midStarsCount, sizeMin: 1.8, sizeMax: 3.2, isNear: 0.0, radiusMin: 1200, radiusMax: 2800 },
      { count: UNIVERSE_SETTINGS.nearStarsCount, sizeMin: 4.5, sizeMax: 8.0, isNear: 1.0, radiusMin: 600, radiusMax: 1800 }
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

        const temp = 3000 + Math.random() * 9000;
        const c = kelvinToRGB(temp);

        const hdrBoost = cfg.isNear > 0.5 ? 1.5 + Math.random() * 0.9 : 1.0;
        colors[i3] = c.r * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 1] = c.g * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 2] = c.b * hdrBoost * UNIVERSE_SETTINGS.starBrightness;

        twinkles[i2] = Math.random() * Math.PI * 2;
        twinkles[i2 + 1] = 0.5 + Math.random() * 2.5;
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
          uReadability: { value: UNIVERSE_SETTINGS.readability },
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

  // --- 2. REUSABLE GALAXY FACTORY (3 TYPES) ---
  makeGalaxy({ type = 'face-on', arms = 4, radius = 700, tilt = new THREE.Euler(), pos = new THREE.Vector3(), colorCore = '#FFD9A0', colorArm = '#6AA6FF', count = 70000, seed = 1 }) {
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

      let r = 0, angle = 0, yOffset = 0, isDust = 0, isHII = 0;

      if (type === 'face-on') {
        r = Math.pow(rnd1, 2.5) * radius;
        const armIndex = i % arms;
        const branchAngle = (armIndex / arms) * Math.PI * 2;
        const spin = r * 0.0032;
        const spread = Math.pow(rnd2, 3.0) * (r * 0.3 + 20);
        angle = branchAngle + spin + (rnd3 - 0.5) * 0.45;
        yOffset = (pseudoRandom(s++) - 0.5) * spread * 0.45;
        if (rnd2 < 0.22 && r > radius * 0.18 && r < radius * 0.8) isDust = 1.0;
        if (rnd3 > 0.88 && r > radius * 0.25) isHII = 1.0;
      } 
      else if (type === 'edge-on') {
        r = Math.pow(rnd1, 2.2) * radius;
        angle = rnd2 * Math.PI * 2;
        yOffset = (rnd3 - 0.5) * 45.0 * (1.0 - r / radius);
        if (Math.abs(yOffset) < 14.0 && r < radius * 0.75 && rnd1 > 0.25) isDust = 1.0;
      } 
      else {
        r = Math.pow(rnd1, 3.0) * radius;
        const theta = rnd2 * Math.PI * 2;
        const phi = Math.acos(rnd3 * 2.0 - 1.0);
        angle = theta;
        yOffset = r * Math.sin(phi) * 0.65;
        r = r * Math.cos(phi);
      }

      positions[i3] = 0;
      positions[i3 + 1] = yOffset;
      positions[i3 + 2] = 0;

      radii[i] = r;
      angles[i] = angle;
      sizes[i] = 7.0 + pseudoRandom(s++) * 9.0;
      dust[i] = isDust;
      hii[i] = isHII;

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

  buildAllGalaxies() {
    // 1. Face-on Grand Spiral Galaxy (Top-Right Depth)
    this.makeGalaxy({
      type: 'face-on',
      arms: 4,
      radius: 950,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(52), THREE.MathUtils.degToRad(-15), 0),
      pos: new THREE.Vector3(750, 340, -1350),
      colorCore: '#FFD9A0',
      colorArm: '#6AA6FF',
      count: 75000,
      seed: 42
    });

    // 2. Edge-on Disc Galaxy with Dust Lane (Far Left Depth)
    this.makeGalaxy({
      type: 'edge-on',
      arms: 2,
      radius: 800,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(82), THREE.MathUtils.degToRad(25), THREE.MathUtils.degToRad(-45)),
      pos: new THREE.Vector3(-950, 380, -1650),
      colorCore: '#FFECC0',
      colorArm: '#0284C7',
      count: 65000,
      seed: 108
    });
  }

  // --- 3. STAR CLUSTERS (PLUMMER GLOBULAR & OPEN) ---
  buildStarClusters() {
    const createGlobularCluster = (count, scaleRadius, centerPos, coreHex, haloHex) => {
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

        const mixRatio = Math.min(1.0, r / (scaleRadius * 4.5));
        const c = c1.clone().lerp(c2, mixRatio);
        col[i3] = c.r * UNIVERSE_SETTINGS.clusterBrightness;
        col[i3 + 1] = c.g * UNIVERSE_SETTINGS.clusterBrightness;
        col[i3 + 2] = c.b * UNIVERSE_SETTINGS.clusterBrightness;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 3.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });

      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);
      this.clusters.push(pts);
    };

    createGlobularCluster(5000, 45, new THREE.Vector3(560, -220, -1100), '#FEF08A', '#38BDF8');
    createGlobularCluster(4500, 38, new THREE.Vector3(-600, -320, -1350), '#FFFBEB', '#93C5FD');
  }

  // --- 4. VOLUMETRIC NEBULA (ADDITIVE BLENDING: NEVER BLOCKS STARS!) ---
  buildVolumetricNebula() {
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
      blending: THREE.AdditiveBlending, // <--- CRITICAL: NEVER COVERS STARS IN BLACK!
      transparent: true
    });

    this.nebulaMesh = new THREE.Mesh(quadGeo, nebulaMat);
    this.nebulaMesh.frustumCulled = false;
    this.scene.add(this.nebulaMesh);
  }

  // --- 5. PLANET & MOON ---
  buildRingedPlanetAndMoon() {
    this.planetGroup = new THREE.Group();
    this.planetGroup.position.set(780, -820, -1850);

    const planetGeo = new THREE.IcosahedronGeometry(110, 5);
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

    const ringGeo = new THREE.PlaneGeometry(540, 540);
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

    this.scene.add(this.planetGroup);
  }

  buildDustMotes() {
    const count = 2200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 1600;
      pos[i + 1] = (Math.random() - 0.5) * 1600;
      pos[i + 2] = (Math.random() - 0.5) * 1200 + 400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dustMesh = new THREE.Points(geo, mat);
    this.scene.add(this.dustMesh);
  }

  buildMeteors() {
    for (let i = 0; i < 3; i++) {
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

    // Smooth Mouse 3D Parallax Orbit
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const maxRot = THREE.MathUtils.degToRad(UNIVERSE_SETTINGS.mouseParallax);
    this.camera.rotation.y = -this.mouseX * maxRot;
    this.camera.rotation.x = -this.mouseY * (maxRot * 0.7);

    // Update Shaders
    if (this.nebulaMesh) {
      const mat = this.nebulaMesh.material;
      mat.uniforms.uTime.value = elapsedTime;
      mat.uniforms.uCameraPos.value.copy(this.camera.position);
      mat.uniforms.uInvProj.value.copy(this.camera.projectionMatrixInverse);
      mat.uniforms.uInvView.value.copy(this.camera.matrixWorld);
    }

    this.starLayers.forEach(layer => {
      layer.material.uniforms.uTime.value = elapsedTime;
    });

    this.galaxies.forEach(g => {
      g.material.uniforms.uTime.value = elapsedTime;
    });

    if (this.planetGroup && UNIVERSE_SETTINGS.planetVisible) {
      this.planetGroup.children[0].material.uniforms.uTime.value = elapsedTime;
      this.planetGroup.rotation.y = elapsedTime * 0.025;
    }

    if (this.dustMesh) {
      this.dustMesh.rotation.y = elapsedTime * 0.003;
    }

    this.updateMeteors();

    // RENDER TO SCREEN VIA EFFECTCOMPOSER
    this.composer.render();
  }

  async initTuningGUI() {
    try {
      const { GUI } = await import('https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm');
      const gui = new GUI({ title: '🌌 Universe Tuner (?tune=1)' });

      const stars = gui.addFolder('HDR Stars');
      stars.add(UNIVERSE_SETTINGS, 'starBrightness', 0.5, 3.0, 0.1);
      stars.add(UNIVERSE_SETTINGS, 'mouseParallax', 0.5, 6.0, 0.1);

      const gal = gui.addFolder('Galaxies & Clusters');
      gal.add(UNIVERSE_SETTINGS, 'galaxyBrightness', 0.5, 3.0, 0.1);
      gal.add(UNIVERSE_SETTINGS, 'clusterBrightness', 0.5, 3.0, 0.1);

      const post = gui.addFolder('Bloom');
      post.add(UNIVERSE_SETTINGS, 'bloomStrength', 0.0, 2.0, 0.05).onChange(v => this.bloomPass.strength = v);
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
}
