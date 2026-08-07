export interface ShaderPreset {
  id: string;
  name: string;
  description: string;
  vertexShader: string;
  fragmentShader: string;
  uniformsDefaults: Record<string, any>;
}

// ─── BASIC FOIL ─────────────────────────────────────────────────────────────
export const BASIC_FOIL_PRESET: ShaderPreset = {
  id: 'basic-foil',
  name: 'Standard Holographic Foil',
  description: 'Holograma Common con barrido diagonal, difracción angular, brillo especular y microdestellos.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 spectralColor(float value) {
      return 0.5 + 0.5 * cos(6.28318 * (value + vec3(0.0, 0.33, 0.67)));
    }

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float facing = max(dot(viewDir, vNormal), 0.0);
      float fresnel = pow(1.0 - facing, 2.2);
      float angle = dot(vUv - 0.5, vec2(0.9, 0.55)) + uTime * 0.055 + fresnel * 0.18;
      float sweep = exp(-pow((fract(angle) - 0.5) * 3.0, 2.0));
      float diffraction = sin(angle * 28.0 - uTime * 0.8) * 0.5 + 0.5;
      vec3 holoColor = spectralColor(angle * 0.72 + uTime * 0.012);

      float crossSweep = sin(dot(vUv - 0.5, vec2(-0.55, 1.0)) * 18.0 - uTime * 0.45) * 0.5 + 0.5;
      crossSweep = pow(crossSweep, 10.0);
      vec2 sparkleGrid = floor(vUv * vec2(42.0, 56.0));
      float sparkle = step(0.985, hash(sparkleGrid));
      sparkle *= pow(max(dot(viewDir, vNormal), 0.0), 4.0);
      float mouseHighlight = exp(-18.0 * distance(vUv, uMousePos * 0.18 + 0.5));

      vec3 finalColor = baseColor.rgb;
      finalColor = mix(finalColor, finalColor * (0.72 + holoColor * 0.58), fresnel * uIntensity);
      finalColor += holoColor * sweep * uIntensity * 0.28;
      finalColor += vec3(0.9, 0.96, 1.0) * diffraction * sweep * uIntensity * 0.12;
      finalColor += vec3(1.0) * (crossSweep * 0.12 + sparkle * 0.42 + mouseHighlight * 0.18) * uIntensity;

      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.65,
    uMousePos: [0, 0],
  },
};

// ─── RARE FOIL ──────────────────────────────────────────────────────────────
export const RARE_FOIL_PRESET: ShaderPreset = {
  id: 'rare-foil',
  name: 'Rare Prism Foil',
  description: 'Holofoil prismático con bandas diagonales, arcoíris angular y destellos sobre el arte.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 prismColor(float value) {
      return 0.5 + 0.5 * cos(6.28318 * (value + vec3(0.0, 0.33, 0.67)));
    }

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float facing = max(dot(viewDir, vNormal), 0.0);
      float fresnel = pow(1.0 - facing, 1.7);

      float diagonal = dot(vUv - 0.5, vec2(0.82, 0.58)) + uTime * 0.11;
      float band = sin(diagonal * 18.0) * 0.5 + 0.5;
      band = pow(band, 3.2);
      float wideSweep = exp(-pow(sin(diagonal * 3.14159) * 2.2, 2.0));
      vec3 prism = prismColor(diagonal * 0.34 + fresnel * 0.22);

      float oppositeBand = sin(dot(vUv - 0.5, vec2(-0.62, 0.94)) * 13.0 - uTime * 0.07) * 0.5 + 0.5;
      oppositeBand = pow(oppositeBand, 5.0);
      vec2 sparkleGrid = floor(vUv * vec2(38.0, 52.0));
      float sparkle = step(0.992, hash(sparkleGrid));
      sparkle *= pow(facing, 3.0) * (0.55 + 0.45 * sin(uTime * 3.0 + hash(sparkleGrid) * 8.0));
      float mouseHighlight = exp(-20.0 * distance(vUv, uMousePos * 0.18 + 0.5));

      vec3 finalColor = baseColor.rgb;
      finalColor = mix(finalColor, finalColor * (0.58 + prism * 0.92), (0.28 + fresnel * 0.72) * uIntensity);
      finalColor += prism * (wideSweep * 0.42 + band * 0.24) * uIntensity;
      finalColor += vec3(1.0) * (oppositeBand * 0.16 + sparkle * 0.6 + mouseHighlight * 0.2) * uIntensity;

      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.8,
    uMousePos: [0, 0],
  },
};

