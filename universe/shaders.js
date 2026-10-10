/* ==== BLOCK 1: UNIVERSE/SHADERS.JS START ==== */
/* ==========================================================================
   SHIVAM MISHRA — UNIVERSE SHADERS MODULE (PROMPT B ARCHITECTURE)
   Round Soft Stars (Anti-Box), Warp Velocity, Multi-Galaxy & Planet Shaders
   ========================================================================== */

// ==========================================================================
// 1. STAR SHADER (MANDATORY ROUND SOFT STARS + SPIKES + WARP SPEED)
// ==========================================================================
export const StarShader = {
  vertexShader: /* glsl */ `
    attribute float aSize;
    attribute vec3 aColor;
    attribute vec2 aTwinkle; // x: phase, y: speed
    attribute float aIsNear;   // 1.0 = near beacon star with diffraction spikes

    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uVelocity;   // Damped scroll velocity for warp elongation

    varying vec3 vColor;
    varying float vTwinkle;
    varying float vIsNear;
    varying float vPointSize;

    void main() {
      vColor = aColor;
      vIsNear = aIsNear;

      // Realistic astronomical twinkle scintillation
      float tw = 0.75 + 0.25 * sin(uTime * aTwinkle.y + aTwinkle.x);
      vTwinkle = tw;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = length(mvPosition.xyz);

      // Never let gl_PointSize drop below 2.0 * pixelRatio
      float calculatedSize = aSize * uPixelRatio * (750.0 / max(dist, 1.0)) * tw;
      float pSize = max(2.0 * uPixelRatio, calculatedSize);
      
      // Slight warp elongation along motion during high scroll velocity
      pSize *= (1.0 + min(abs(uVelocity) * 0.035, 1.2));
      
      gl_PointSize = clamp(pSize, 2.0 * uPixelRatio, 64.0);
      vPointSize = gl_PointSize;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;

    varying vec3 vColor;
    varying float vTwinkle;
    varying float vIsNear;
    varying float vPointSize;

    uniform vec2 uResolution;
    uniform float uPixelRatio;
    uniform float uReadability;

    void main() {
      // Coordinate from center (-0.5 to 0.5)
      vec2 uv = gl_PointCoord;
      float r = length(uv - vec2(0.5));

      // 1. MANDATORY ROUND STAR SHAPE: Hard discard outside unit circle
      if (r > 0.5) discard;

      // 2. PROMPT B EXACT GAUSSIAN CORE + HALO FORMULA (ZERO SQUARE BOXES)
      float core = exp(-r * r * 40.0);
      float halo = exp(-r * 6.0) * 0.35;
      float alpha = clamp(core + halo, 0.0, 1.0);

      vec3 col = vColor;

      // 3. 4-POINT DIFFRACTION SPIKES ON BRIGHT NEAR STARS (> 4px)
      if (vIsNear > 0.5 && vPointSize > (4.0 * uPixelRatio)) {
        vec2 coord = uv - vec2(0.5);
        float spikeX = max(0.0, 1.0 - abs(coord.y) * 22.0) * max(0.0, 1.0 - abs(coord.x) * 2.2);
        float spikeY = max(0.0, 1.0 - abs(coord.x) * 22.0) * max(0.0, 1.0 - abs(coord.y) * 2.2);
        float spikes = (spikeX + spikeY) * 2.4;
        col += vColor * spikes; // HDR emission boost to trigger UnrealBloomPass
      }

      // 4. SCREEN-SPACE TEXT READABILITY MASK (Darkens behind text center)
      vec2 screenUV = gl_FragCoord.xy / max(uResolution, vec2(1.0));
      vec2 readCoord = (screenUV - vec2(0.5, 0.52)) / vec2(0.45, 0.32);
      float readMask = smoothstep(0.2, 1.0, dot(readCoord, readCoord));
      col *= mix(1.0 - (uReadability * 0.25), 1.0, readMask);

      gl_FragColor = vec4(col * alpha, alpha);
    }
  `
};

