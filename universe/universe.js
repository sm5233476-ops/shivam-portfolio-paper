/* ==========================================================================
   SHIVAM MISHRA — THE ASTRONOMICAL UNIVERSE (PROMPT B COMPLETE ARCHITECTURE)
   Galaxy Factory (3 Types), Plummer Clusters, Ringed Planet, POIS Fly-Through, Warp
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
// 1. MASTER TUNABLE SETTINGS OBJECT (Defaults tuned via ?tune=1)
// ==========================================================================
export const UNIVERSE_SETTINGS = {
  tier: 'low', // 'ultra' | 'high' | 'medium' | 'low'
  
  // Starfield Radiance
  starBrightness: 1.1,
  nearStarsCount: 1300,
  midStarsCount: 7000,
  farStarsCount: 15000,

  // Galaxy Factory
  galaxyBrightness: 0.55,
  galaxySpeed: 0.59,

  // Clusters & Deep Space
  clusterBrightness: 0.45,
  
  // Volumetric Emission Patches
  nebulaIntensity: 0.20,
  nebulaDensity: 0.45,
  nebulaSteps: 18, // Optimized to prevent GPU timeout while preserving filaments
  readability: 0.45,
  colorTeal: '#2EE6D6',
  colorBlue: '#1B3BFF',
  colorMagenta: '#FF4D7A',
  colorGold: '#FFB44A',

  // Planet & Moon
  planetVisible: true,
  
  // Warp Dynamics & Camera
  warpStrength: 0.70,
  mouseParallax: 7.3,
  cameraDamping: 3.0,

  // Post-Processing
  bloomStrength: 0.45,
  bloomRadius: 0.38,
  bloomThreshold: 0.64,
  exposure: 0.80
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

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tier')) UNIVERSE_SETTINGS.tier = urlParams.get('tier');

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

    // Safe DPR to guarantee 60fps without GPU crash
    const dprCap = UNIVERSE_SETTINGS.tier === 'ultra' ? 1.5 :
                   UNIVERSE_SETTINGS.tier === 'high' ? 1.0 :
                   UNIVERSE_SETTINGS.tier === 'medium' ? 1.05 : 0.80;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Post-Processing Pipeline (Safe Samples: 0 to prevent Intel GPU blackouts)
    this.initPostProcessing();

    // 4. Construct All GPU Layers (Prompt B Full Suite)
    this.buildRoundStars();
    this.buildAllGalaxies();
    this.buildStarClusters();
    this.buildTwelveScatteredClusters();
    this.buildVolumetricNebula();
    this.buildRingedPlanetAndMoon();
    this.buildDustMotes();
    this.buildMeteors();

    // 5. Build 3D Fly-Through Spline Camera Path
    this.initCameraFlyThrough();

    // 6. Events & GUI
    this.bindEvents();

    if (urlParams.get('tune') === '1') this.initTuningGUI();
    if (urlParams.get('debug') === '1') this.initDebugOverlay();

    window.UNIVERSE = this;
    this.animate();
  }

  // --- POST-PROCESSING ---
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

  // =========================================================================
  // 1. MANDATORY ROUND STARS FIX (ANTI-SQUARE BOX FORMULA)
  // =========================================================================
  buildRoundStars() {
    const layers = [
      { count: UNIVERSE_SETTINGS.farStarsCount, sizeMin: 1.1, sizeMax: 1.8, isNear: 0.0, radiusMin: 1900, radiusMax: 3600 },
      { count: UNIVERSE_SETTINGS.midStarsCount, sizeMin: 1.8, sizeMax: 3.2, isNear: 0.0, radiusMin: 1200, radiusMax: 2800 },
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

        const temp = 3000 + Math.random() * 9000;
        const c = kelvinToRGB(temp);

        const hdrBoost = cfg.isNear > 0.5 ? 1.45 + Math.random() * 0.9 : 1.0;
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

  // =========================================================================
  // 2. REUSABLE GALAXY FACTORY (3 TYPES: FACE-ON, EDGE-ON, ELLIPTICAL)
  // =========================================================================
  makeGalaxy({ type = 'face-on', arms = 4, radius = 550, tilt = new THREE.Euler(), pos = new THREE.Vector3(), colorCore = '#FFD9A0', colorArm = '#6AA6FF', count = 75000, seed = 1 }) {
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

        // Dark dust lanes & Pink HII star-forming regions
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
        // Smooth Elliptical Galaxy
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
      sizes[i] = 6.5 + pseudoRandom(s++) * 9.5;
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
      radius: 750,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(52), THREE.MathUtils.degToRad(-15), 0),
      pos: new THREE.Vector3(1200, 360, -1350),
      colorCore: '#FFD9A0',
      colorArm: '#6AA6FF',
      count: 60000,
      seed: 42
    });

    // 2. Edge-on Disc Galaxy with Dust Lane (Far Left Depth)
    this.makeGalaxy({
      type: 'edge-on',
      arms: 2,
      radius: 600,
      tilt: new THREE.Euler(THREE.MathUtils.degToRad(82), THREE.MathUtils.degToRad(25), THREE.MathUtils.degToRad(-45)),
      pos: new THREE.Vector3(-990, 820, -1950),
      colorCore: '#FFECC0',
      colorArm: '#0284C7',
      count: 50000,
      seed: 108
    });

    // 3. Smooth Golden Elliptical Galaxy (Distant Bottom-Right)
    this.makeGalaxy({
      type: 'elliptical',
      radius: 450,
      tilt: new THREE.Euler(0.4, 0.6, 0.2),
      pos: new THREE.Vector3(980, -680, -2800),
      colorCore: '#FFFBEB',
      colorArm: '#F59E0B',
      count: 40000,
      seed: 777
    });
  }

  // =========================================================================
  // 3. STAR CLUSTERS (PLUMMER GLOBULAR & OPEN)
  // =========================================================================
  buildStarClusters() {
    const createGlobularCluster = (count, scaleRadius, centerPos, coreHex, haloHex) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const c1 = new THREE.Color(coreHex);
      const c2 = new THREE.Color(haloHex);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Plummer Sphere Radial Profile: r = a / sqrt(U^(-2/3) - 1)
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

    // 3 Globular Clusters (Plummer Sphere)
    createGlobularCluster(5000, 45, new THREE.Vector3(1200, -920, -1900), '#FEF08A', '#38BDF8');
    createGlobularCluster(4500, 38, new THREE.Vector3(-900, -820, -1850), '#FFFBEB', '#93C5FD');
    createGlobularCluster(6000, 52, new THREE.Vector3(590, 280, -1900), '#FDE047', '#E0F2FE');

    // 2 Open Clusters (Loose Young Blue Stars)
    const createOpenCluster = (count, radius, centerPos) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const blueColor = new THREE.Color('#38BDF8');

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.5) * radius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2.0 - 1.0);

        pos[i3] = centerPos.x + r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = centerPos.y + r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = centerPos.z + r * Math.cos(phi);

        col[i3] = blueColor.r * 1.35;
        col[i3 + 1] = blueColor.g * 1.35;
        col[i3 + 2] = blueColor.b * 1.35;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 4.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);
      this.clusters.push(pts);
    };

    createOpenCluster(350, 140, new THREE.Vector3(-450, 240, -850));
    createOpenCluster(400, 160, new THREE.Vector3(620, 180, -950));
  }

  // --- 12 SCATTERED TINY STAR CLUSTERS (Around Text Boundaries) ---
  buildTwelveScatteredClusters() {
    const coords = [
      [-1220, 600, -1850], [-1220, -180, -1600], [-750, 200, -1900], [-480, -820, -1000],
      [720, 260, -920], [680, -580, -940], [540, 450, -1150], [490, -450, -2450],
      [-320, 520, -1200], [640, 599, -1600], [-580, -200, -1100], [950, -470, -1100]
    ];

    coords.forEach(([cx, cy, cz], idx) => {
      const count = 450;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const baseCol = idx % 2 === 0 ? new THREE.Color('#38BDF8') : new THREE.Color('#FEF08A');

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.6) * 75;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2.0 - 1.0);

        pos[i3] = cx + r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = cy + r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = cz + r * Math.cos(phi);

        col[i3] = baseCol.r * 1.3;
        col[i3 + 1] = baseCol.g * 1.3;
        col[i3 + 2] = baseCol.b * 1.3;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);
      this.clusters.push(pts);
    });
  }

  // --- 4. VOLUMETRIC EMISSION NEBULA PATCHES ---
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
      blending: THREE.AdditiveBlending, // Guarantees it never occludes stars in black!
      transparent: true
    });

    this.nebulaMesh = new THREE.Mesh(quadGeo, nebulaMat);
    this.nebulaMesh.frustumCulled = false;
    this.scene.add(this.nebulaMesh);
  }

  // --- 5. PROCEDURAL RINGED GAS GIANT & ORBITING MOON ---
  buildRingedPlanetAndMoon() {
    this.planetGroup = new THREE.Group();
    this.planetGroup.position.set(980, -820, -1950); // Encountered near skills section on fly-through

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

    // Orbiting Moon
    const moonGeo = new THREE.IcosahedronGeometry(18, 3);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(740, -1045, 80);
    this.planetGroup.add(this.moonMesh);

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
      opacity: 0.25,
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

  // =========================================================================
  // 6. CAMERA FLY-THROUGH (CATMULL-ROM SPLINE + POIS)
  // =========================================================================
  initCameraFlyThrough() {
    const points = [
      new THREE.Vector3(0, 0, 850),          // 0.0: Hero (calm deep-space view)
      new THREE.Vector3(-140, -180, 580),    // 0.25: About (drifts near cluster)
      new THREE.Vector3(180, -420, 260),     // 0.5: Works (galaxy arm)
      new THREE.Vector3(380, -680, -180),    // 0.75: Skills (ringed gas giant)
      new THREE.Vector3(0, -980, -550),      // 1.0: Contact
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

    if (this.nebulaMesh) this.nebulaMesh.material.uniforms.uResolution.value.set(w, h);
    this.starLayers.forEach(l => l.material.uniforms.uResolution.value.set(w, h));
  }

  setReadability(v) {
    UNIVERSE_SETTINGS.readability = v;
    if (this.nebulaMesh) this.nebulaMesh.material.uniforms.uReadability.value = v;
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

    // 1. Smooth Camera Catmull-Rom Fly-Through
    const dampFactor = 1.0 - Math.exp(-dt * UNIVERSE_SETTINGS.cameraDamping);
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * dampFactor;
    this.dampedVelocity += (this.scrollVelocity - this.dampedVelocity) * dampFactor;

    if (this.cameraPath) {
      const pathPos = this.cameraPath.getPointAt(this.scrollProgress);
      this.camera.position.set(pathPos.x, pathPos.y, pathPos.z);
      this.camera.lookAt(0, 0, 0); // Locks solid forward focus on origin
    }

    // 2. Mouse Parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const maxRot = THREE.MathUtils.degToRad(UNIVERSE_SETTINGS.mouseParallax);
    this.camera.rotation.y = -this.mouseX * maxRot;
    this.camera.rotation.x = -this.mouseY * (maxRot * 0.7);

    // 3. Update Shaders
    if (this.nebulaMesh) {
      const mat = this.nebulaMesh.material;
      mat.uniforms.uTime.value = elapsedTime;
      mat.uniforms.uCameraPos.value.copy(this.camera.position);
      mat.uniforms.uInvProj.value.copy(this.camera.projectionMatrixInverse);
      mat.uniforms.uInvView.value.copy(this.camera.matrixWorld);
    }

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
        this.moonMesh.position.x = Math.cos(elapsedTime * 0.4) * 240;
        this.moonMesh.position.z = Math.sin(elapsedTime * 0.4) * 240;
      }
    }

    if (this.dustMesh) {
      this.dustMesh.rotation.y = elapsedTime * 0.003;
    }

    this.updateMeteors();

    // RENDER TO SCREEN VIA EFFECTCOMPOSER
    this.composer.render();
    this.updateDebug(elapsedTime);
  }

  async initTuningGUI() {
    try {
      const { GUI } = await import('https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm');
      const gui = new GUI({ title: '🌌 Universe Tuner (?tune=1)' });

      const stars = gui.addFolder('HDR Stars');
      stars.add(UNIVERSE_SETTINGS, 'starBrightness', 0.5, 3.0, 0.1);
      stars.add(UNIVERSE_SETTINGS, 'warpStrength', 0.0, 2.0, 0.1);
      stars.add(UNIVERSE_SETTINGS, 'mouseParallax', 0.5, 7.0, 0.1);

      const gal = gui.addFolder('Galaxies & Clusters');
      gal.add(UNIVERSE_SETTINGS, 'galaxyBrightness', 0.5, 2.6, 0.1);
      gal.add(UNIVERSE_SETTINGS, 'clusterBrightness', 0.5, 1.9, 0.1);

      const neb = gui.addFolder('Volumetric Nebula');
      neb.add(UNIVERSE_SETTINGS, 'nebulaIntensity', 0.0, 1.2, 0.05).onChange(v => {
        if (this.nebulaMesh) this.nebulaMesh.material.uniforms.uIntensity.value = v;
      });
      neb.add(UNIVERSE_SETTINGS, 'readability', 0.0, 1.0, 0.03).onChange(v => this.setReadability(v));

      const post = gui.addFolder('Bloom');
      post.add(UNIVERSE_SETTINGS, 'bloomStrength', 0.0, 2.0, 0.05).onChange(v => this.bloomPass.strength = v);
      post.add(UNIVERSE_SETTINGS, 'bloomThreshold', 0.5, 0.8, 0.02).onChange(v => this.bloomPass.threshold = v);

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
      <strong>🌌 UNIVERSE DEBUG (?debug=1)</strong><br>
      FPS: ${this.currentFps} | Tier: ${UNIVERSE_SETTINGS.tier}<br>
      DPR: ${this.renderer.getPixelRatio().toFixed(2)} | Calls: ${this.renderer.info.render.calls}<br>
      Stars: ${(UNIVERSE_SETTINGS.farStarsCount + UNIVERSE_SETTINGS.midStarsCount + UNIVERSE_SETTINGS.nearStarsCount).toLocaleString()}<br>
      Galaxies: ${this.galaxies.length} | Clusters: ${this.clusters.length}
    `;
  }
}
/* ==== BLOCK 2: UNIVERSE/UNIVERSE.JS END ==== */