// ─── DOUBLE RARE FOIL ───────────────────────────────────────────────────────
export const DOUBLE_RARE_FOIL_PRESET: ShaderPreset = {
  id: 'double-rare-foil',
  name: 'Double Rare Dynamic Foil',
  description: 'Holofoil de alta intensidad con franjas diagonales amplias, reflejo angular y destellos densos.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 foilColor(float value) {
      return 0.5 + 0.5 * cos(6.28318 * (value + vec3(0.02, 0.35, 0.68)));
    }

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float facing = max(dot(viewDir, vNormal), 0.0);
      float fresnel = pow(1.0 - facing, 1.45);

      float diagonal = dot(vUv - 0.5, vec2(0.78, 0.62)) + uTime * 0.16;
      float broadBand = exp(-pow(sin(diagonal * 3.14159) * 1.45, 2.0));
      float innerBand = pow(sin(diagonal * 22.0) * 0.5 + 0.5, 4.0);
      vec3 foil = foilColor(diagonal * 0.42 + fresnel * 0.3);

      float crossBand = pow(sin(dot(vUv - 0.5, vec2(-0.58, 0.96)) * 16.0 - uTime * 0.1) * 0.5 + 0.5, 6.0);
      float specular = pow(max(dot(vNormal, normalize(viewDir + vec3(-0.35, 0.55, 1.0))), 0.0), 28.0);

      vec2 sparkleGrid = floor(vUv * vec2(52.0, 70.0));
      float randomSpark = hash(sparkleGrid);
      float sparkle = step(0.978, randomSpark) * pow(facing, 2.5);
      sparkle *= 0.65 + 0.35 * sin(uTime * 3.5 + randomSpark * 16.0);
      float mouseHighlight = exp(-18.0 * distance(vUv, uMousePos * 0.18 + 0.5));
      float edgeFacing = 1.0 - abs(vNormal.z);
      float edgeReflection = pow(edgeFacing, 1.35) * (0.35 + 0.65 * facing);
      vec3 edgeColor = foilColor(dot(vNormal.xy, vec2(0.8, 0.6)) + uTime * 0.12);

      vec3 finalColor = baseColor.rgb;
      finalColor = mix(finalColor, finalColor * (0.42 + foil * 1.18), (0.38 + fresnel * 0.62) * uIntensity);
      finalColor += foil * (broadBand * 0.62 + innerBand * 0.26 + crossBand * 0.18) * uIntensity;
      finalColor += vec3(1.0, 0.98, 0.9) * (specular * 0.58 + sparkle * 0.72 + mouseHighlight * 0.22) * uIntensity;
      finalColor += edgeColor * edgeReflection * uIntensity * 0.95;

      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.9,
    uMousePos: [0, 0],
  },
};