// ==========================================================================
// 2. GALAXY SHADER (DIFFERENTIAL ROTATION + DUST LANES + HII KNOTS)
// ==========================================================================
export const GalaxyShader = {
  vertexShader: /* glsl */ `
    attribute float aRadius;
    attribute float aAngle;
    attribute vec3 aColor;
    attribute float aSize;
    attribute float aDust;  // Low-frequency absorption factor (dark dust lanes)
    attribute float aHII;   // 1.0 = Pink ionized hydrogen star-forming region

    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSpeed;

    varying vec3 vColor;
    varying float vDust;
    varying float vHII;

    void main() {
      vColor = aColor;
      vDust = aDust;
      vHII = aHII;

      // Differential Rotation: Angular speed ~ 1 / radius (Core rotates faster)
      float angVel = (1.2 / (aRadius * 0.005 + 1.2)) * uSpeed;
      float currentAngle = aAngle + uTime * angVel;

      vec3 pos = position;
      pos.x = cos(currentAngle) * aRadius;
      pos.z = sin(currentAngle) * aRadius;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      float dist = length(mvPosition.xyz);

      float pSize = aSize * uPixelRatio * (650.0 / max(dist, 1.0));
      gl_PointSize = clamp(pSize, 2.0 * uPixelRatio, 22.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;

    varying vec3 vColor;
    varying float vDust;
    varying float vHII;

    void main() {
      vec2 uv = gl_PointCoord;
      float r = length(uv - vec2(0.5));
      if (r > 0.5) discard;

      // Soft round celestial particle
      float core = exp(-r * r * 38.0);
      float halo = exp(-r * 6.5) * 0.35;
      float alpha = clamp(core + halo, 0.0, 1.0);

      vec3 col = vColor;

      // Pink HII-region knots along spiral arms
      if (vHII > 0.5) {
        col = mix(col, vec3(1.0, 0.32, 0.58), 0.75); // Vivid hydrogen alpha pink
      }

      // Dark dust lane absorption (inner edges of arms)
      col *= (1.0 - vDust * 0.75);

      gl_FragColor = vec4(col * alpha * 1.35, alpha);
    }
  `
};

// ==========================================================================
// 3. PROCEDURAL GAS GIANT PLANET & ATMOSPHERE SHADER
// ==========================================================================
export const PlanetShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = viewMatrix * worldPos;
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    uniform vec3 uSunPosition; // Star light source
    uniform float uTime;

    // Fast 3D Simplex noise for planet cloud bands
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(uSunPosition - vWorldPosition);

      // Latitude bands (Stretched along planet equator)
      vec3 p = vWorldPosition * 0.015;
      float bands = noise(vec3(p.y * 3.5, p.x * 0.2 + uTime * 0.02, p.z * 0.2));
      bands += 0.5 * noise(vec3(p.y * 8.0, p.x * 0.5, p.z * 0.5));

      // Gas Giant Palette (Rich Golden Amber, Ochre, and Pale Cream Belts)
      vec3 colA = vec3(0.92, 0.74, 0.48); // Amber cream
      vec3 colB = vec3(0.68, 0.42, 0.22); // Deep ochre belt
      vec3 colC = vec3(0.35, 0.22, 0.15); // Dark atmospheric storm
      vec3 planetColor = mix(colA, colB, smoothstep(0.3, 0.7, bands));
      planetColor = mix(planetColor, colC, smoothstep(0.7, 1.1, bands));

      // Day/Night Terminator Lighting
      float diff = max(0.0, dot(normal, lightDir));
      float terminator = smoothstep(-0.05, 0.18, dot(normal, lightDir));

      // Atmospheric Fresnel Rim Glow
      float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.2);
      vec3 atmosphereColor = vec3(0.38, 0.65, 0.95) * fresnel * 1.8 * (terminator * 0.8 + 0.2);

      vec3 finalColor = planetColor * (terminator * 0.95 + 0.05) + atmosphereColor;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// ==========================================================================
