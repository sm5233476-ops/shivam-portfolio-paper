/* ==== BLOCK 1: UNIVERSE/SHADERS.JS START ==== */
/* ==========================================================================
   SHIVAM MISHRA — UNIVERSE SHADERS MODULE (60FPS BALANCED LIGHTING & ANTI-BOX)
   Round Stars, Warp Velocity, Differential Galaxies, Planet, Rings & Comet
   ========================================================================== */

// ==========================================================================
// 1. STAR SHADER (EXACT ROUND FORMULA + ZERO BOXES + WARP VELOCITY)
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

      // Astronomical twinkle scintillation
      float tw = 0.75 + 0.25 * sin(uTime * aTwinkle.y + aTwinkle.x);
      vTwinkle = tw;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = length(mvPosition.xyz);

      // Never let gl_PointSize drop below 2.0 * pixelRatio
      float calculatedSize = aSize * uPixelRatio * (720.0 / max(dist, 1.0)) * tw;
      float pSize = max(2.0 * uPixelRatio, calculatedSize);
      
      // Gentle warp elongation along scroll motion
      pSize *= (1.0 + min(abs(uVelocity) * 0.03, 1.0));
      
      gl_PointSize = clamp(pSize, 2.0 * uPixelRatio, 56.0);
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
      vec2 uv = gl_PointCoord;
      float r = length(uv - vec2(0.5));

      // 1. Hard discard outside circle boundary: ZERO square boxes!
      if (r > 0.5) discard;

      // 2. Exact mathematical Gaussian core + halo falloff
      float core = exp(-r * r * 40.0);
      float halo = exp(-r * 6.0) * 0.35;
      float alpha = clamp(core + halo, 0.0, 1.0);

      vec3 col = vColor;

      // 3. Delicate 4-point diffraction spikes on bright foreground stars
      if (vIsNear > 0.5 && vPointSize > (4.0 * uPixelRatio)) {
        vec2 coord = uv - vec2(0.5);
        float spikeX = max(0.0, 1.0 - abs(coord.y) * 20.0) * max(0.0, 1.0 - abs(coord.x) * 2.2);
        float spikeY = max(0.0, 1.0 - abs(coord.x) * 20.0) * max(0.0, 1.0 - abs(coord.y) * 2.2);
        float spikes = (spikeX + spikeY) * 1.8;
        col += vColor * spikes;
      }

      // 4. Text readability protection (darkens slightly behind text)
      vec2 screenUV = gl_FragCoord.xy / max(uResolution, vec2(1.0));
      vec2 readCoord = (screenUV - vec2(0.5, 0.52)) / vec2(0.45, 0.32);
      float readMask = smoothstep(0.2, 1.0, dot(readCoord, readCoord));
      col *= mix(1.0 - (uReadability * 0.25), 1.0, readMask);

      gl_FragColor = vec4(col * alpha, alpha);
    }
  `
};

// ==========================================================================
// 2. GALAXY SHADER (DIFFERENTIAL ROTATION + DUST LANES + BALANCED GLOW)
// ==========================================================================
export const GalaxyShader = {
  vertexShader: /* glsl */ `
    attribute float aRadius;
    attribute float aAngle;
    attribute vec3 aColor;
    attribute float aSize;
    attribute float aDust;  // Absorption factor (dark dust lanes)
    attribute float aHII;   // Pink star-forming regions

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

      // Differential Rotation: Core rotates slightly faster than outer edges
      float angVel = (1.0 / (aRadius * 0.006 + 1.0)) * uSpeed;
      float currentAngle = aAngle + uTime * angVel;

      vec3 pos = position;
      pos.x = cos(currentAngle) * aRadius;
      pos.z = sin(currentAngle) * aRadius;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      float dist = length(mvPosition.xyz);

      float pSize = aSize * uPixelRatio * (620.0 / max(dist, 1.0));
      gl_PointSize = clamp(pSize, 2.0 * uPixelRatio, 20.0);
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

      // Soft round falloff
      float core = exp(-r * r * 36.0);
      float halo = exp(-r * 6.5) * 0.35;
      float alpha = clamp(core + halo, 0.0, 1.0);

      vec3 col = vColor;

      // Pink HII-region knots
      if (vHII > 0.5) {
        col = mix(col, vec3(1.0, 0.35, 0.6), 0.7);
      }

      // Dark dust lane absorption
      col *= (1.0 - vDust * 0.72);

      gl_FragColor = vec4(col * alpha * 1.25, alpha);
    }
  `
};

// ==========================================================================
// 3. PLANET SHADER (SATURN & EARTH-LIKE FRESNEL ATMOSPHERE)
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

    uniform vec3 uSunPosition;
    uniform float uTime;
    uniform float uIsEarth; // 1.0 = Blue Earth-like, 0.0 = Golden Saturn Gas Giant

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

      vec3 p = vWorldPosition * 0.015;
      float bands = noise(vec3(p.y * 3.5, p.x * 0.2 + uTime * 0.02, p.z * 0.2));
      bands += 0.5 * noise(vec3(p.y * 7.0, p.x * 0.5, p.z * 0.5));

      vec3 planetColor;
      if (uIsEarth > 0.5) {
        // Blue Oceanic & Swirling Cloud Planet
        vec3 ocean = vec3(0.05, 0.22, 0.55);
        vec3 land = vec3(0.12, 0.45, 0.28);
        vec3 clouds = vec3(0.92, 0.95, 1.0);
        float continents = smoothstep(0.42, 0.65, bands);
        planetColor = mix(ocean, land, continents);
        float cloudCover = smoothstep(0.6, 0.85, noise(p * 2.5 + vec3(uTime * 0.01)));
        planetColor = mix(planetColor, clouds, cloudCover * 0.85);
      } else {
        // Saturn Gas Giant (Warm Amber, Cream & Ochre Belts)
        vec3 colA = vec3(0.88, 0.72, 0.52);
        vec3 colB = vec3(0.65, 0.42, 0.25);
        vec3 colC = vec3(0.38, 0.25, 0.16);
        planetColor = mix(colA, colB, smoothstep(0.35, 0.7, bands));
        planetColor = mix(planetColor, colC, smoothstep(0.7, 1.05, bands));
      }

      // Day/Night Terminator Lighting
      float terminator = smoothstep(-0.05, 0.22, dot(normal, lightDir));

      // Atmospheric Fresnel Glow
      float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.0);
      vec3 atmoColor = uIsEarth > 0.5 ? vec3(0.2, 0.65, 1.0) : vec3(0.4, 0.6, 0.9);
      vec3 atmosphere = atmoColor * fresnel * 1.6 * (terminator * 0.8 + 0.2);

      vec3 finalColor = planetColor * (terminator * 0.95 + 0.05) + atmosphere;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// ==========================================================================
// 4. PLANET RING SHADER (Thin Ring with Cassini Gaps)
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

    void main() {
      vec2 coord = vUv - vec2(0.5);
      float r = length(coord) * 2.0;

      if (r < 0.44 || r > 0.96) discard;

      // Cassini Division Gaps
      float density = sin(r * 80.0) * 0.5 + 0.5;
      density *= smoothstep(0.44, 0.5, r) * smoothstep(0.96, 0.88, r);
      if (r > 0.68 && r < 0.74) density *= 0.1; // Major gap

      vec3 ringColor = mix(vec3(0.8, 0.7, 0.55), vec3(0.5, 0.42, 0.32), density);
      gl_FragColor = vec4(ringColor * 1.15, density * 0.72);
    }
  `
};