// ─── ONE STAR FOIL ───────────────────────────────────────────────────────────
export const ONE_STAR_FOIL_PRESET: ShaderPreset = {
  id: 'star-foil',
  name: 'One Star Galaxy Foil',
  description: 'Marco galáctico nacarado con ondas curvas multicolor, estrellas suaves y borde prismático.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 galaxyColor(float value) {
      return 0.5 + 0.5 * cos(6.28318 * (value + vec3(0.0, 0.31, 0.66)));
    }

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float facing = max(dot(viewDir, vNormal), 0.0);
      float fresnel = pow(1.0 - facing, 1.8);

      vec2 centered = vUv - 0.5;
      float border = smoothstep(0.34, 0.47, max(abs(centered.x), abs(centered.y)));
      float innerBorder = smoothstep(0.27, 0.42, max(abs(centered.x), abs(centered.y)));
      float waveA = sin(vUv.x * 34.0 + sin(vUv.y * 11.0 + uTime * 0.42) * 4.0 - uTime * 0.65) * 0.5 + 0.5;
      float waveB = sin(vUv.y * 29.0 + cos(vUv.x * 14.0 - uTime * 0.35) * 5.0 + uTime * 0.48) * 0.5 + 0.5;
      float waves = pow(waveA * waveB, 1.35);
      vec3 galaxy = galaxyColor(vUv.x * 0.72 + vUv.y * 0.36 + uTime * 0.018 + waves * 0.12);

      vec2 sparkleGrid = floor(vUv * vec2(46.0, 64.0));
      float randomSpark = hash(sparkleGrid);
      float sparkle = step(0.988, randomSpark) * pow(facing, 3.0);
      sparkle *= 0.6 + 0.4 * sin(uTime * 2.8 + randomSpark * 17.0);
      float edgeFacing = 1.0 - abs(vNormal.z);
      float edgeReflection = pow(edgeFacing, 1.25) * (0.35 + 0.65 * facing);
      vec3 edgeColor = galaxyColor(dot(vNormal.xy, vec2(0.75, 0.65)) + uTime * 0.1);
      float mouseHighlight = exp(-20.0 * distance(vUv, uMousePos * 0.18 + 0.5));

      vec3 finalColor = baseColor.rgb;
      finalColor = mix(finalColor, finalColor * (0.88 + galaxy * 0.28), fresnel * uIntensity * 0.55);
      finalColor += galaxy * waves * border * uIntensity * 0.7;
      finalColor += galaxy * innerBorder * border * uIntensity * 0.22;
      finalColor += vec3(1.0) * (sparkle * 0.46 + mouseHighlight * 0.12) * uIntensity;
      finalColor += edgeColor * edgeReflection * uIntensity * 0.85;

      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.82,
    uMousePos: [0, 0],
  },
};

// ─── TWO STAR FOIL ───────────────────────────────────────────────────────────
export const TWO_STAR_FOIL_PRESET: ShaderPreset = {
  id: 'two-star-foil',
  name: 'Two Star Cosmic Foil',
  description: 'Foil cósmico con partículas profundas, estrellas en cruz, rayos prismáticos y borde 3D.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 cosmicColor(float value) {
      return 0.5 + 0.5 * cos(6.28318 * (value + vec3(0.0, 0.28, 0.64)));
    }

    float starBurst(vec2 uv, float seed) {
      vec2 local = fract(uv * (18.0 + seed * 14.0)) - 0.5;
      float vertical = max(0.0, 1.0 - abs(local.x) * 18.0) * max(0.0, 1.0 - abs(local.y) * 3.0);
      float horizontal = max(0.0, 1.0 - abs(local.y) * 18.0) * max(0.0, 1.0 - abs(local.x) * 3.0);
      return pow(max(vertical, horizontal), 2.0) * step(0.94, hash(floor(uv * (18.0 + seed * 14.0))));
    }

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float facing = max(dot(viewDir, vNormal), 0.0);
      float fresnel = pow(1.0 - facing, 1.35);
      vec2 centered = vUv - 0.5;

      float diagonal = dot(centered, vec2(0.76, 0.65));
      float rayA = pow(max(0.0, sin(diagonal * 26.0 - uTime * 0.8)), 8.0);
      float rayB = pow(max(0.0, sin(dot(centered, vec2(-0.62, 0.92)) * 19.0 + uTime * 0.55)), 10.0);
      float vortex = sin(length(centered) * 32.0 - atan(centered.y, centered.x) * 5.0 - uTime * 0.5) * 0.5 + 0.5;
      vec3 cosmic = cosmicColor(diagonal * 0.55 + vortex * 0.18 + fresnel * 0.35 + uTime * 0.02);

      float particleField = step(0.975, hash(floor(vUv * vec2(34.0, 48.0))));
      particleField *= 0.45 + 0.55 * sin(uTime * 2.5 + hash(floor(vUv * vec2(34.0, 48.0))) * 20.0);
      float stars = starBurst(vUv + vec2(uTime * 0.006, -uTime * 0.004), 0.7);
      stars += starBurst(vUv * 1.7 - uTime * 0.008, 1.4) * 0.7;

      float border = smoothstep(0.34, 0.48, max(abs(centered.x), abs(centered.y)));
      float edgeFacing = 1.0 - abs(vNormal.z);
      float edgeReflection = pow(edgeFacing, 1.15) * (0.4 + 0.6 * facing);
      vec3 edgeColor = cosmicColor(dot(vNormal.xy, vec2(0.78, 0.62)) + uTime * 0.14);
      float mouseHighlight = exp(-16.0 * distance(vUv, uMousePos * 0.18 + 0.5));

      vec3 finalColor = baseColor.rgb;
      finalColor = mix(finalColor, finalColor * (0.58 + cosmic * 0.92), (0.34 + fresnel * 0.66) * uIntensity);
      finalColor += cosmic * (rayA * 0.6 + rayB * 0.45 + vortex * 0.16) * uIntensity;
      finalColor += cosmic * border * 0.28 * uIntensity;
      finalColor += vec3(1.0, 0.96, 1.0) * (particleField * 0.48 + stars * 0.95 + mouseHighlight * 0.2) * uIntensity;
      finalColor += edgeColor * edgeReflection * uIntensity * 1.05;

      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.92,
    uMousePos: [0, 0],
  },
};

