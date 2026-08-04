export interface ShaderPreset {
  id: string;
  name: string;
  description: string;
  vertexShader: string;
  fragmentShader: string;
  uniformsDefaults: Record<string, any>;
}

export const BASIC_FOIL_PRESET: ShaderPreset = {
  id: 'basic-foil',
  name: 'Standard Holographic Foil',
  description: 'Holograma lineal clásico con difracción reactiva al ángulo de visión.',
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
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
      
      vec3 holoColor = 0.5 + 0.5 * cos(uTime * 1.5 + vUv.xyx * 3.0 + vec3(0.0, 2.0, 4.0));
      vec3 finalColor = mix(baseColor.rgb, holoColor, fresnel * uIntensity);
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.65
  }
};

export const RAINBOW_HYPER_PRESET: ShaderPreset = {
  id: 'rainbow-hyper',
  name: 'Rainbow Hyper Rare Espectral',
  description: 'Efecto de espectro cromático continuo con interferencia galáctica.',
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;

    vec3 rainbow(float t) {
      return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      float angle = dot(vUv, vec2(1.0, 1.0)) * 4.0 + uTime * 2.0;
      vec3 rainbowColor = rainbow(angle);
      
      vec3 blend = mix(base.rgb, base.rgb * rainbowColor * 1.8, uIntensity);
      gl_FragColor = vec4(blend, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.8
  }
};

export const GOLD_RELIC_PRESET: ShaderPreset = {
  id: 'gold-relic',
  name: 'Gold Metallic Specular',
  description: 'Lámina dorada brillante con resplandor especular metálico.',
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
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
      vec3 halfDir = normalize(lightDir + viewDir);
      
      float spec = pow(max(dot(vNormal, halfDir), 0.0), 16.0);
      vec3 gold = vec3(1.0, 0.84, 0.0);
      
      vec3 finalGold = mix(base.rgb, gold * (base.rgb + spec * 2.0), uIntensity);
      gl_FragColor = vec4(finalGold, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.75
  }
};

export const GLASS_SHATTER_PRESET: ShaderPreset = {
  id: 'glass-shatter',
  name: 'Diamond Shattered Glass',
  description: 'Refracción de cristal fragmentado en forma de facetas de diamante.',
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;

    void main() {
      vec2 grid = floor(vUv * 15.0);
      float facet = sin(grid.x * 12.9898 + grid.y * 78.233 + uTime) * 43758.5453;
      facet = fract(facet);
      
      vec4 base = texture2D(tDiffuse, vUv + vec2(facet * 0.01 * uIntensity));
      vec3 highlight = vec3(facet * uIntensity);
      
      gl_FragColor = vec4(base.rgb + highlight * 0.4, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.5
  }
};

export const PROMO_GLOW_PRESET: ShaderPreset = {
  id: 'promo-glow',
  name: 'Promotional Edge Glow',
  description: 'Aura neón brillante pulsante en los bordes de la carta.',
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      float distToEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
      float glow = smoothstep(0.08, 0.0, distToEdge) * (0.6 + 0.4 * sin(uTime * 3.0));
      
      vec3 glowColor = vec3(0.2, 0.8, 1.0) * glow * uIntensity * 2.0;
      gl_FragColor = vec4(base.rgb + glowColor, base.a);
    }
  `,
  uniformsDefaults: {
    uTime: 0,
    uIntensity: 0.7
  }
};

export const ALL_PRESETS: ShaderPreset[] = [
  BASIC_FOIL_PRESET,
  RAINBOW_HYPER_PRESET,
  GOLD_RELIC_PRESET,
  GLASS_SHATTER_PRESET,
  PROMO_GLOW_PRESET,
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
