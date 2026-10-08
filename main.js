/* ==========================================================================
   SHIVAM MISHRA — THE COSMIC HORIZON MASTER ENGINE (AWWWARDS / BEHFAR.DEV LEVEL)
   3 GALAXY CLUSTERS + SHOOTING STARS + CINEMATIC BLUR + 3D PARALLAX
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
(function initCinematicReveal() {
  function startReveal() {
    if (typeof gsap === 'undefined') {
      setTimeout(startReveal, 40);
      return;
    }

    gsap.set(".reveal-blur", {
      opacity: 0,
      y: 35,
      filter: "blur(18px)",
      willChange: "transform, filter, opacity"
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".title-line", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.3,
      stagger: 0.18,
      delay: 0.15
    })
    .to(".hero-subtitle", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.2
    }, "-=0.85")
    .to(".hero-actions", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.1
    }, "-=0.85")
    .to(".hero-scroll", {
      opacity: 0.65,
      y: 0,
      filter: "blur(0px)",
      duration: 1.0
    }, "-=0.75");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startReveal);
  } else {
    startReveal();
  }
})();

// ==========================================================================
// 2. 3D MAGNETIC BUTTON TILT MICRO-INTERACTION
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
// 3. THREE.JS 3D UNIVERSE (3 GALAXY CLUSTERS + METEORS + MULTI-DEPTH PARALLAX)
// ==========================================================================
(function initCosmicMasterpiece() {
  if (typeof THREE === 'undefined') {
    setTimeout(initCosmicMasterpiece, 40);
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

  // 256x256 Ultra-Crisp Star Sprite
  function createStarTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');          // Diamond Core
    grad.addColorStop(0.14, 'rgba(240, 248, 255, 0.95)');
    grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.65)');       // Ice Blue
    grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.14)');       // Sky Blue Halo
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const starTexture = createStarTexture();

  // Helper Function: Create Organic Gaussian 3D Galaxy Cluster
  function createOrganicCluster(count, radius, centerPos, colorInner, colorOuter, starSize) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c1 = new THREE.Color(colorInner);
    const c2 = new THREE.Color(colorOuter);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 3D Organic Gaussian Distribution (Natural Galaxy Scatter, No Pinwheel!)
      const r = Math.pow(Math.random(), 2.4) * radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      pos[i3] = centerPos.x + (r * Math.sin(phi) * Math.cos(theta));
      pos[i3 + 1] = centerPos.y + (r * Math.sin(phi) * Math.sin(theta)) * 0.75;
      pos[i3 + 2] = centerPos.z + (r * Math.cos(phi)) * 0.9;

      // Color falloff from core to outer edge
      const mixRatio = Math.min(1, r / radius);
      const starCol = c1.clone().lerp(c2, mixRatio);

      col[i3] = starCol.r;
      col[i3 + 1] = starCol.g;
      col[i3 + 2] = starCol.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: starSize,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      map: starTexture,
      opacity: 0.95
    });

    return new THREE.Points(geo, mat);
  }

  // =========================================================================
  // THE 3 DISTINCT CELESTIAL CLUSTERS (behfar.dev Awwwards Style)
  // =========================================================================

  // 1. TOP-RIGHT: Warm Amber & Radiant Gold Star Cluster
  const amberGalaxy = createOrganicCluster(
    1100,                                   // Count
    480,                                    // Radius
    new THREE.Vector3(550, 280, -250),      // Position (Top-Right Depth)
    '#fffbeb', '#f59e0b',                   // White core -> Amber Gold
    16                                      // Star Size
  );
  scene.add(amberGalaxy);

  // 2. TOP-LEFT: Electric Cyan & Ice Blue Nebula Ring Cluster
  const cyanGalaxy = createOrganicCluster(
    1200,
    520,
    new THREE.Vector3(-600, 220, -320),     // Position (Top-Left Depth)
    '#ffffff', '#0284c7',                   // Pure White -> Deep Electric Cyan
    17
  );
  scene.add(cyanGalaxy);

  // 3. CENTER-BOTTOM: Dazzling Diamond White Star Core
  const coreGalaxy = createOrganicCluster(
    950,
    380,
    new THREE.Vector3(0, -220, -180),       // Position (Center-Bottom)
    '#ffffff', '#38bdf8',                   // Brilliant White -> Sky Blue
    15
  );
  scene.add(coreGalaxy);

  // =========================================================================
  // PANORAMIC WIDE BACKGROUND STARFIELD (1,600 Crisp Stars)
  // =========================================================================
  const fieldCount = 1600;
  const fieldGeo = new THREE.BufferGeometry();
  const fieldPos = new Float32Array(fieldCount * 3);
  const fieldCol = new Float32Array(fieldCount * 3);

  const white = new THREE.Color('#ffffff');
  const ice = new THREE.Color('#bae6fd');
  const gold = new THREE.Color('#fef08a');

  for (let i = 0; i < fieldCount; i++) {
    const i3 = i * 3;
    fieldPos[i3] = (Math.random() - 0.5) * 3800;
    fieldPos[i3 + 1] = (Math.random() - 0.5) * 2400;
    fieldPos[i3 + 2] = (Math.random() - 0.5) * 2600;

    const r = Math.random();
    let c = white;
    if (r > 0.7) c = ice;
    else if (r > 0.93) c = gold;

    fieldCol[i3] = c.r;
    fieldCol[i3 + 1] = c.g;
    fieldCol[i3 + 2] = c.b;
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
    opacity: 0.9
  });
  const backgroundField = new THREE.Points(fieldGeo, fieldMat);
  scene.add(backgroundField);

  // =========================================================================
  // SHOOTING STARS ENGINE (METEOR LASER TRAILS)
  // =========================================================================
  const meteors = [];
  const meteorCount = 2;

  for (let m = 0; m < meteorCount; m++) {
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
      timer: Math.random() * 220 + 80
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
          meteor.timer = Math.random() * 280 + 180; // Respawn every 4-7 sec
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
  // 3D MULTI-DEPTH MOUSE PARALLAX & ANIMATION LOOP
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

    // Natural Organic Cluster Drift (Independent Micro-Rotations)
    amberGalaxy.rotation.y = t * 0.008;
    amberGalaxy.rotation.z = Math.sin(t * 0.005) * 0.04;

    cyanGalaxy.rotation.y = -t * 0.009;
    cyanGalaxy.rotation.x = Math.cos(t * 0.006) * 0.04;

    coreGalaxy.rotation.y = t * 0.006;
    backgroundField.rotation.y = t * 0.003;

    // Meteors
    updateMeteors();

    // Camera 3D Orbit with Smooth Damping (Depth Occlusion Parallax)
    targetX = mouseX * 240;
    targetY = -mouseY * 170;

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
