/* ==========================================================================
   SHIVAM MISHRA — THE ASTRONOMICAL UNIVERSE (10/10 FACE-ON WHEEL SPIN & FLIGHT)
   Disc-Normal Wheel Spin (No Coin Flip), Straight Flight Path & 60FPS
   ========================================================================== */

import * as THREE from 'three';

import { 
  StarShader, 
  GalaxyShader, 
  PlanetShader, 
  RingShader, 
  CometShader 
} from './shaders.js';

// ==========================================================================
// 1. MASTER SETTINGS
// ==========================================================================
export const UNIVERSE_SETTINGS = {
  starBrightness: 1.25,
  nearStarsCount: 450,
  midStarsCount: 3800,
  farStarsCount: 9500,

  // GALAXY SETTINGS (Yahan se tum speed kam/zyada kar sakte ho!)
  galaxyBrightness: 1.25,
  galaxySpeed: 0.04, // <--- Face-On Wheel Spin Speed!

  clusterBrightness: 0.85,
  planetVisible: true,
  mouseParallax: 9.5
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

    // Collections
    this.starTexture = null;
    this.starLayers = [];
    this.galaxies = [];
    this.clusters = [];
    this.saturnGroup = null;
    this.earthGroup = null;
    this.cometMesh = null;
    this.meteors = [];

    // Scroll Path
    this.cameraPath = null;
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.clock = new THREE.Clock();
    this.isPaused = false;
  }

  init(canvas) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5500);
    this.camera.position.set(0, 0, 850);
    this.camera.lookAt(0, 0, 0);

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

    this.starTexture = this.createRoundStarSprite();

    this.buildRoundStars();
    this.buildFaceOnSpinningGalaxies(); // Wheel-spinning facing galaxies
    this.buildCornerClusters();
    this.buildSaturnAndRings();
    this.buildDeepSpaceEarth();
    this.buildDeepSpaceComet();
    this.buildFastMeteors();

    this.initStraightCameraPath();
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
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.18, 'rgba(240, 248, 255, 0.95)');
    grad.addColorStop(0.42, 'rgba(186, 230, 253, 0.6)');
    grad.addColorStop(0.72, 'rgba(56, 189, 248, 0.15)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

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
  // GALAXY SPINNER (WHEEL-SPINNING ON LOCAL DISC NORMAL — NO FLIPPING!)
  // =========================================================================
  makeGalaxy({ arms = 4, radius = 500, tilt = new THREE.Euler(), pos = new THREE.Vector3(), colorCore = '#FFD9A0', colorArm = '#6AA6FF', count = 14000, seed = 1, speed = 0.15 }) {
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
      const spread = Math.pow(rnd2, 2.8) * (r * 0.28 + 20);
      const angle = branchAngle + spin + (rnd3 - 0.5) * 0.48;
      const yOffset = (pseudoRandom(s++) - 0.5) * spread * 0.45;

      positions[i3] = 0;
      positions[i3 + 1] = yOffset;
      positions[i3 + 2] = 0;

      radii[i] = r;
      angles[i] = angle;
      sizes[i] = 7.0 + pseudoRandom(s++) * 7.5;
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

    // Save initial tilt reference for smooth 3D precession
    this.galaxies.push({ mesh, speed, baseTilt: tilt.clone() });
    return mesh;
  }

  buildFaceOnSpinningGalaxies() {
    // 1. Cyan Spiral: Facing predominantly towards screen, spins like a wheel!
    this.makeGalaxy({
      arms: 3,
      radius: 680,
      tilt: new THREE.Euler(0.38, 0.25, 0.1), // Face-on camera angle
      pos: new THREE.Vector3(-1480, 650, -1800),
      colorCore: '#E0F2FE',
      colorArm: '#0284C7',
      count: 13000,
      seed: 108,
      speed: -0.15
    });

    // 2. Golden Amber Spiral: Facing predominantly towards screen, spins like a wheel!
    this.makeGalaxy({
      arms: 4,
      radius: 720,
      tilt: new THREE.Euler(0.35, -0.28, -0.15), // Face-on camera angle
      pos: new THREE.Vector3(1450, 620, -1750),
      colorCore: '#FFD9A0',
      colorArm: '#6AA6FF',
      count: 15000,
      seed: 42,
      speed: 0.11
    });
  }

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

    createSoftCluster(1800, 36, new THREE.Vector3(-1100, -520, -1500), '#FEF08A', '#38BDF8');
    createSoftCluster(1600, 32, new THREE.Vector3(1150, -550, -1650), '#FFFBEB', '#93C5FD');
  }

  buildSaturnAndRings() {
    this.saturnGroup = new THREE.Group();
    this.saturnGroup.position.set(1500, -590, -1450);

    const planetGeo = new THREE.IcosahedronGeometry(88, 4);
    const planetMat = new THREE.ShaderMaterial({
      vertexShader: PlanetShader.vertexShader,
      fragmentShader: PlanetShader.fragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(2000, 1500, 1000) },
        uTime: { value: 0 },
        uIsEarth: { value: 0.0 }
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

  buildDeepSpaceEarth() {
    this.earthGroup = new THREE.Group();
    this.earthGroup.position.set(-780, -680, -1050);

    const earthGeo = new THREE.IcosahedronGeometry(74, 4);
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: PlanetShader.vertexShader,
      fragmentShader: PlanetShader.fragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(2000, 1500, 1000) },
        uTime: { value: 0 },
        uIsEarth: { value: 1.0 }
      }
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(earthMesh);

    const moonGeo = new THREE.IcosahedronGeometry(14, 2);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(160, 30, 50);
    this.earthGroup.add(this.moonMesh);

    this.scene.add(this.earthGroup);
  }

  buildDeepSpaceComet() {
    const cometCount = 500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cometCount * 3);
    const alphas = new Float32Array(cometCount);

    const headPos = new THREE.Vector3(-620, -180, -1100);
    const tailDir = new THREE.Vector3(-1.4, 0.8, -0.6).normalize();

    for (let i = 0; i < cometCount; i++) {
      const i3 = i * 3;
      const t = i / cometCount;
      const dist = t * 300.0;
      const spread = t * 22.0;

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

  buildFastMeteors() {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        linewidth: 2.2
      });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);

      this.meteors.push({
        line, geo, mat,
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        length: 260,
        life: 0,
        maxLife: 40,
        timer: Math.random() * 180 + 70
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
          m.maxLife = Math.floor(Math.random() * 18 + 32);
          m.pos.set((Math.random() - 0.5) * 1800 + 300, Math.random() * 900 + 300, (Math.random() - 0.5) * 500);
          const spd = Math.random() * 30 + 36;
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
          m.timer = Math.random() * 220 + 100;
        }
      }
    });
  }

  initStraightCameraPath() {
    const points = [
      new THREE.Vector3(0, 0, 850),
      new THREE.Vector3(0, -110, 520),
      new THREE.Vector3(0, -250, 180),
      new THREE.Vector3(0, -420, -150)
    ];

    this.cameraPath = new THREE.CatmullRomCurve3(points);
    this.camera.position.copy(points[0]);
    this.camera.lookAt(0, 0, 0);
  }

  setScrollProgress(progress, velocity = 0) {
    this.targetScrollProgress = THREE.MathUtils.clamp(progress, 0.0, 1.0);
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
  // ANIMATION LOOP (WHEEL-SPINNING CHAKRA + 3D WOBBLE)
  // =========================================================================
  animate() {
    if (this.isPaused) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Straight Forward Camera Flight on Scroll
    const damp = 1.0 - Math.exp(-dt * 3.0);
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * damp;

    if (this.cameraPath) {
      const p = this.cameraPath.getPointAt(this.scrollProgress);
      this.camera.position.set(p.x, p.y, p.z);
      this.camera.lookAt(0, p.y * 0.25, p.z - 600);
    }

    // 2. Mouse Parallax Orbit
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const maxRot = THREE.MathUtils.degToRad(UNIVERSE_SETTINGS.mouseParallax);
    this.camera.rotation.y = -this.mouseX * maxRot;
    this.camera.rotation.x = -this.mouseY * (maxRot * 0.7);

    // 3. Shaders Update
    this.starLayers.forEach(layer => {
      layer.material.uniforms.uTime.value = elapsedTime;
    });

    // 4. TRUE WHEEL / CHAKRA SPIN FACING THE SCREEN (NO COIN-FLIPPING!)
    this.galaxies.forEach(g => {
      // Primary Wheel Spin: Rotates around disc normal in front of the screen
      g.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), g.speed * 0.4);

      // Subtle slow 3D precession (Does not flip like a coin!)
      g.mesh.rotation.x = g.baseTilt.x + Math.sin(elapsedTime * 0.12) * 0.06;
      g.mesh.rotation.z = g.baseTilt.z + Math.cos(elapsedTime * 0.12) * 0.06;
    });

    // 5. Planetary Rotations & Moon Orbit
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

    this.updateMeteors();

    // DIRECT HARDWARE RENDER (LOCKED 60FPS)
    this.renderer.render(this.scene, this.camera);
  }
}
