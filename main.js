/* ==========================================================================
   SHIVAM MISHRA — ORION NEBULA 3D ENGINE (BRYAN GOFF ASTROPHOTOGRAPHY STYLE)
   ORGANIC VOLUMETRIC GAS + MULTI-COLORED STARS + ZERO-LAG CINEMATIC FOCUS
   ========================================================================== */

window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// ==========================================================================
// 1. HARDWARE-ACCELERATED ZERO-LAG TEXT REVEAL (BUTTERY SMOOTH 120FPS)
// ==========================================================================
(function initSmoothReveal() {
  function startReveal() {
    if (typeof gsap === 'undefined') {
      setTimeout(startReveal, 40);
      return;
    }

    // Lightweight 6px micro-blur: zero GPU rasterization stutter
    gsap.set(".reveal-blur", {
      opacity: 0,
      y: 26,
      filter: "blur(6px)",
      willChange: "transform, opacity, filter"
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.to(".title-line", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.0,
      stagger: 0.14,
      delay: 0.1,
      clearProps: "filter,willChange" // Clears filter overhead instantly
    })
    .to(".hero-subtitle", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.9,
      clearProps: "filter,willChange"
    }, "-=0.75")
    .to(".hero-actions", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.85,
      clearProps: "filter,willChange"
    }, "-=0.75")
    .to(".hero-scroll", {
      opacity: 0.65,
      y: 0,
      filter: "blur(0px)",
      duration: 0.8,
      clearProps: "filter,willChange"
    }, "-=0.65");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startReveal);
  } else {
    startReveal();
  }
})();

// ==========================================================================
// 2. 3D MAGNETIC BUTTON TILT
// ==========================================================================
(function initMagneticTilt() {
  const tiltElements = document.querySelectorAll('.btn-connect, .btn-hero-primary, .btn-hero-secondary');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = -(y / (rect.height / 2)) * 12;
      const tiltY = (x / (rect.width / 2)) * 12;

      el.style.transform = `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)`;
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  });
})();

