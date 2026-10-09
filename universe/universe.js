/* ==========================================================================
   SHIVAM MISHRA — THE COSMIC HORIZON (UNIVERSE GRAPHICS ENGINE)
   Modular Three.js 0.169.0 Engine: UnrealBloom, Volumetric FBM, 160k Galaxy & Tuning GUI
   ========================================================================== */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { NebulaShader, StarShader, GalaxyShader, PostShader } from './shaders.js';

// ==========================================================================
// 1. MASTER TUNABLE SETTINGS (Defaults can be tuned live via ?tune=1)
// ==========================================================================
export const UNIVERSE_SETTINGS = {
  // Quality & Tiers
  tier: 'high', // 'ultra' | 'high' | 'medium' | 'low'
  
  // Volumetric Nebula
  nebulaIntensity: 0.52,
  nebulaDensity: 1.15,
  nebulaSteps: 28,
  readability: 0.85,
  colorTeal: '#2EE6D6',
  colorBlue: '#1B3BFF',
  colorMagenta: '#FF4D7A',
  colorGold: '#FFB44A',

  // Starfield
  starBrightness: 1.25,
  starDensity: 1.0,
  nearStarsCount: 2000,
  midStarsCount: 15000,
  farStarsCount: 40000,

  // 160k Spiral Galaxy
  galaxyParticles: 160000,
  galaxyBrightness: 1.3,
  galaxySpeed: 0.08,

  // Post-Processing
  bloomStrength: 0.85,
  bloomRadius: 0.55,
  bloomThreshold: 0.82,
  vignette: 0.35,
  aberration: 0.0006,
  grain: 0.032,
  exposure: 1.05,

  // Camera Dynamics
  driftSpeed: 0.015,
  mouseParallax: 2.2
};

// ==========================================================================
// 2. ASTRONOMICAL BLACKBODY COLOR CONVERTER (3000K to 12000K)
// ==========================================================================
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
// 3. THE UNIVERSE ENGINE CLASS
// ==========================================================================
export class Universe {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.composer = null;
    this.bloomPass = null;
    this.postPass = null;
    
    // Meshes
    this.nebulaMesh = null;
    this.starLayers = [];
    this.galaxyPoints = null;
    this.dustMesh = null;
    this.meteors = [];

    // Interaction & State
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