// 4. PLANET RING SHADER (Thin Ring with Cassini Gaps & Shadow)
// ==========================================================================
export const RingShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform vec3 uSunPosition;

    void main() {
      // Ring radius coordinate from center
      vec2 coord = vUv - vec2(0.5);
      float r = length(coord) * 2.0;

      // Inner and outer ring boundaries
      if (r < 0.42 || r > 0.96) discard;

      // Cassini Gaps & Fine Particulate Ring Density
      float density = sin(r * 90.0) * 0.5 + 0.5;
      density *= smoothstep(0.42, 0.48, r) * smoothstep(0.96, 0.88, r);

      // Major Cassini Division gap
      if (r > 0.68 && r < 0.74) density *= 0.12;

      vec3 ringColor = mix(vec3(0.82, 0.72, 0.58), vec3(0.55, 0.45, 0.35), density);
      gl_FragColor = vec4(ringColor * 1.2, density * 0.75);
    }
  `
};

// ==========================================================================
// 5. VOLUMETRIC EMISSION NEBULA SHADER (Hubble Palette + Dust Lanes)
// ==========================================================================
export const NebulaShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uCameraPos;
    uniform mat4 uInvProj;
    uniform mat4 uInvView;
    uniform int uSteps;
    uniform float uDensity;
    uniform float uIntensity;
    uniform float uReadability;

    uniform vec3 uColorTeal;
    uniform vec3 uColorBlue;
    uniform vec3 uColorMagenta;
    uniform vec3 uColorGold;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
    }

    const mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * noise(p); p = m * p * 2.02;
      f += 0.2500 * noise(p); p = m * p * 2.03;
      f += 0.1250 * noise(p); p = m * p * 2.01;
      f += 0.0625 * noise(p); p = m * p * 2.04;
      return f;
    }

    float nebulaDensity(vec3 p, out float dustAbsorption) {
      vec3 q = vec3(
        fbm(p + vec3(0.0, uTime * 0.015, 0.0)),
        fbm(p + vec3(5.2, 1.3, 2.8) - uTime * 0.01),
        fbm(p + vec3(2.2, 3.4, 1.1))
      );
      vec3 r = vec3(
        fbm(p + 4.0 * q + vec3(1.7, 9.2, 0.5)),
        fbm(p + 4.0 * q + vec3(8.3, 2.8, 3.2)),
        fbm(p + 4.0 * q + vec3(3.1, 5.1, 7.3))
      );

      float d = fbm(p + 4.0 * r);
      d = smoothstep(0.32, 0.88, d);
      dustAbsorption = smoothstep(0.4, 0.8, fbm(p * 0.4 + vec3(1.2, 2.3, 4.1)));
      return d * uDensity;
    }

    void main() {
      vec2 ndc = vUv * 2.0 - 1.0;
      vec4 clip = vec4(ndc, 1.0, 1.0);
      vec4 viewRay = uInvProj * clip;
      vec3 rayDir = normalize((uInvView * vec4(viewRay.xyz, 0.0)).xyz);
      vec3 rayOrigin = uCameraPos;

      float dither = hash(vec3(gl_FragCoord.xy, uTime));
      int steps = uSteps;
      float stepSize = 110.0 / float(steps);
      vec3 p = rayOrigin + rayDir * (stepSize * dither + 30.0);

      vec3 accumColor = vec3(0.0);
      float transmittance = 1.0;

      for (int i = 0; i < 40; i++) {
        if (i >= steps || transmittance < 0.02) break;

        vec3 samplePos = p * 0.0032;
        float dust = 0.0;
        float dens = nebulaDensity(samplePos, dust);

        if (dens > 0.005) {
          vec3 col = mix(uColorBlue, uColorTeal, smoothstep(0.1, 0.45, dens));
          col = mix(col, uColorMagenta, smoothstep(0.45, 0.75, dens));
          col = mix(col, uColorGold, smoothstep(0.75, 1.0, dens));

          float absorption = mix(1.0, 0.15, dust);
          float alpha = dens * 0.16;

          accumColor += col * alpha * transmittance * absorption;
          transmittance *= exp(-alpha * 1.4);
        }

        p += rayDir * stepSize;
      }

      vec2 readCoord = (vUv - vec2(0.5, 0.52)) / vec2(0.45, 0.32);
      float readDist = dot(readCoord, readCoord);
      float readMask = smoothstep(0.3, 1.1, readDist);
      accumColor *= mix(1.0 - (uReadability * 0.55), 1.0, readMask);

      accumColor = min(accumColor * uIntensity, vec3(0.65));
      gl_FragColor = vec4(accumColor, 1.0 - transmittance);
    }
  `
};

// ==========================================================================
// 6. POST-PROCESSING SHADER (Dither, Grain, Vignette & Chromatic Aberration)
// ==========================================================================
export const PostShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: 0.35 },
    uAberration: { value: 0.0006 },
    uGrain: { value: 0.035 },
    uResolution: { value: null }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uAberration;
    uniform float uGrain;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float dither(vec2 coord) {
      return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec2 distFromCenter = uv - 0.5;

      vec2 caOffset = distFromCenter * uAberration;
      float r = texture2D(tDiffuse, uv - caOffset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv + caOffset).b;
      vec3 color = vec3(r, g, b);

      float vig = 1.0 - dot(distFromCenter, distFromCenter) * (uVignette * 2.5);
      color *= clamp(vig, 0.0, 1.0);

      float grain = (dither(gl_FragCoord.xy + fract(uTime * 17.1)) - 0.5) * uGrain;
      color += grain;

      float bandDither = (dither(gl_FragCoord.xy) - 0.5) / 255.0;
      color += bandDither;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
/* ==== BLOCK 1: UNIVERSE/SHADERS.JS END ==== */
