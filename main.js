/* ==========================================================================
   SHIVAM MISHRA — COSMIC HORIZON (ANDROMEDA HORIZON + ZERO-LAG BLUR REVEAL)
   ========================================================================== */

window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// ==========================================================================
// 1. SILKY CINEMATIC BLUR-TO-FOCUS REVEAL TIMELINE (OPTIMIZED ZERO-LAG)
// ==========================================================================
(function initCinematicBlurReveal() {
  function startReveal() {
    if (typeof gsap === 'undefined') {
      setTimeout(startReveal, 40);
      return;
    }

    // Set initial cinematic blur state
    gsap.set(".reveal-blur", {
      opacity: 0,
      y: 32,
      filter: "blur(12px)",
      willChange: "transform, opacity, filter"
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Step 1: The Grand 3D Metallic Headline
    tl.to(".title-line", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.15,
      stagger: 0.15,
      delay: 0.15,
      clearProps: "filter,willChange" // Removes GPU raster overhead once sharp!
    })
    // Step 2: Subtitle
    .to(".hero-subtitle", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.05,
      clearProps: "filter,willChange"
    }, "-=0.75")
    // Step 3: Luxury Glass Action Buttons
    .to(".hero-actions", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.95,
      clearProps: "filter,willChange"
    }, "-=0.75")
    // Step 4: Scroll Cue
    .to(".hero-scroll", {
      opacity: 0.65,
      y: 0,
      filter: "blur(0px)",
      duration: 0.85,
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
// 2. 3D MAGNETIC BUTTON TILT (HEADER & HERO BUTTONS)
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
// 3. THREE.JS 3D ANDROMEDA HORIZON & STARFIELD ENGINE
// ==========================================================================
(function initCosmicAndromeda() {
  if (typeof THREE === 'undefined') {
    setTimeout(initCosmicAndromeda, 40);
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

  // --- 1. PROCEDURAL 4K ANDROMEDA GALAXY DISK TEXTURE ---
  function createAndromedaTexture() {
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;

    // Outer Cosmic Nebula Dust
    const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.48);
    outerGrad.addColorStop(0.0, 'rgba(14, 116, 144, 0.35)');
    outerGrad.addColorStop(0.35, 'rgba(3, 105, 161, 0.2)');
    outerGrad.addColorStop(0.7, 'rgba(2, 44, 94, 0.06)');
    outerGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(0, 0, size, size);

    // Elliptical Galaxy Disk
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.95, 0.62);

    const diskGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.24);
    diskGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');       // Pure White Core
    diskGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.95)');   // Golden Nucleus
    diskGrad.addColorStop(0.26, 'rgba(245, 158, 11, 0.65)');    // Amber Dust Lanes
    diskGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.42)');    // Cyan Arms
    diskGrad.addColorStop(0.85, 'rgba(14, 165, 233, 0.12)');
    diskGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Radiant Core Glow Bloom
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 85);
    coreGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    coreGrad.addColorStop(0.3, 'rgba(254, 243, 199, 0.95)');
    coreGrad.addColorStop(0.65, 'rgba(251, 191, 36, 0.45)');
    coreGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 85, 0, Math.PI * 2);
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

  const andromedaTexture = createAndromedaTexture();
  const starTexture = createStarTexture();

  // =========================================================================
  // THE 3D ANDROMEDA GALAXY PLANE (Flowing Diagonally Below the Text)
  // =========================================================================
  const andromedaGeo = new THREE.PlaneGeometry(2800, 1600);
  const andromedaMat = new THREE.MeshBasicMaterial({
    map: andromedaTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.88
  });

  const andromedaMesh = new THREE.Mesh(andromedaGeo, andromedaMat);
  // Tuned: Lower-mid depth horizon so the golden core cradles the viewport bottom
  andromedaMesh.rotation.x = 0.92;
  andromedaMesh.rotation.y = -0.28;
  andromedaMesh.rotation.z = 0.52;
  andromedaMesh.position.set(100, -140, -240);
  scene.add(andromedaMesh);

  // =========================================================================
  // STELLAR DISK STARS (Riding Along the Andromeda Plane)
  // =========================================================================
  const diskStarCount = 1300;
  const diskStarGeo = new THREE.BufferGeometry();
  const diskStarPos = new Float32Array(diskStarCount * 3);
  const diskStarCol = new Float32Array(diskStarCount * 3);

  const colWhite = new THREE.Color('#ffffff');
  const colGold = new THREE.Color('#fef08a');
  const colCyan = new THREE.Color('#38bdf8');

  for (let i = 0; i < diskStarCount; i++) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.pow(Math.random(), 1.8) * 1150;

    diskStarPos[i3] = Math.cos(angle) * dist * 1.55;
    diskStarPos[i3 + 1] = Math.sin(angle) * dist * 0.65;
    diskStarPos[i3 + 2] = (Math.random() - 0.5) * 220;

    let c = colWhite;
    if (dist < 320) c = colGold;
    else if (Math.random() > 0.5) c = colCyan;

    diskStarCol[i3] = c.r;
    diskStarCol[i3 + 1] = c.g;
    diskStarCol[i3 + 2] = c.b;
  }

  diskStarGeo.setAttribute('position', new THREE.BufferAttribute(diskStarPos, 3));
  diskStarGeo.setAttribute('color', new THREE.BufferAttribute(diskStarCol, 3));

  const diskStarMat = new THREE.PointsMaterial({
    size: 13,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture,
    opacity: 0.88
  });

  const diskStarMesh = new THREE.Points(diskStarGeo, diskStarMat);
  diskStarMesh.position.copy(andromedaMesh.position);
  diskStarMesh.rotation.copy(andromedaMesh.rotation);
  scene.add(diskStarMesh);

  // =========================================================================
  // PANORAMIC WIDE BACKGROUND STARFIELD (1,200 Crisp Stars)
  // =========================================================================
  const fieldCount = 1200;
  const fieldGeo = new THREE.BufferGeometry();
  const fieldPos = new Float32Array(fieldCount * 3);
  const fieldCol = new Float32Array(fieldCount * 3);

  for (let i = 0; i < fieldCount; i++) {
    const i3 = i * 3;
    fieldPos[i3] = (Math.random() - 0.5) * 3800;
    fieldPos[i3 + 1] = (Math.random() - 0.5) * 2400;
    fieldPos[i3 + 2] = (Math.random() - 0.5) * 2600;

    const isCyan = Math.random() > 0.65;
    fieldCol[i3] = isCyan ? 0.7 : 1.0;
    fieldCol[i3 + 1] = isCyan ? 0.9 : 1.0;
    fieldCol[i3 + 2] = 1.0;
  }

  fieldGeo.setAttribute('position', new THREE.BufferAttribute(fieldPos, 3));
  fieldGeo.setAttribute('color', new THREE.BufferAttribute(fieldCol, 3));

  const fieldMat = new THREE.PointsMaterial({
    size: 10,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    map: starTexture,
    opacity: 0.85
  });
  const backgroundField = new THREE.Points(fieldGeo, fieldMat);
  scene.add(backgroundField);

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
  // 3D CAMERA PARALLAX & ANIMATION LOOP
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

    // The Entire Andromeda Galaxy Rotates Majestically in 3D
    andromedaMesh.rotation.z = 0.52 + (t * 0.006);
    diskStarMesh.rotation.z = andromedaMesh.rotation.z;

    backgroundField.rotation.y = t * 0.002;

    updateMeteors();

    // Smooth Camera 3D Orbit
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
