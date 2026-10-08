/* ==========================================================================
   SHIVAM MISHRA — ULTRA-HD 4K THREE.JS GALAXY ENGINE (60FPS WebGL)
   ========================================================================== */

window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

(function initCosmicEngine() {
  const canvas = document.getElementById('universe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.z = 700;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 4K Crisp on Retina
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 2. Procedural 4K Star Texture Generator (Hot Core + Electric Cyan Glow)
  function createGlowingStarTexture() {
    const size = 128;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const ctx = offCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1)');          // Pure hot-white center
    gradient.addColorStop(0.15, 'rgba(235, 248, 255, 0.95)');       // Soft white core
    gradient.addColorStop(0.4, 'rgba(56, 189, 248, 0.65)');        // Electric Sky Blue glow
    gradient.addColorStop(0.7, 'rgba(14, 165, 233, 0.2)');         // Deep ocean cyan rim
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');                // Transparent edge

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(offCanvas);
  }

  const starTexture = createGlowingStarTexture();

  // 3. Spiral Galaxy 1: Logarithmic Multi-Arm Spiral (behfar.dev style)
  const galaxyParams = {
    count: 3500,
    size: 14,
    radius: 950,
    branches: 3,
    spin: 1.1,
    randomness: 0.35,
    power: 3.2
  };

  const galaxyGeometry = new THREE.BufferGeometry();
  const galaxyPositions = new Float32Array(galaxyParams.count * 3);
  const galaxyColors = new Float32Array(galaxyParams.count * 3);

  const coreColor = new THREE.Color('#ffffff');       // Brilliant white core
  const midColor = new THREE.Color('#38bdf8');        // Electric Sky Blue
  const outerColor = new THREE.Color('#0284c7');      // Deep Nebula Cyan

  for (let i = 0; i < galaxyParams.count; i++) {
    const i3 = i * 3;

    // Radius distribution (exponential density towards center)
    const r = Math.pow(Math.random(), galaxyParams.power) * galaxyParams.radius;
    const branchAngle = ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;
    const spinAngle = r * galaxyParams.spin * 0.003;

    const randomX = (Math.random() - 0.5) * galaxyParams.randomness * (r + 80);
    const randomY = (Math.random() - 0.5) * galaxyParams.randomness * (r + 40);
    const randomZ = (Math.random() - 0.5) * galaxyParams.randomness * (r + 80);

    galaxyPositions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
    galaxyPositions[i3 + 1] = randomY;
    galaxyPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

    // Color interpolation
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
  galaxyMesh.rotation.x = 0.45; // Tilted towards the camera
  scene.add(galaxyMesh);

  // 4. Ambient 3D Starfield (Full Universe Spread)
  const starsCount = 1200;
  const starsGeometry = new THREE.BufferGeometry();
  const starsPositions = new Float32Array(starsCount * 3);
  const starsColors = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
    starsPositions[i3] = (Math.random() - 0.5) * 2600;
    starsPositions[i3 + 1] = (Math.random() - 0.5) * 2600;
    starsPositions[i3 + 2] = (Math.random() - 0.5) * 2200;

    // Subtle blue and white star color variations
    const isBlue = Math.random() > 0.4;
    starsColors[i3] = isBlue ? 0.6 : 1.0;
    starsColors[i3 + 1] = isBlue ? 0.85 : 1.0;
    starsColors[i3 + 2] = 1.0;
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));

  const starsMaterial = new THREE.PointsMaterial({
    size: 10,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture,
    opacity: 0.85
  });

  const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starsMesh);

  // 5. Heavy, Smooth 3D Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    // Normalized coordinates from screen center (-1 to 1)
    mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  }, { passive: true });

  // 6. 60fps Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle natural galaxy rotation
    galaxyMesh.rotation.y = elapsedTime * 0.035;
    starsMesh.rotation.y = elapsedTime * 0.008;

    // 3D Camera Orbit & Pan with smooth lerp physics
    targetX = mouseX * 220; // Pronounced, responsive 3D movement
    targetY = -mouseY * 160;

    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // 7. Window Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
