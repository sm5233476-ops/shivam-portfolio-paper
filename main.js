/* ==========================================================================
   SHIVAM MISHRA — COSMIC HORIZON BULLETPROOF THREE.JS & 3D TILT
   ========================================================================== */

window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// 1. Interactive 3D Magnetic Tilt for Let's Connect Button
(function initButtonTilt() {
  const btn = document.querySelector('.btn-connect');
  if (!btn) return;

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // 3D Perspective Tilt calculation
    const tiltX = -(y / (rect.height / 2)) * 14; // Degrees
    const tiltY = (x / (rect.width / 2)) * 14;
    
    btn.style.transform = `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)`;
    btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => { btn.style.transition = ''; }, 400);
  });
})();

// 2. Three.js Cosmic Galaxy Engine with Auto-Heal
(function checkAndStartUniverse() {
  // If Three.js library is still loading, wait 40ms and retry
  if (typeof THREE === 'undefined') {
    setTimeout(checkAndStartUniverse, 40);
    return;
  }

  // Auto-heal canvas: Ensure canvas exists in DOM
  let canvas = document.getElementById('universe-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'universe-canvas';
    document.body.prepend(canvas);
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.z = 750;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Generate 4K Glowing Star Texture
  function createStarTexture() {
    const size = 128;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const ctx = offCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(240, 248, 255, 0.95)');
    gradient.addColorStop(0.45, 'rgba(56, 189, 248, 0.65)'); // Cyan Glow
    gradient.addColorStop(0.75, 'rgba(14, 165, 233, 0.2)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(offCanvas);
    texture.needsUpdate = true;
    return texture;
  }

  const starTexture = createStarTexture();

  // Spiral Galaxy: 3,500 Multi-Arm Points
  const galaxyParams = {
    count: 3500,
    size: 16,
    radius: 950,
    branches: 3,
    spin: 1.1,
    randomness: 0.35,
    power: 3.0
  };

  const galaxyGeometry = new THREE.BufferGeometry();
  const galaxyPositions = new Float32Array(galaxyParams.count * 3);
  const galaxyColors = new Float32Array(galaxyParams.count * 3);

  const coreColor = new THREE.Color('#ffffff');
  const midColor = new THREE.Color('#38bdf8');
  const outerColor = new THREE.Color('#0369a1');

  for (let i = 0; i < galaxyParams.count; i++) {
    const i3 = i * 3;
    const r = Math.pow(Math.random(), galaxyParams.power) * galaxyParams.radius;
    const branchAngle = ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;
    const spinAngle = r * galaxyParams.spin * 0.003;

    const randomX = (Math.random() - 0.5) * galaxyParams.randomness * (r + 70);
    const randomY = (Math.random() - 0.5) * galaxyParams.randomness * (r + 35);
    const randomZ = (Math.random() - 0.5) * galaxyParams.randomness * (r + 70);

    galaxyPositions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
    galaxyPositions[i3 + 1] = randomY;
    galaxyPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

    const mixedColor = coreColor.clone();
    if (r < galaxyParams.radius * 0.35) {
      mixedColor.lerp(midColor, r / (galaxyParams.radius * 0.35));
    } else {
      mixedColor.lerp(outerColor, (r - galaxyParams.radius * 0.35) / (galaxyParams.radius * 0.65));
    }

    galaxyColors[i3] = mixedColor.r;
    galaxyColors[i3 + 1] = mixedColor.g;
    galaxyColors[i3 + 2] = mixedColor.b;
  }

  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

  const galaxyMaterial = new THREE.PointsMaterial({
    size: galaxyParams.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture
  });

  const galaxyMesh = new THREE.Points(galaxyGeometry, galaxyMaterial);
  galaxyMesh.rotation.x = 0.5;
  scene.add(galaxyMesh);

  // Deep Starfield: 1,200 Distant Stars
  const starsCount = 1200;
  const starsGeometry = new THREE.BufferGeometry();
  const starsPositions = new Float32Array(starsCount * 3);
  const starsColors = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
    starsPositions[i3] = (Math.random() - 0.5) * 2800;
    starsPositions[i3 + 1] = (Math.random() - 0.5) * 2800;
    starsPositions[i3 + 2] = (Math.random() - 0.5) * 2400;

    const isBlue = Math.random() > 0.4;
    starsColors[i3] = isBlue ? 0.65 : 1.0;
    starsColors[i3 + 1] = isBlue ? 0.88 : 1.0;
    starsColors[i3 + 2] = 1.0;
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));

  const starsMaterial = new THREE.PointsMaterial({
    size: 11,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture
  });

  const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starsMesh);

  // Responsive 3D Mouse Parallax
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

    galaxyMesh.rotation.y = elapsedTime * 0.035;
    starsMesh.rotation.y = elapsedTime * 0.006;

    // Smooth camera drift
    targetX = mouseX * 240;
    targetY = -mouseY * 180;

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
