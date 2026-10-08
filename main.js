/* ==========================================================================
   SHIVAM MISHRA — ORGANIC DEEP SPACE UNIVERSE & 3D MAGNETIC ENGINE
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

// 2. 4K Organic Deep Cosmic Starfield (No Pinwheel, Pure Star Clusters)
(function initOrganicCosmos() {
  if (typeof THREE === 'undefined') {
    setTimeout(initOrganicCosmos, 40);
    return;
  }

  let canvas = document.getElementById('universe-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'universe-canvas';
    document.body.prepend(canvas);
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.z = 800;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 256x256 Ultra-HD Smooth Radial Gaussian Bloom Star Texture
  function createCrispStarTexture() {
    const size = 256;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const ctx = offCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1)');          // Brilliant Core
    gradient.addColorStop(0.1, 'rgba(245, 252, 255, 0.95)');       // Inner Hot Halo
    gradient.addColorStop(0.25, 'rgba(125, 211, 252, 0.65)');      // Sky Blue Mid-Falloff
    gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');        // Outer Ambient Blue
    gradient.addColorStop(0.75, 'rgba(14, 165, 233, 0.08)');       // Deep Nebula Rim
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');                // Complete Fade

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(offCanvas);
    texture.needsUpdate = true;
    return texture;
  }

  const starTexture = createCrispStarTexture();

  // Organic Starfield: 4,500 Natural Distributed Stars (No geometric pinwheels!)
  const starsCount = 4500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starsCount * 3);
  const colors = new Float32Array(starsCount * 3);

  const whiteColor = new THREE.Color('#ffffff');
  const skyBlueColor = new THREE.Color('#38bdf8');
  const deepCyanColor = new THREE.Color('#0ea5e9');
  const warmGlowColor = new THREE.Color('#fef08a'); // Gentle amber twinkles

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;

    // Natural 3D Ellipsoid & Depth Volume (Organic Space Spread)
    const radius = Math.random() * 1600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = (radius * Math.sin(phi) * Math.sin(theta)) * 0.75; // Subtle galactic flattening
    positions[i3 + 2] = (radius * Math.cos(phi)) * 1.2;                    // Deep z-depth

    // Organic Color Variation
    const rand = Math.random();
    let starColor;
    if (rand < 0.5) {
      starColor = whiteColor;
    } else if (rand < 0.8) {
      starColor = skyBlueColor;
    } else if (rand < 0.95) {
      starColor = deepCyanColor;
    } else {
      starColor = warmGlowColor;
    }

    colors[i3] = starColor.r;
    colors[i3 + 1] = starColor.g;
    colors[i3 + 2] = starColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 15,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture,
    opacity: 0.95
  });

  const cosmosMesh = new THREE.Points(geometry, material);
  scene.add(cosmosMesh);

  // Smooth, High-Reaction 3D Mouse Parallax (Exact physics preserved!)
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

    // Subtle majestic organic drift
    cosmosMesh.rotation.y = elapsedTime * 0.012;
    cosmosMesh.rotation.x = Math.sin(elapsedTime * 0.008) * 0.05;

    // Smooth camera orbit
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