    // Check URL parameters for overrides
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tier')) {
      UNIVERSE_SETTINGS.tier = urlParams.get('tier');
    }

    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.camera.position.set(0, 0, 850);

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

    const dprCap = UNIVERSE_SETTINGS.tier === 'ultra' ? 2.0 :
                   UNIVERSE_SETTINGS.tier === 'high' ? 1.75 :
                   UNIVERSE_SETTINGS.tier === 'medium' ? 1.5 : 1.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Post-Processing Pipeline (Unreal Bloom & Dither Output)
    this.initPostProcessing();

    // 4. Construct GPU Scene Layers
    this.buildVolumetricNebula();
    this.buildStars();
    this.buildSpiralGalaxy();
    this.buildDustMotes();
    this.buildMeteors();

    // 5. Events & Interaction
    this.bindEvents();

    // 6. Optional Live Tuning & Debug Overlays
    if (urlParams.get('tune') === '1') this.initTuningGUI();
    if (urlParams.get('debug') === '1') this.initDebugOverlay();

    // Expose instance globally
    window.UNIVERSE = this;

    // Start 60fps render loop
    this.animate();
  }

  // --- POST-PROCESSING PIPELINE ---
  initPostProcessing() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const msaaSamples = UNIVERSE_SETTINGS.tier === 'ultra' || UNIVERSE_SETTINGS.tier === 'high' ? 4 : 
                        UNIVERSE_SETTINGS.tier === 'medium' ? 2 : 0;

    const renderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
      type: THREE.HalfFloatType,
      samples: msaaSamples
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(size, UNIVERSE_SETTINGS.bloomStrength, UNIVERSE_SETTINGS.bloomRadius, UNIVERSE_SETTINGS.bloomThreshold);
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    this.postPass = new ShaderPass(PostShader);
    this.postPass.uniforms.uResolution.value = size;
    this.postPass.uniforms.uVignette.value = UNIVERSE_SETTINGS.vignette;
    this.postPass.uniforms.uAberration.value = UNIVERSE_SETTINGS.aberration;
    this.postPass.uniforms.uGrain.value = UNIVERSE_SETTINGS.grain;
    this.composer.addPass(this.postPass);
  }

  // --- LAYER 2: VOLUMETRIC RAYMARCHED NEBULA ---
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
      transparent: true
    });

    this.nebulaMesh = new THREE.Mesh(quadGeo, nebulaMat);
    this.nebulaMesh.frustumCulled = false;
    this.scene.add(this.nebulaMesh);
  }

  // --- LAYER 3: 3-TIER HDR STARS (FAR, MID, NEAR SPIKES) ---
  buildStars() {
    const layers = [
      { count: UNIVERSE_SETTINGS.farStarsCount, sizeMin: 0.8, sizeMax: 1.4, isNear: 0.0, radiusMin: 1800, radiusMax: 3200 },
      { count: UNIVERSE_SETTINGS.midStarsCount, sizeMin: 1.4, sizeMax: 2.6, isNear: 0.0, radiusMin: 1200, radiusMax: 2600 },
      { count: UNIVERSE_SETTINGS.nearStarsCount, sizeMin: 3.5, sizeMax: 6.5, isNear: 1.0, radiusMin: 700, radiusMax: 1800 }
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

        const temp = 3000 + Math.random() * 9000; // 3000K to 12000K
        const c = kelvinToRGB(temp);

        // Near stars have HDR emission values > 1.0 to trigger bloom
        const hdrBoost = cfg.isNear > 0.5 ? 1.4 + Math.random() * 0.8 : 1.0;
        colors[i3] = c.r * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 1] = c.g * hdrBoost * UNIVERSE_SETTINGS.starBrightness;
        colors[i3 + 2] = c.b * hdrBoost * UNIVERSE_SETTINGS.starBrightness;

        twinkles[i2] = Math.random() * Math.PI * 2; // phase
        twinkles[i2 + 1] = 0.5 + Math.random() * 2.5; // speed
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
          uReadability: { value: UNIVERSE_SETTINGS.readability }
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

  // --- LAYER 4: 160K PARTICLE SPIRAL GALAXY ---
  buildSpiralGalaxy() {
    const count = UNIVERSE_SETTINGS.galaxyParticles;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const radii = new Float32Array(count);
    const angles = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const coreColor = new THREE.Color('#FFD9A0');
    const armColor = new THREE.Color('#6AA6FF');
    const arms = 4;
    const maxRadius = 1600;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 2.8) * maxRadius;
      const armIndex = i % arms;
      const branchAngle = (armIndex / arms) * Math.PI * 2;
      const spin = r * 0.0028;

      const randomSpread = Math.pow(Math.random(), 3.0) * (r * 0.35 + 40);
      const angle = branchAngle + spin + (Math.random() - 0.5) * 0.4;

      pos[i3] = 0;
      pos[i3 + 1] = (Math.random() - 0.5) * randomSpread * 0.6;
      pos[i3 + 2] = 0;

      radii[i] = r;
      angles[i] = angle;

      const mixRatio = Math.min(1.0, r / (maxRadius * 0.65));
      const c = coreColor.clone().lerp(armColor, mixRatio);
      colors[i3] = c.r * UNIVERSE_SETTINGS.galaxyBrightness;
      colors[i3 + 1] = c.g * UNIVERSE_SETTINGS.galaxyBrightness;
      colors[i3 + 2] = c.b * UNIVERSE_SETTINGS.galaxyBrightness;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: GalaxyShader.vertexShader,
      fragmentShader: GalaxyShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() }
      },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    });

    this.galaxyPoints = new THREE.Points(geo, mat);
    // Position far away and tilted 55°
    this.galaxyPoints.position.set(200, -180, -900);
    this.galaxyPoints.rotation.x = THREE.MathUtils.degToRad(55);
    this.galaxyPoints.rotation.y = THREE.MathUtils.degToRad(-15);
    this.scene.add(this.galaxyPoints);
  }

  // --- LAYER 5: DUST MOTES (INFINITE PARALLAX) ---
  buildDustMotes() {
    const count = 3000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 1400;
      pos[i + 1] = (Math.random() - 0.5) * 1400;
      pos[i + 2] = (Math.random() - 0.5) * 1000 + 400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x88ccff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dustMesh = new THREE.Points(geo, mat);
    this.scene.add(this.dustMesh);
  }

  // --- LAYER 6: SHOOTING STARS ---
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
        timer: Math.random() * 400 + 150
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
          m.maxLife = Math.floor(Math.random() * 20 + 35);
          m.pos.set((Math.random() - 0.5) * 1800 + 300, Math.random() * 900 + 300, (Math.random() - 0.5) * 500);
          const spd = Math.random() * 22 + 28;
          m.vel.set(-spd, -spd * 0.75, (Math.random() - 0.5) * 6);
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
          m.timer = Math.random() * 550 + 300; // Next meteor in 9 to 16s
        }
      }
    });
  }

  // --- EVENTS & PARALLAX ---
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

    if (this.nebulaMesh) {
      this.nebulaMesh.material.uniforms.uResolution.value.set(w, h);
    }
    if (this.postPass) {
      this.postPass.uniforms.uResolution.value.set(w, h);
    }
  }

  setReadability(v) {
    UNIVERSE_SETTINGS.readability = v;
    if (this.nebulaMesh) this.nebulaMesh.material.uniforms.uReadability.value = v;
    this.starLayers.forEach(l => l.material.uniforms.uReadability.value = v);
  }

  // --- RENDER & ANIMATION LOOP ---
  animate() {
    if (this.isPaused) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth Mouse Parallax Lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const maxRot = THREE.MathUtils.degToRad(UNIVERSE_SETTINGS.mouseParallax);
    this.camera.rotation.y = -this.mouseX * maxRot;
    this.camera.rotation.x = -this.mouseY * (maxRot * 0.7);

    // Update Nebula Uniforms
    if (this.nebulaMesh) {
      const mat = this.nebulaMesh.material;
      mat.uniforms.uTime.value = elapsedTime;
      mat.uniforms.uCameraPos.value.copy(this.camera.position);
      mat.uniforms.uInvProj.value.copy(this.camera.projectionMatrixInverse);
      mat.uniforms.uInvView.value.copy(this.camera.matrixWorld);
    }

    // Update Stars Uniforms
    this.starLayers.forEach(layer => {
      layer.material.uniforms.uTime.value = elapsedTime;
    });

    // Update Galaxy Uniforms & Idle Rotation
    if (this.galaxyPoints) {
      this.galaxyPoints.material.uniforms.uTime.value = elapsedTime;
    }

    // Update Dust Motes Infinite Wrap
    if (this.dustMesh) {
      this.dustMesh.rotation.y = elapsedTime * 0.004;
    }

    // Update Meteors
    this.updateMeteors();

    // Update Post Pass
    if (this.postPass) {
      this.postPass.uniforms.uTime.value = elapsedTime;
    }

    // Render via EffectComposer (HDR + Bloom + Output)
    this.composer.render();

    // Debug Tracking
    this.updateDebug(elapsedTime);
  }

  // --- OPTIONAL ?tune=1 LIVE TUNING PANEL ---
  async initTuningGUI() {
    try {
      const { GUI } = await import('https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm');
      const gui = new GUI({ title: '🌌 Universe Tuner (?tune=1)' });

      const neb = gui.addFolder('Volumetric Nebula');
      neb.add(UNIVERSE_SETTINGS, 'nebulaIntensity', 0.1, 1.5, 0.05).onChange(v => {
        this.nebulaMesh.material.uniforms.uIntensity.value = v;
      });
      neb.add(UNIVERSE_SETTINGS, 'nebulaDensity', 0.2, 3.0, 0.05).onChange(v => {
        this.nebulaMesh.material.uniforms.uDensity.value = v;
      });
      neb.add(UNIVERSE_SETTINGS, 'readability', 0.0, 1.0, 0.05).onChange(v => this.setReadability(v));
      neb.addColor(UNIVERSE_SETTINGS, 'colorTeal').onChange(v => this.nebulaMesh.material.uniforms.uColorTeal.value.set(v));
      neb.addColor(UNIVERSE_SETTINGS, 'colorMagenta').onChange(v => this.nebulaMesh.material.uniforms.uColorMagenta.value.set(v));

      const stars = gui.addFolder('HDR Stars');
      stars.add(UNIVERSE_SETTINGS, 'starBrightness', 0.5, 3.0, 0.1);
      stars.add(UNIVERSE_SETTINGS, 'mouseParallax', 0.5, 6.0, 0.1);

      const post = gui.addFolder('Bloom & Post-FX');
      post.add(UNIVERSE_SETTINGS, 'bloomStrength', 0.0, 2.5, 0.05).onChange(v => this.bloomPass.strength = v);
      post.add(UNIVERSE_SETTINGS, 'bloomThreshold', 0.2, 1.0, 0.02).onChange(v => this.bloomPass.threshold = v);
      post.add(UNIVERSE_SETTINGS, 'vignette', 0.0, 1.0, 0.05).onChange(v => this.postPass.uniforms.uVignette.value = v);
      post.add(UNIVERSE_SETTINGS, 'grain', 0.0, 0.1, 0.005).onChange(v => this.postPass.uniforms.uGrain.value = v);

      gui.add({
        copySettings: () => {
          navigator.clipboard.writeText(JSON.stringify(UNIVERSE_SETTINGS, null, 2));
          alert('Settings copied to clipboard! Paste this JSON to update defaults.');
        }
      }, 'copySettings').name('📋 Copy Settings JSON');
    } catch (e) {
      console.warn('lil-gui could not be loaded', e);
    }
  }

  // --- OPTIONAL ?debug=1 FPS OVERLAY ---
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
      Galaxy Particles: ${UNIVERSE_SETTINGS.galaxyParticles.toLocaleString()}
    `;
  }
}