// ─── RAINBOW HYPER ──────────────────────────────────────────────────────────
export const RAINBOW_HYPER_PRESET: ShaderPreset = {
  id: 'rainbow-hyper',
  name: 'Rainbow Hyper Rare Espectral',
  description: 'Efecto de espectro cromático continuo con destellos de prisma galáctica.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    vec3 rainbow(float t) {
      return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 1.8);

      // Wide rainbow sweep reacting to angle and time
      float angle = dot(vUv - 0.5, vec2(1.0, 0.8)) * 3.0 + uTime * 1.5 + fresnel * 2.0;
      vec3 rainbowColor = rainbow(angle * 0.5);

      // Second layer for depth
      float angle2 = dot(vUv - 0.5, vec2(-0.6, 1.0)) * 4.0 - uTime * 1.0;
      vec3 rainbowColor2 = rainbow(angle2 * 0.4);

      // Prismatic flare spots
      float prismX = sin(vUv.x * 12.0 + uTime * 3.0) * 0.5 + 0.5;
      float prismY = sin(vUv.y * 8.0 - uTime * 2.0) * 0.5 + 0.5;
      float prism = pow(prismX * prismY, 3.0) * 0.5;

      vec3 finalRainbow = mix(rainbowColor, rainbowColor2, 0.5);
      vec3 blend = mix(base.rgb, base.rgb * finalRainbow * 2.0, uIntensity * 0.8);
      blend += finalRainbow * prism * uIntensity;
      blend = mix(blend, base.rgb * finalRainbow * 1.5, fresnel * uIntensity * 0.5);

      gl_FragColor = vec4(blend, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.85,
    uMousePos: [0, 0],
  },
};

