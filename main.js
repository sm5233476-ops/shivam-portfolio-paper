/* ==========================================================================
   SHIVAM MISHRA — PURE CRYSTAL DEEP SPACE (NO BLUR, SHARP STARS ONLY)
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

// 2. Crystal-Clear Deep Space Universe (Zero Blur Clouds)
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

  // Razor-Sharp Crystalline Star Texture (Zero Smudge)
  function createSharpStarTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');          // Brilliant Hot-White Core
    grad.addColorStop(0.15, 'rgba(240, 248, 255, 0.95)');
    grad.addColorStop(0.32, 'rgba(186, 230, 253, 0.6)');       // Ice Blue Ring
    grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');       // Delicate Crisp Halo
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const starTexture = createSharpStarTexture();

  // 1. Panoramic Starfield (Clean, Wide, Perfectly Balanced)
  const starsCount = 2200;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starsCount * 3);
  const starColors = new Float32Array(starsCount * 3);

  const colWhite = new THREE.Color('#ffffff');
  const colIce = new THREE.Color('#bae6fd');
  const colAmber = new THREE.Color('#fef08a');

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;

    // Wide organic panoramic spread across the full horizon
    starPos[i3] = (Math.random() - 0.5) * 3600;
    starPos[i3 + 1] = (Math.random() - 0.5) * 2200;
    starPos[i3 + 2] = (Math.random() - 0.5) * 2400;

    const r = Math.random();
    let c = colWhite;
    if (r > 0.65) c = colIce;
    else if (r > 0.92) c = colAmber;

    starColors[i3] = c.r;
    starColors[i3 + 1] = c.g;
    starColors[i3 + 2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 11,
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

  // 2. Twinkling Foreground Anchor Stars (Sharp Sparkling Diamonds)
  const beaconCount = 90;
  const beaconGeo = new THREE.BufferGeometry();
  const beaconPos = new Float32Array(beaconCount * 3);

  for (let i = 0; i < beaconCount; i++) {
    const i3 = i * 3;
    beaconPos[i3] = (Math.random() - 0.5) * 2400;
    beaconPos[i3 + 1] = (Math.random() - 0.5) * 1400;
    beaconPos[i3 + 2] = (Math.random() - 0.5) * 1200 + 100;
  }
  beaconGeo.setAttribute('position', new THREE.BufferAttribute(beaconPos, 3));

  const beaconMat = new THREE.PointsMaterial({
    size: 22,
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

  // 3. Smooth 3D Mouse Parallax (Exact physics preserved)
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

    // Subtle breathing twinkle
    beaconMat.opacity = 0.75 + Math.sin(elapsedTime * 2.2) * 0.22;

    // Organic drift
    starMesh.rotation.y = elapsedTime * 0.005;
    beaconMesh.rotation.y = elapsedTime * 0.008;

    // Camera 3D response
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
