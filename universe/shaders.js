/* ==========================================================================
   SHIVAM MISHRA — THE COSMIC HORIZON (GLSL SHADER MODULE)
   Raymarched Volumetric FBM, 3-Tier HDR Stars, Spiral Galaxy & Dither Pass
   ========================================================================== */

// ==========================================================================
// 1. VOLUMETRIC NEBULA SHADER (Raymarched 3D FBM + Beer-Lambert Dust Lanes)
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

    // Hubble Palette Uniforms
    uniform vec3 uColorTeal;
    uniform vec3 uColorBlue;
    uniform vec3 uColorMagenta;
    uniform vec3 uColorGold;

    // 3D Noise Utilities
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

    // 5-Octave Domain-Warped FBM with 3D Rotation between octaves
    const mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * noise(p); p = m * p * 2.02;
      f += 0.2500 * noise(p); p = m * p * 2.03;
      f += 0.1250 * noise(p); p = m * p * 2.01;
      f += 0.0625 * noise(p); p = m * p * 2.04;
      f += 0.0312 * noise(p);
      return f;
    }

    // Domain Warping for Organic Celestial Filaments
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
      d = smoothstep(0.32, 0.88, d); // Sharp cavities and luminous filaments

      // Low-frequency noise for dark interstellar dust absorption lanes
      dustAbsorption = smoothstep(0.4, 0.8, fbm(p * 0.4 + vec3(1.2, 2.3, 4.1)));
      return d * uDensity;
    }

    void main() {
      // Reconstruct view ray from inverse matrices
      vec2 ndc = vUv * 2.0 - 1.0;
      vec4 clip = vec4(ndc, 1.0, 1.0);
      vec4 viewRay = uInvProj * clip;
      vec3 rayDir = normalize((uInvView * vec4(viewRay.xyz, 0.0)).xyz);
      vec3 rayOrigin = uCameraPos;

      // Jitter start with dither hash
      float dither = hash(vec3(gl_FragCoord.xy, uTime));
      int steps = uSteps;
      float stepSize = 120.0 / float(steps);
      vec3 p = rayOrigin + rayDir * (stepSize * dither + 30.0);

      vec3 accumColor = vec3(0.0);
      float transmittance = 1.0;

      for (int i = 0; i < 40; i++) {
        if (i >= steps || transmittance < 0.02) break;

        // Sample volumetric density and dust absorption
        vec3 samplePos = p * 0.0035;
        float dust = 0.0;
        float dens = nebulaDensity(samplePos, dust);

        if (dens > 0.005) {
          // Hubble Palette Color Interpolation
          vec3 col = mix(uColorBlue, uColorTeal, smoothstep(0.1, 0.45, dens));
          col = mix(col, uColorMagenta, smoothstep(0.45, 0.75, dens));
          col = mix(col, uColorGold, smoothstep(0.75, 1.0, dens));

          // Beer-Lambert absorption from dark dust lanes
          float absorption = mix(1.0, 0.15, dust);
          float alpha = dens * 0.18;

          accumColor += col * alpha * transmittance * absorption;
          transmittance *= exp(-alpha * 1.4);
        }

        p += rayDir * stepSize;
      }

      // Screen-space Text Readability Ellipse Mask
      vec2 readCoord = (vUv - vec2(0.5, 0.52)) / vec2(0.45, 0.32);
      float readDist = dot(readCoord, readCoord);
      float readMask = smoothstep(0.3, 1.1, readDist);
      accumColor *= mix(1.0 - (uReadability * 0.55), 1.0, readMask);

      // Clamp peak luminance to prevent washout
      accumColor = min(accumColor * uIntensity, vec3(0.75));

      gl_FragColor = vec4(accumColor, 1.0 - transmittance);
    }
  `
};

// ==========================================================================
// 2. HDR STARS SHADER (Diffraction Spikes, Temperature & Twinkle)
// ==========================================================================
export const StarShader = {
  vertexShader: /* glsl */ `
    attribute float aSize;
    attribute vec3 aColor;
    attribute vec2 aTwinkle; // x: phase, y: speed
    attribute float aIsNear; // 1.0 = near beacon star with spikes

    uniform float uTime;
    uniform float uPixelRatio;

    varying vec3 vColor;
    varying float vIsNear;
    varying float vTwinkle;

    void main() {
      vColor = aColor;
      vIsNear = aIsNear;

      // Realistic twinkle scintillation
      float tw = 0.75 + 0.25 * sin(uTime * aTwinkle.y + aTwinkle.x);
      vTwinkle = tw;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = length(mvPosition.xyz);

      // Size attenuation
      float pSize = aSize * uPixelRatio * (650.0 / dist) * tw;
      gl_PointSize = clamp(pSize, 1.0, 48.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec3 vColor;
    varying float vIsNear;
    varying float vTwinkle;

    uniform vec2 uResolution;
    uniform float uReadability;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);

      if (dist > 0.5) discard;

      // Core circular star glow
      float core = exp(-dist * dist * 32.0);
      vec3 finalColor = vColor * (core * 1.5);

      // 4-Point Diffraction Spikes on Near Beacon Stars
      if (vIsNear > 0.5) {
        float spikeX = max(0.0, 1.0 - abs(coord.y) * 16.0) * max(0.0, 1.0 - abs(coord.x) * 2.2);
        float spikeY = max(0.0, 1.0 - abs(coord.x) * 16.0) * max(0.0, 1.0 - abs(coord.y) * 2.2);
        float spikes = (spikeX + spikeY) * 0.95;
        finalColor += vColor * spikes * 1.8; // HDR boost for bloom pick-up
      }

      // Screen-space readability darkening
      vec2 screenUV = gl_FragCoord.xy / uResolution;
      vec2 readCoord = (screenUV - vec2(0.5, 0.52)) / vec2(0.45, 0.32);
      float readMask = smoothstep(0.2, 1.0, dot(readCoord, readCoord));
      finalColor *= mix(1.0 - (uReadability * 0.25), 1.0, readMask);

      gl_FragColor = vec4(finalColor, core);
    }
  `
};

// ==========================================================================
// 3. SPIRAL GALAXY SHADER (160k Differential Rotation Particles)
// ==========================================================================
export const GalaxyShader = {
  vertexShader: /* glsl */ `
    attribute float aRadius;
    attribute float aAngle;
    attribute vec3 aColor;

    uniform float uTime;
    uniform float uPixelRatio;

    varying vec3 vColor;

    void main() {
      vColor = aColor;

      // Differential Rotation: Angular speed ~ 1 / radius
      float angVel = 0.45 / (aRadius * 0.005 + 1.2);
      float currentAngle = aAngle + uTime * angVel;

      vec3 pos = position;
      pos.x = cos(currentAngle) * aRadius;
      pos.z = sin(currentAngle) * aRadius;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      float dist = length(mvPosition.xyz);

      gl_PointSize = clamp(14.0 * uPixelRatio * (600.0 / dist), 1.0, 18.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec3 vColor;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float d = length(coord);
      if (d > 0.5) discard;

      float intensity = exp(-d * d * 18.0);
      gl_FragColor = vec4(vColor * intensity * 1.4, intensity);
    }
  `
};

// ==========================================================================
// 4. POST-PROCESSING SHADER (Dither, Grain, Vignette & Chromatic Aberration)
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

    // Blue-Noise / Hash Dithering to eliminate 8-bit dark banding
    float dither(vec2 coord) {
      return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec2 distFromCenter = uv - 0.5;

      // Subtle Radial Chromatic Aberration
      vec2 caOffset = distFromCenter * uAberration;
      float r = texture2D(tDiffuse, uv - caOffset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv + caOffset).b;
      vec3 color = vec3(r, g, b);

      // Smooth Luxury Vignette
      float vig = 1.0 - dot(distFromCenter, distFromCenter) * (uVignette * 2.5);
      color *= clamp(vig, 0.0, 1.0);

      // Animated Film Grain
      float grain = (dither(gl_FragCoord.xy + fract(uTime * 17.1)) - 0.5) * uGrain;
      color += grain;

      // High-Frequency Banding Removal Dither
      float bandDither = (dither(gl_FragCoord.xy) - 0.5) / 255.0;
      color += bandDither;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
