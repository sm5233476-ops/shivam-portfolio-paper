/* ==========================================================================
   SHIVAM MISHRA — COSMIC HORIZON (SHOOTING STARS + CINEMATIC BLUR ENGINE)
   ========================================================================== */

window.CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsapp: "919899452192",
  instagram: "shivam.0nyx"
};

// ==========================================================================
// 1. GSAP CINEMATIC BLUR-TO-FOCUS REVEAL TIMELINE
// ==========================================================================
(function initCinematicHeroReveal() {
  function startReveal() {
    if (typeof gsap === 'undefined') {
      setTimeout(startReveal, 40);
      return;
    }

    // Set initial heavy cinematic blur state
    gsap.set(".reveal-blur", {
      opacity: 0,
      y: 40,
      filter: "blur(18px)",
      willChange: "transform, filter, opacity"
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Step 1: Status Badge Focus
    tl.to(".hero-badge", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.1,
      delay: 0.2
    })
    // Step 2: The Grand Title Lines (Staggered Focus)
    .to(".title-line", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.3,
      stagger: 0.2
    }, "-=0.8")
    // Step 3: Subtitle Focus
    .to(".hero-subtitle", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.2
    }, "-=0.9")
    // Step 4: Glass Buttons Snap In
    .to(".hero-actions", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.1
    }, "-=0.9")
    // Step 5: Bottom Scroll Indicator
    .to(".hero-scroll", {
      opacity: 0.7,
      y: 0,
      filter: "blur(0px)",
      duration: 1.0
    }, "-=0.8");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startReveal);
  } else {
    startReveal();
  }
})();

// ==========================================================================
// 2. 3D MAGNETIC TILT ON CONNECT BUTTON
// ==========================================================================
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

// ==========================================================================
// 3. THREE.JS COSMIC STARFIELD & SHOOTING STARS (METEOR ENGINE)
// ==========================================================================
(function initCosmicEngine() {
  if (typeof THREE === 'undefined') {
    setTimeout(initCosmicEngine, 40);
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

  // Razor-Sharp Crystalline Star Texture
  function createSharpStarTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.15, 'rgba(240, 248, 255, 0.95)');
    grad.addColorStop(0.32, 'rgba(186, 230, 253, 0.6)');
    grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const starTexture = createSharpStarTexture();

  // Layer 1: Panoramic Starfield
  const starsCount = 2200;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starsCount * 3);
  const starColors = new Float32Array(starsCount * 3);

  const colWhite = new THREE.Color('#ffffff');
  const colIce = new THREE.Color('#bae6fd');
  const colAmber = new THREE.Color('#fef08a');

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
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

  // Layer 2: Twinkling Beacon Stars
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

  // =========================================================================
  // SHOOTING STAR (METEOR STREAK SYSTEM)
  // =========================================================================
  const meteorCount = 2;
  const meteors = [];

  for (let m = 0; m < meteorCount; m++) {
    const meteorGeo = new THREE.BufferGeometry();
    const meteorPositions = new Float32Array([0, 0, 0, 0, 0, 0]); // Tail & Head
    meteorGeo.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3));

    const meteorMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });

    const meteorLine = new THREE.Line(meteorGeo, meteorMat);
    scene.add(meteorLine);

    meteors.push({
      mesh: meteorLine,
      geo: meteorGeo,
      mat: meteorMat,
      active: false,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      length: 160,
      life: 0,
      maxLife: 60,
      timer: Math.random() * 200 + 100 // Stagger initial spawn
    });
  }

  function spawnMeteor(meteor) {
    meteor.active = true;
    meteor.life = 0;
    meteor.maxLife = Math.floor(Math.random() * 25 + 40);

    // Spawn from random upper region
    const startX = (Math.random() - 0.5) * 1800 + 400;
    const startY = Math.random() * 800 + 400;
    const startZ = (Math.random() - 0.5) * 600;
    meteor.pos.set(startX, startY, startZ);

    // Diagonal high-speed velocity vector
    const speed = Math.random() * 18 + 26;
    meteor.vel.set(-speed, -speed * 0.7, (Math.random() - 0.5) * 6);
    meteor.mat.opacity = 1;
  }

  function updateMeteors() {
    meteors.forEach(meteor => {
      if (!meteor.active) {
        meteor.timer--;
        if (meteor.timer <= 0) {
          spawnMeteor(meteor);
          meteor.timer = Math.random() * 280 + 180; // Respawn every ~4-7 seconds
        }
      } else {
        meteor.life++;
        meteor.pos.add(meteor.vel);

        // Head and Tail positions
        const head = meteor.pos;
        const tail = meteor.pos.clone().sub(meteor.vel.clone().normalize().multiplyScalar(meteor.length));

        const positions = meteor.geo.attributes.position.array;
        positions[0] = tail.x;
        positions[1] = tail.y;
        positions[2] = tail.z;
        positions[3] = head.x;
        positions[4] = head.y;
        positions[5] = head.z;
        meteor.geo.attributes.position.needsUpdate = true;

        // Fade out towards end of life
        meteor.mat.opacity = Math.max(0, 1 - (meteor.life / meteor.maxLife));

        if (meteor.life >= meteor.maxLife) {
          meteor.active = false;
          meteor.mat.opacity = 0;
        }
      }
    });
  }

  // Mouse Parallax & Render Loop
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

    // Shooting stars physics
    updateMeteors();

    // 3D Camera Orbit
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