// ==========================================================================
// 3. THE 3D ORION NEBULA COSMIC ENGINE (THREE.JS)
// ==========================================================================
(function initOrionNebula() {
  if (typeof THREE === 'undefined') {
    setTimeout(initOrionNebula, 40);
    return;
  }

  let canvas = document.getElementById('universe-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'universe-canvas';
    document.body.prepend(canvas);
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 4500);
  camera.position.z = 820;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // --- 1. PROCEDURAL 4K ORION NEBULA CLOUD TEXTURE (Soft Gas, Zero Hard Lines) ---
  function createOrionNebulaTexture() {
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;

    // A. Outer Deep Indigo/Violet Gas Spread
    const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.48);
    outerGrad.addColorStop(0.0, 'rgba(88, 28, 135, 0.38)');    // Deep Violet
    outerGrad.addColorStop(0.35, 'rgba(30, 27, 75, 0.22)');     // Cosmic Indigo
    outerGrad.addColorStop(0.7, 'rgba(3, 7, 18, 0.08)');       // Deep Space Fade
    outerGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(0, 0, size, size);

    // B. Organic Volumetric Magenta & Rose Pink Gas Puff (Orion Heart)
    const magentaGrad = ctx.createRadialGradient(cx + 20, cy + 30, 20, cx, cy, size * 0.32);
    magentaGrad.addColorStop(0.0, 'rgba(219, 39, 119, 0.65)');   // Hot Rose Pink
    magentaGrad.addColorStop(0.25, 'rgba(168, 85, 247, 0.5)');   // Magenta Violet
    magentaGrad.addColorStop(0.55, 'rgba(79, 70, 229, 0.25)');   // Royal Violet
    magentaGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = magentaGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // C. Glowing Electric Cyan & Aqua-Teal Core (Ionized Gas Center)
    const tealGrad = ctx.createRadialGradient(cx - 30, cy - 20, 0, cx - 20, cy - 10, size * 0.22);
    tealGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');    // Diamond White Hot Star
    tealGrad.addColorStop(0.2, 'rgba(45, 212, 191, 0.85)');     // Electric Aqua Teal
    tealGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');     // Sky Blue Halo
    tealGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tealGrad;
    ctx.beginPath();
    ctx.arc(cx - 20, cy - 10, size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // --- 2. Crystalline Star Sprite ---
  function createStarTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.15, 'rgba(240, 248, 255, 0.95)');
    grad.addColorStop(0.32, 'rgba(186, 230, 253, 0.65)');
    grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const nebulaTexture = createOrionNebulaTexture();
  const starTexture = createStarTexture();

  // =========================================================================
  // THE 3D ORION NEBULA VOLUMETRIC CLOUD (Natural Soft Cloud, No Flat Strips)
  // =========================================================================
  const nebulaGeo = new THREE.PlaneGeometry(2400, 1800);
  const nebulaMat = new THREE.MeshBasicMaterial({
    map: nebulaTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.82
  });

  const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
  // Positioned naturally in deep 3D space behind the text
  nebulaMesh.position.set(40, -30, -350);
  scene.add(nebulaMesh);

  // =========================================================================
  // RICH MULTI-COLORED 3D STARFIELD (White, Cyan, Warm Gold & Rose Stars)
  // =========================================================================
  const starsCount = 2000;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starsCount * 3);
  const starCol = new Float32Array(starsCount * 3);

  const colWhite = new THREE.Color('#ffffff');
  const colCyan = new THREE.Color('#38bdf8');
  const colTeal = new THREE.Color('#2dd4bf');
  const colGold = new THREE.Color('#fef08a');
  const colRose = new THREE.Color('#f472b6');

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;

    // Wide organic spread filling the entire deep horizon
    starPos[i3] = (Math.random() - 0.5) * 3800;
    starPos[i3 + 1] = (Math.random() - 0.5) * 2400;
    starPos[i3 + 2] = (Math.random() - 0.5) * 2600;

    const r = Math.random();
    let c = colWhite;
    if (r > 0.45 && r <= 0.7) c = colCyan;      // 25% Cyan Stars
    else if (r > 0.7 && r <= 0.85) c = colTeal; // 15% Teal Stars
    else if (r > 0.85 && r <= 0.94) c = colGold; // 9% Warm Gold Stars
    else if (r > 0.94) c = colRose;             // 6% Subtle Rose Stars

    starCol[i3] = c.r;
    starCol[i3 + 1] = c.g;
    starCol[i3 + 2] = c.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));

  const starMat = new THREE.PointsMaterial({
    size: 11,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture,
    opacity: 0.92
  });
  const backgroundField = new THREE.Points(starGeo, starMat);
  scene.add(backgroundField);

  // =========================================================================
  // TWINKLING COLORFUL FOREGROUND BEACONS (Prominent Sparkling Gems)
  // =========================================================================
  const beaconCount = 95;
  const beaconGeo = new THREE.BufferGeometry();
  const beaconPos = new Float32Array(beaconCount * 3);
  const beaconCol = new Float32Array(beaconCount * 3);

  for (let i = 0; i < beaconCount; i++) {
    const i3 = i * 3;
    beaconPos[i3] = (Math.random() - 0.5) * 2600;
    beaconPos[i3 + 1] = (Math.random() - 0.5) * 1600;
    beaconPos[i3 + 2] = (Math.random() - 0.5) * 1200 + 100;

    const r = Math.random();
    let c = colWhite;
    if (r > 0.5) c = colCyan;
    else if (r > 0.8) c = colGold;

    beaconCol[i3] = c.r;
    beaconCol[i3 + 1] = c.g;
    beaconCol[i3 + 2] = c.b;
  }

  beaconGeo.setAttribute('position', new THREE.BufferAttribute(beaconPos, 3));
  beaconGeo.setAttribute('color', new THREE.BufferAttribute(beaconCol, 3));

  const beaconMat = new THREE.PointsMaterial({
    size: 20, // Sparkling gems
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture,
    opacity: 0.95
  });
  const beaconMesh = new THREE.Points(beaconGeo, beaconMat);
  scene.add(beaconMesh);

  // =========================================================================
  // SHOOTING STARS (METEOR SYSTEM)
  // =========================================================================
  const meteors = [];
  for (let m = 0; m < 2; m++) {
    const mGeo = new THREE.BufferGeometry();
    mGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));

    const mMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });

    const mLine = new THREE.Line(mGeo, mMat);
    scene.add(mLine);

    meteors.push({
      mesh: mLine,
      geo: mGeo,
      mat: mMat,
      active: false,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      length: 180,
      life: 0,
      maxLife: 55,
      timer: Math.random() * 200 + 80
    });
  }

  function spawnMeteor(meteor) {
    meteor.active = true;
    meteor.life = 0;
    meteor.maxLife = Math.floor(Math.random() * 25 + 40);

    const startX = (Math.random() - 0.5) * 1600 + 400;
    const startY = Math.random() * 800 + 400;
    const startZ = (Math.random() - 0.5) * 500;
    meteor.pos.set(startX, startY, startZ);

    const speed = Math.random() * 20 + 26;
    meteor.vel.set(-speed, -speed * 0.72, (Math.random() - 0.5) * 6);
    meteor.mat.opacity = 1;
  }

  function updateMeteors() {
    meteors.forEach(meteor => {
      if (!meteor.active) {
        meteor.timer--;
        if (meteor.timer <= 0) {
          spawnMeteor(meteor);
          meteor.timer = Math.random() * 280 + 180;
        }
      } else {
        meteor.life++;
        meteor.pos.add(meteor.vel);

        const head = meteor.pos;
        const tail = meteor.pos.clone().sub(meteor.vel.clone().normalize().multiplyScalar(meteor.length));

        const p = meteor.geo.attributes.position.array;
        p[0] = tail.x; p[1] = tail.y; p[2] = tail.z;
        p[3] = head.x; p[4] = head.y; p[5] = head.z;
        meteor.geo.attributes.position.needsUpdate = true;

        meteor.mat.opacity = Math.max(0, 1 - (meteor.life / meteor.maxLife));
        if (meteor.life >= meteor.maxLife) {
          meteor.active = false;
          meteor.mat.opacity = 0;
        }
      }
    });
  }

  // =========================================================================
  // 3D CAMERA PARALLAX & ORGANIC DRIFT LOOP
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
    const t = clock.getElapsedTime();

    // The Orion Nebula Breathes and Drifts Subtly in 3D Space
    nebulaMesh.rotation.z = Math.sin(t * 0.008) * 0.05;
    nebulaMesh.position.y = -30 + Math.sin(t * 0.012) * 12;

    // Stars Organic Float
    backgroundField.rotation.y = t * 0.003;
    beaconMesh.rotation.y = t * 0.006;
    beaconMat.opacity = 0.8 + Math.sin(t * 2.2) * 0.2;

    updateMeteors();

    // Silky Smooth Camera 3D Orbit
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