// ─── GOLD ULTRA RARE ────────────────────────────────────────────────────────
// Inspired by real Pokemon TCG Gold Ultra Rare cards:
// - Rainbow iridescence that shifts with viewing angle
// - Animated star sparkles (cross-shaped, scattered)
// - Metallic diagonal sweep
// - Fine glitter texture
// - Warm gold base with specular highlight
export const GOLD_RELIC_PRESET: ShaderPreset = {
  id: 'gold-relic',
  name: 'Gold Ultra Rare Metallic',
  description:
    'Carta dorada Ultra Rare con iridiscencia rainbow, chispas animadas en forma de estrella, barrido de luz metálica y textura de glitter.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // ── Hash / noise ────────────────────────────────
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float hash1(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    // ── Star / sparkle shape (cross) ────────────────
    float starShape(vec2 localUv) {
      float d = length(localUv);
      float arm1 = pow(max(0.0, 1.0 - abs(localUv.x) * 10.0), 2.0) *
                   pow(max(0.0, 1.0 - abs(localUv.y) * 2.0), 0.5);
      float arm2 = pow(max(0.0, 1.0 - abs(localUv.y) * 10.0), 2.0) *
                   pow(max(0.0, 1.0 - abs(localUv.x) * 2.0), 0.5);
      float core = max(0.0, 1.0 - d * 6.0);
      return (arm1 + arm2 + core) * smoothstep(0.5, 0.0, d);
    }

    // ── Multi-layer sparkles ────────────────────────
    float sparkles(vec2 uv, float t) {
      float result = 0.0;

      // Layer 1 – coarse grid
      vec2 grid1 = floor(uv * 14.0);
      vec2 local1 = fract(uv * 14.0) - 0.5;
      float h1 = hash(grid1);
      if (h1 > 0.55) {
        float pulse = pow(max(0.0, sin((t * 0.8 + h1 * 6.28318))), 5.0);
        result += starShape(local1) * pulse * (h1 - 0.55) * 5.0;
      }

      // Layer 2 – fine grid offset
      vec2 grid2 = floor((uv + vec2(0.035, 0.071)) * 22.0);
      vec2 local2 = fract((uv + vec2(0.035, 0.071)) * 22.0) - 0.5;
      float h2 = hash(grid2 + vec2(5.3, 9.1));
      if (h2 > 0.6) {
        float pulse2 = pow(max(0.0, sin((t * 1.3 + h2 * 6.28318 + 1.0))), 6.0);
        result += starShape(local2) * pulse2 * (h2 - 0.6) * 3.5;
      }

      // Layer 3 – scattered big stars
      vec2 grid3 = floor((uv + vec2(0.12, 0.19)) * 8.0);
      vec2 local3 = fract((uv + vec2(0.12, 0.19)) * 8.0) - 0.5;
      float h3 = hash(grid3 + vec2(13.7, 4.2));
      if (h3 > 0.72) {
        float pulse3 = pow(max(0.0, sin((t * 0.5 + h3 * 6.28318 + 2.5))), 4.0);
        result += starShape(local3 * 0.7) * pulse3 * (h3 - 0.72) * 8.0;
      }

      return min(result, 1.0);
    }

    // ── Fine glitter (tiny random flecks) ──────────
    float glitter(vec2 uv, float t) {
      vec2 g = floor(uv * 60.0);
      float h = hash(g);
      float flicker = step(0.78, h) * (0.5 + 0.5 * sin(t * (3.0 + h * 4.0) + h * 20.0));
      return flicker * (h - 0.78) * 5.0;
    }

    // ── Rainbow spectrum ────────────────────────────
    vec3 rainbow(float t) {
      return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);

      // View / surface vectors
      vec3 viewDir  = normalize(vViewPosition);
      float NdotV   = max(dot(vNormal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, 2.2);

      // ── 1. Gold base tint ─────────────────────────
      vec3 goldWarm   = vec3(1.0, 0.82, 0.08);
      vec3 goldBright = vec3(1.0, 0.95, 0.45);
      vec3 goldDark   = vec3(0.75, 0.55, 0.02);

      // Tint the card image strongly towards gold
      float lum = dot(base.rgb, vec3(0.299, 0.587, 0.114));
      vec3 goldTinted = mix(goldDark * lum, goldBright * lum, lum) * 1.3;
      vec3 col = mix(base.rgb, goldTinted, 0.65);

      // ── 2. Rainbow iridescence (angle-dependent) ──
      // Changes dramatically as card tilts
      float iridAngle = NdotV + uTime * 0.15 + (uMousePos.x + uMousePos.y) * 0.4;
      vec3 irid = rainbow(iridAngle * 0.6 + vUv.x * 0.2);

      // Stronger at edges and mid-tones
      float iridMask = fresnel * 0.7 + (1.0 - NdotV) * 0.3;
      col = mix(col, col * irid * 1.6, iridMask * uIntensity * 0.75);

      // ── 3. Diagonal gold sweep (animated) ─────────
      float diag = (vUv.x + vUv.y) * 1.5 - uTime * 0.9;
      float sweep = pow(max(0.0, sin(diag * 3.14159) ), 5.0);
      // Second narrower sweep in opposite direction
      float sweep2 = pow(max(0.0, sin((vUv.x - vUv.y) * 2.0 + uTime * 0.6)), 8.0) * 0.5;
      col += (goldBright * (sweep + sweep2)) * uIntensity * 0.35;

      // ── 4. Specular highlight (moving light) ──────
      vec3 lightDir = normalize(vec3(
        sin(uTime * 0.4 + uMousePos.x * 1.5) * 1.5,
        cos(uTime * 0.3) * 1.0 + 1.0,
        2.5
      ));
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec    = pow(max(dot(vNormal, halfDir), 0.0), 48.0);
      col += goldBright * spec * uIntensity * 1.4;

      // ── 5. Fine glitter texture ────────────────────
      float glit = glitter(vUv, uTime);
      col += vec3(1.0, 0.92, 0.5) * glit * uIntensity * 0.6;

      // ── 6. Star sparkles ───────────────────────────
      float sp = sparkles(vUv, uTime);
      // Sparkles are white-gold
      vec3 sparkleColor = mix(vec3(1.0, 0.95, 0.6), vec3(1.0, 1.0, 1.0), sp);
      col += sparkleColor * sp * uIntensity * 1.8;

      // ── 7. Golden edge vignette ────────────────────
      float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
      float edgeGlow = smoothstep(0.12, 0.0, edge) * (0.5 + 0.5 * sin(uTime * 2.5));
      col += goldWarm * edgeGlow * uIntensity * 0.5;

      gl_FragColor = vec4(col, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.9,
    uMousePos: [0, 0],
  },
};

// ─── DIAMOND / GLASS SHATTER ─────────────────────────────────────────────────
export const GLASS_SHATTER_PRESET: ShaderPreset = {
  id: 'glass-shatter',
  name: 'Diamond Shattered Crystal',
  description:
    'Refracción de cristal de diamante con facetas prismáticas y borde de luz que recorre la carta.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 prism(float t) {
      return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
    }

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float NdotV  = max(dot(vNormal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, 2.0);

      // Diamond facet grid
      vec2 grid  = floor(vUv * 12.0);
      float facetH = hash(grid);
      vec2 localUv = fract(vUv * 12.0);

      // Refraction offset per facet
      vec2 refOffset = (vec2(facetH, hash(grid + 0.5)) - 0.5) * 0.018 * uIntensity;
      vec4 base = texture2D(tDiffuse, clamp(vUv + refOffset, 0.0, 1.0));

      // Facet brightness based on angle
      float facetBright = pow(max(0.0, sin(facetH * 6.28318 + uTime * 2.0 + NdotV * 4.0)), 4.0);

      // Prismatic color per facet
      vec3 prismColor = prism(facetH * 1.5 + uTime * 0.3 + NdotV * 0.8);

      // Facet edge lines
      vec2 edge = abs(localUv - 0.5) * 2.0;
      float edgeLine = smoothstep(0.85, 0.95, max(edge.x, edge.y));

      // Sweeping light across facets
      float sweep = sin(vUv.x * 5.0 + vUv.y * 3.0 - uTime * 2.0) * 0.5 + 0.5;
      float sweepMask = pow(sweep, 6.0);

      vec3 col = base.rgb;
      col = mix(col, col * prismColor * 1.8, facetBright * uIntensity * 0.6);
      col += vec3(1.0) * edgeLine * 0.5 * uIntensity;
      col += prismColor * sweepMask * uIntensity * 0.4;
      col = mix(col, prismColor * col, fresnel * uIntensity * 0.5);

      gl_FragColor = vec4(col, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.7,
    uMousePos: [0, 0],
  },
};

// ─── PROMO GLOW ──────────────────────────────────────────────────────────────
export const PROMO_GLOW_PRESET: ShaderPreset = {
  id: 'promo-glow',
  name: 'Promotional Energy Glow',
  description: 'Aura neón pulsante en los bordes con efecto de energía eléctrica.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);

      // Distance to edge
      float distToEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));

      // Pulsing edge glow
      float pulse  = 0.6 + 0.4 * sin(uTime * 3.0);
      float pulse2 = 0.5 + 0.5 * sin(uTime * 1.7 + 1.5);
      float glow   = smoothstep(0.12, 0.0, distToEdge) * pulse;
      float glow2  = smoothstep(0.06, 0.0, distToEdge) * pulse2;

      // Electric arc noise on edge
      float arc = sin(vUv.x * 40.0 + uTime * 8.0) * sin(vUv.y * 30.0 - uTime * 5.0);
      arc = smoothstep(0.5, 1.0, arc) * smoothstep(0.08, 0.0, distToEdge);

      // Neon colors
      vec3 cyanNeon   = vec3(0.1, 0.9, 1.0);
      vec3 magentaNeon = vec3(0.9, 0.1, 1.0);
      vec3 neonColor  = mix(cyanNeon, magentaNeon, 0.5 + 0.5 * sin(uTime * 1.0));

      vec3 glowColor  = neonColor * glow  * uIntensity * 2.5;
      vec3 glowColor2 = vec3(1.0, 1.0, 1.0) * glow2 * uIntensity * 1.5;
      vec3 arcColor   = neonColor * arc * uIntensity * 3.0;

      // Subtle body shimmer
      vec3 bodyShimmer = neonColor * fresnel * uIntensity * 0.3;

      vec3 col = base.rgb + glowColor + glowColor2 + arcColor + bodyShimmer;
      gl_FragColor = vec4(col, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.85,
    uMousePos: [0, 0],
  },
};

