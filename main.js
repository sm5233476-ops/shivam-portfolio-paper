/* ==========================================================================
   SHIVAM MISHRA — AWWWARDS-GRADE 3-LAYER COSMIC HORIZON (THREE.JS)
   ========================================================================== */

window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// 1. 3D Magnetic Tilt Micro-Interaction on Button
(function initButtonTilt() {
  const btn = document.querySelector('.btn-connect');
  if (!btn) return;

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const tiltX = -(y / (rect.height / 2)) * 14;
    const tiltY = (x / (rect.width / 2)) * 14;
    
    btn.style.transform = `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)`;
    btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => { btn.style.transition = ''; }, 400);
  });
})();

// 2. Multi-Layered Deep Cosmic Universe Engine
(function initTrueUniverse() {
  if (typeof THREE === 'undefined') {
    setTimeout(initTrueUniverse, 40);
    return;
  }

  let canvas = document.getElementById('universe-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'universe-canvas';
    document.body.prepend(canvas);
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.z = 850;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // --- TEXTURE 1: Needle-Sharp Star Sprite ---
  function createSharpStarTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');          // Diamond Core
    grad.addColorStop(0.12, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.28, 'rgba(186, 230, 253, 0.6)');       // Crystalline Ice Blue
    grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.15)');       // Soft Outer Aura
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // --- TEXTURE 2: Volumetric Soft Cosmic Gas Cloud ---
  function createNebulaCloudTexture() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(14, 116, 144, 0.35)');        // Deep Nebula Core
    grad.addColorStop(0.35, 'rgba(3, 105, 161, 0.18)');
    grad.addColorStop(0.7, 'rgba(2, 44, 94, 0.06)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const starTexture = createSharpStarTexture();
  const cloudTexture = createNebulaCloudTexture();

  // =========================================================================
  // LAYER 1: Distant Volumetric Cosmic Gas (Nebula Horizon)
  // =========================================================================
  const cloudCount = 60;
  const cloudGeo = new THREE.BufferGeometry();
  const cloudPos = new Float32Array(cloudCount * 3);

  for (let i = 0; i < cloudCount; i++) {
    const i3 = i * 3;
    // Wide panoramic spread across the horizon
    cloudPos[i3] = (Math.random() - 0.5) * 3200;
    cloudPos[i3 + 1] = (Math.random() - 0.5) * 1600;
    cloudPos[i3 + 2] = -400 - Math.random() * 1200; // Deep in the background
  }
  cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));

  const cloudMat = new THREE.PointsMaterial({
    size: 550, // Massive soft glowing clouds
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
    map: cloudTexture,
    opacity: 0.85
  });
  const nebulaMesh = new THREE.Points(cloudGeo, cloudMat);
  scene.add(nebulaMesh);

  // =========================================================================
  // LAYER 2: Balanced, Expansive Needle-Sharp Starfield (No central ball!)
  // =========================================================================
  const starsCount = 2000; // Perfectly balanced: neither crowded nor empty
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starsCount * 3);
  const starColors = new Float32Array(starsCount * 3);

  const colWhite = new THREE.Color('#ffffff');
  const colIce = new THREE.Color('#bae6fd');
  const colAmber = new THREE.Color('#fef08a');

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;

    // True Panoramic Galactic Horizon (Wide Rectangular Spread, Not a Sphere Ball)
    starPos[i3] = (Math.random() - 0.5) * 3600;
    starPos[i3 + 1] = (Math.random() - 0.5) * 2200;
    starPos[i3 + 2] = (Math.random() - 0.5) * 2400;

    const r = Math.random();
    let c = colWhite;
    if (r > 0.65) c = colIce;
    else if (r > 0.92) c = colAmber; // Rare warm stars

    starColors[i3] = c.r;
    starColors[i3 + 1] = c.g;
    starColors[i3 + 2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 11, // Crisp and delicate
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture,
    opacity: 0.95
  });
  const starMesh = new THREE.Points(starGeo, starMat);
  scene.add(starMesh);

  // =========================================================================
  // LAYER 3: Twinkling Beacon Stars (Prominent Foreground Sparkles)
  // =========================================================================
  const beaconCount = 80;
  const beaconGeo = new THREE.BufferGeometry();
  const beaconPos = new Float32Array(beaconCount * 3);

  for (let i = 0; i < beaconCount; i++) {
    const i3 = i * 3;
    beaconPos[i3] = (Math.random() - 0.5) * 2400;
    beaconPos[i3 + 1] = (Math.random() - 0.5) * 1400;
    beaconPos[i3 + 2] = (Math.random() - 0.5) * 1000 + 100; // Closer to camera
  }
  beaconGeo.setAttribute('position', new THREE.BufferAttribute(beaconPos, 3));

  const beaconMat = new THREE.PointsMaterial({
    size: 22, // Large sparkling gems
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
    map: starTexture,
    color: 0xffffff,
    opacity: 0.9
  });
  const beaconMesh = new THREE.Points(beaconGeo, beaconMat);
  scene.add(beaconMesh);

  // =========================================================================
  // 3D Mouse Parallax & Living Atmosphere Loop
  // =========================================================================
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  }, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle breathing twinkle on foreground beacon stars
    beaconMat.opacity = 0.75 + Math.sin(elapsedTime * 2.2) * 0.22;

    // Slow, majestic background drift
    nebulaMesh.rotation.y = elapsedTime * 0.003;
    starMesh.rotation.y = elapsedTime * 0.005;
    beaconMesh.rotation.y = elapsedTime * 0.008;

    // Smooth camera orbit
    targetX = mouseX * 220;
    targetY = -mouseY * 160;

    camera.position.x += (targetX - camera.position.x) * 0.045;
    camera.position.y += (targetY - camera.position.y) * 0.045;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