// ==========================================================================
// 5. ICY COMET SHADER (Luminous Head & Streaming Tail)
// ==========================================================================
export const CometShader = {
  vertexShader: /* glsl */ `
    attribute float aAlpha;
    varying float vAlpha;
    void main() {
      vAlpha = aAlpha;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = clamp(24.0 * (400.0 / -mvPosition.z), 2.0, 32.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying float vAlpha;
    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float r = length(uv);
      if (r > 0.5) discard;
      float glow = exp(-r * r * 28.0);
      vec3 cometCol = mix(vec3(0.2, 0.85, 1.0), vec3(1.0, 1.0, 1.0), glow);
      gl_FragColor = vec4(cometCol * glow, glow * vAlpha * 0.85);
    }
  `
};

// ==========================================================================
// 6. VOLUMETRIC EMISSION NEBULA (LIGHTWEIGHT & SAFE FOR 60FPS)
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

    void main() {
      // Screen space soft ambient nebula wash (featherweight GPU evaluation)
      vec2 p = (vUv - 0.5) * 2.0;
      float d = length(p);
      float clouds = noise(vec3(p * 1.5, uTime * 0.015)) * 0.6 + noise(vec3(p * 3.2, uTime * 0.02)) * 0.4;
      clouds *= smoothstep(1.3, 0.3, d) * uDensity;

      vec3 col = mix(uColorBlue, uColorTeal, smoothstep(0.2, 0.6, clouds));
      col = mix(col, uColorMagenta, smoothstep(0.6, 0.9, clouds));

      // Readability mask (darkens center)
      vec2 readCoord = (vUv - vec2(0.5, 0.52)) / vec2(0.45, 0.32);
      float readMask = smoothstep(0.25, 1.0, dot(readCoord, readCoord));
      col *= mix(1.0 - (uReadability * 0.4), 1.0, readMask);

      gl_FragColor = vec4(col * clouds * uIntensity, clouds * 0.5);
    }
  `
};

// ==========================================================================
// 7. POST-PROCESSING SHADER (4K DITHER, GRAIN & VIGNETTE)
// ==========================================================================
export const PostShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: 0.35 },
    uAberration: { value: 0.0005 },
    uGrain: { value: 0.028 },
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