// ─── SPECIAL ILLUSTRATION RARE (Galaxy/Cosmos) ───────────────────────────────
export const SPECIAL_ART_PRESET: ShaderPreset = {
  id: 'special-art',
  name: 'Special Illustration Rare Galaxy',
  description:
    'Efecto cosmos profundo con nebulosa animada, estrellas flotantes y gradiente espacial.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // Smooth noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Star field
    float stars(vec2 uv, float t) {
      float result = 0.0;
      for (float i = 0.0; i < 3.0; i++) {
        vec2 g = floor((uv + i * 0.17) * (15.0 + i * 8.0));
        float h = hash(g + i * 3.7);
        if (h > 0.75) {
          vec2 local = fract((uv + i * 0.17) * (15.0 + i * 8.0)) - 0.5;
          float d = length(local);
          float twinkle = 0.5 + 0.5 * sin(t * (2.0 + h * 3.0) + h * 20.0);
          result += twinkle * max(0.0, 1.0 - d * (12.0 + i * 4.0)) * (h - 0.75) * 6.0;
        }
      }
      return min(result, 1.0);
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float NdotV = max(dot(vNormal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, 2.0);

      // Nebula colors
      vec3 nebula1 = vec3(0.4, 0.05, 0.8); // deep purple
      vec3 nebula2 = vec3(0.05, 0.2, 0.9); // deep blue
      vec3 nebula3 = vec3(0.8, 0.1, 0.5);  // magenta

      // Animated nebula flow
      float n1 = noise(vUv * 3.0 + vec2(uTime * 0.07, uTime * 0.05));
      float n2 = noise(vUv * 5.0 - vec2(uTime * 0.05, uTime * 0.08) + 2.0);
      float n3 = noise(vUv * 2.5 + vec2(uTime * 0.04, -uTime * 0.06) + 5.0);

      vec3 nebula = mix(nebula1, nebula2, n1);
      nebula = mix(nebula, nebula3, n2 * 0.5);
      nebula *= (0.6 + n3 * 0.8);

      // Blend with card image
      vec3 col = mix(base.rgb, base.rgb * nebula * 1.8, uIntensity * 0.65);
      col = mix(col, nebula * 1.2, fresnel * uIntensity * 0.4);

      // Star field
      float starVal = stars(vUv, uTime);
      col += vec3(starVal) * uIntensity * 1.5;

      // Cosmic shimmer sweep
      float sweep = sin(vUv.x * 4.0 + vUv.y * 2.5 - uTime * 0.8) * 0.5 + 0.5;
      col += nebula2 * pow(sweep, 8.0) * uIntensity * 0.4;

      gl_FragColor = vec4(col, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.9,
    uMousePos: [0, 0],
  },
};

// ─── TRAINER GALLERY (Silver Artistic) ───────────────────────────────────────
export const TRAINER_GALLERY_PRESET: ShaderPreset = {
  id: 'trainer-gallery',
  name: 'Trainer Gallery Silver Art',
  description: 'Efecto plateado artístico con shimmer suave y brillo perla nacarado.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMousePos;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // Pearl/nacre color shift
    vec3 pearl(float t) {
      return 0.7 + 0.3 * cos(6.28318 * (t + vec3(0.08, 0.18, 0.28)));
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float NdotV  = max(dot(vNormal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, 2.5);

      // Silver base
      float lum = dot(base.rgb, vec3(0.299, 0.587, 0.114));
      vec3 silverColor = vec3(0.78, 0.82, 0.88) * (0.6 + lum * 0.8);

      // Nacreous color shift
      float pearlAngle = NdotV + uTime * 0.12 + vUv.y * 0.5;
      vec3 pearlColor = pearl(pearlAngle * 0.4);

      // Soft horizontal shimmer lines
      float shimmer = sin(vUv.y * 40.0 - uTime * 1.5) * 0.5 + 0.5;
      shimmer = pow(shimmer, 12.0) * 0.4;

      // Specular
      vec3 lightDir = normalize(vec3(sin(uTime * 0.3) * 1.5, 1.5, 2.0));
      vec3 halfDir  = normalize(lightDir + viewDir);
      float spec    = pow(max(dot(vNormal, halfDir), 0.0), 36.0);

      // Random micro-sparkles
      vec2 g = floor(vUv * 50.0);
      float h = hash(g);
      float microSpark = step(0.87, h) * (0.4 + 0.6 * sin(uTime * (3.0 + h * 4.0) + h * 15.0));

      vec3 col = mix(base.rgb, base.rgb * silverColor, uIntensity * 0.5);
      col = mix(col, col * pearlColor * 1.4, fresnel * uIntensity * 0.6);
      col += silverColor * shimmer * uIntensity;
      col += vec3(1.0) * spec * uIntensity * 0.9;
      col += vec3(0.9, 0.95, 1.0) * microSpark * uIntensity * 0.5;

      gl_FragColor = vec4(col, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.75,
    uMousePos: [0, 0],
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────
export const ALL_PRESETS: ShaderPreset[] = [
  BASIC_FOIL_PRESET,
  RARE_FOIL_PRESET,
  DOUBLE_RARE_FOIL_PRESET,
  ONE_STAR_FOIL_PRESET,
  TWO_STAR_FOIL_PRESET,
  RAINBOW_HYPER_PRESET,
  GOLD_RELIC_PRESET,
  GLASS_SHATTER_PRESET,
  PROMO_GLOW_PRESET,
  SPECIAL_ART_PRESET,
  TRAINER_GALLERY_PRESET,
];

export function getPresetById(id: string): ShaderPreset {
  return ALL_PRESETS.find((p) => p.id === id) || BASIC_FOIL_PRESET;
}

export function createShaderUniforms(presetId: string, customUniforms?: Record<string, any>) {
  const preset = getPresetById(presetId);
  return {
    ...preset.uniformsDefaults,
    ...customUniforms,
  };
}
