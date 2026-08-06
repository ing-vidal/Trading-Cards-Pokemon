'use client';

/**
 * GoldCard3DCanvas — Premium Gold Rarity Renderer
 *
 * Rendering pipeline (9 layers):
 *   L1 – Base artwork (unmodified)
 *   L2 – Gold PBR foil  (MeshPhysicalMaterial: metalness, roughness, clearcoat, IOR)
 *   L3 – Animated view-dependent golden reflections
 *   L4 – Gaussian specular band travelling diagonally
 *   L5 – Procedural microscopic glitter (angle-gated)
 *   L6 – Premium 4-pt / 6-pt sparkle stars (threshold-gated, smooth fade)
 *   L7 – Soft Fresnel rim (no white clipping)
 *   L8 – Thin-film rainbow diffraction (<10 %)
 *   L9 – Warm bloom via UnrealBloomPass (ACES tone-mapped)
 *
 * All effects react to card ROTATION, not looping time.
 * Camera-dependent uniforms are updated every frame.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// ─── Parameter Definitions ───────────────────────────────────────────────────
export interface GoldParams {
  goldIntensity: number;      // 0–2      overall gold tint strength
  reflectionStr: number;      // 0–3      env map intensity
  specularWidth: number;      // 0.05–0.8 gaussian band half-width
  sparkleDensity: number;     // 0–1
  sparkleSize: number;        // 0.3–2
  glitterDensity: number;     // 0–1
  glowIntensity: number;      // 0–2      bloom strength
  rainbowIntensity: number;   // 0–0.1    keep gold dominant
  fresnelPower: number;       // 1–8
  foilRoughness: number;      // 0.05–0.5
  metalness: number;          // 0.5–1
  clearcoat: number;          // 0–1
  animSpeed: number;          // 0.1–3    how quickly rotation drives effects
  bloomThreshold: number;     // 0–1
  parallaxDepth: number;      // 0–0.05
}

const DEFAULT_PARAMS: GoldParams = {
  goldIntensity:   1.1,
  reflectionStr:   1.8,
  specularWidth:   0.22,
  sparkleDensity:  0.72,
  sparkleSize:     1.0,
  glitterDensity:  0.68,
  glowIntensity:   0.55,
  rainbowIntensity:0.07,
  fresnelPower:    3.5,
  foilRoughness:   0.18,
  metalness:       0.85,
  clearcoat:       1.0,
  animSpeed:       1.0,
  bloomThreshold:  0.55,
  parallaxDepth:   0.025,
};

// ─── GLSL Shaders ────────────────────────────────────────────────────────────
const OVERLAY_VERT = /* glsl */`
  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  varying vec3  vWorldNormal;
  varying vec3  vWorldPos;

  void main() {
    vUv          = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos    = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

    vec4 mvPos  = viewMatrix * worldPos;
    vViewDir    = normalize(-mvPos.xyz);
    vNormal     = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * mvPos;
  }
`;

const OVERLAY_FRAG = /* glsl */`
  precision highp float;

  // ── Uniforms ──────────────────────────────────────────────────────────────
  uniform sampler2D tDiffuse;
  uniform vec3  uCameraPos;
  uniform vec3  uCameraDir;   // normalized world-space direction cam→card
  uniform float uTiltX;       // card tilt around X  (-1 … +1)
  uniform float uTiltY;       // card tilt around Y  (-1 … +1)

  // visual parameters
  uniform float uGoldIntensity;
  uniform float uReflectionStr;
  uniform float uSpecWidth;
  uniform float uSparkleDensity;
  uniform float uSparkleSize;
  uniform float uGlitterDensity;
  uniform float uGlowIntensity;
  uniform float uRainbowIntensity;
  uniform float uFresnelPower;
  uniform float uFoilRoughness;
  uniform float uMetalness;
  uniform float uClearcoat;
  uniform float uAnimSpeed;
  uniform float uBloomThreshold;
  uniform float uParallaxDepth;

  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  varying vec3  vWorldNormal;
  varying vec3  vWorldPos;

  // ── Hash / noise ──────────────────────────────────────────────────────────
  float hash11(float n){ return fract(sin(n) * 43758.5453123); }
  float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  vec2  hash22(vec2 p){
    p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
    return fract(sin(p) * 43758.5453123);
  }

  // ── Smooth value noise ────────────────────────────────────────────────────
  float vnoise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(hash21(i+vec2(0,0)), hash21(i+vec2(1,0)), f.x),
      mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x),
      f.y);
  }

  // ── Gold palette (warm) ───────────────────────────────────────────────────
  vec3 goldColor(float t){
    // t=0 → dark gold,  t=1 → bright champagne
    return mix(vec3(0.72,0.50,0.04), vec3(1.00,0.92,0.52), clamp(t,0.0,1.0));
  }

  // ── Rainbow spectrum ──────────────────────────────────────────────────────
  vec3 rainbow(float t){
    return 0.5 + 0.5*cos(6.28318*(t + vec3(0.0,0.333,0.667)));
  }

  // ── Layer 4: Diagonal specular band with Gaussian falloff ─────────────────
  float specularBand(vec2 uv, float tiltX, float tiltY, float width){
    // Band position driven entirely by tilt
    float diagPos  = (uv.x - uv.y) * 0.5 + 0.5;  // 0..1 along diagonal
    float bandCenter = 0.5 + tiltY * 0.45 * uAnimSpeed;
    float d = diagPos - bandCenter;
    return exp(-d*d / (2.0*width*width));
  }

  // ── Layer 5: Glitter – microscopic angle-gated flecks ────────────────────
  float glitter(vec2 uv, vec3 viewDir, vec3 normal, float density){
    // Coarse glitter grid
    float result = 0.0;
    vec2 grid = floor(uv * 80.0);
    float h   = hash21(grid);
    if(h > (1.0 - density * 0.35)){
      vec2 local = fract(uv * 80.0) - 0.5;
      // Fleck normal: random tilt
      vec2  rn    = hash22(grid) * 2.0 - 1.0;
      vec3  fn    = normalize(vec3(rn * 0.6, 1.0));
      float vis   = max(0.0, dot(fn, viewDir));  // angle gating
      vis         = pow(vis, 6.0);
      float spot  = max(0.0, 1.0 - length(local) * 9.0);
      result += spot * vis * (h - (1.0-density*0.35)) / (density*0.35 + 0.001);
    }

    // Fine glitter layer
    vec2 grid2 = floor(uv * 140.0 + vec2(0.37,0.83));
    float h2   = hash21(grid2 + 7.3);
    if(h2 > (1.0 - density * 0.25)){
      vec2 local2  = fract(uv * 140.0 + vec2(0.37,0.83)) - 0.5;
      vec2  rn2    = hash22(grid2+3.1) * 2.0 - 1.0;
      vec3  fn2    = normalize(vec3(rn2 * 0.5, 1.0));
      float vis2   = pow(max(0.0, dot(fn2, viewDir)), 8.0);
      float spot2  = max(0.0, 1.0 - length(local2) * 14.0);
      result += spot2 * vis2 * 0.6;
    }
    return min(result, 1.0);
  }

  // ── Layer 6: Premium star sparkles ───────────────────────────────────────
  // Generates 4-point and 6-point star glints.
  // Only spawns when reflection intensity (viewBrightness) exceeds threshold.
  vec4 sparkleStars(vec2 uv, vec3 viewDir, float density, float size, float threshold){
    vec4 result = vec4(0.0);
    float viewBrightness = pow(max(dot(viewDir, vec3(0.0,0.0,1.0)), 0.0), 2.0);
    if(viewBrightness < threshold * 0.5) return result;

    float scale = 12.0 * (2.0 - density);

    for(float layer = 0.0; layer < 3.0; layer++){
      vec2 offset = hash22(vec2(layer, 7.3)) * 0.5;
      vec2 g      = floor((uv + offset) * scale);
      float h     = hash21(g + layer * 3.7);
      if(h < density * 0.6) continue;

      vec2  local = fract((uv + offset) * scale) - 0.5;
      // Angle-dependent visibility (gate on view brightness)
      float spawnH = hash21(g + layer + vec2(1.2, 4.5));
      float vis    = viewBrightness;
      float fade   = smoothstep(0.0, 0.15, vis - threshold * 0.5);
      if(fade < 0.01) continue;

      float sz = size * (0.5 + h * 0.5) * 0.06;
      vec2  l2 = local / sz;

      // 4-point star arms
      float arm4  = pow(max(0.0, 1.0 - abs(l2.x)) * max(0.0, 1.0 - abs(l2.y) * 8.0), 1.5)
                  + pow(max(0.0, 1.0 - abs(l2.y)) * max(0.0, 1.0 - abs(l2.x) * 8.0), 1.5);
      // 6-point diagonal arms (only for h > 0.7)
      float arm6 = 0.0;
      if(h > 0.7){
        vec2 rot45 = vec2(l2.x+l2.y, l2.x-l2.y) * 0.707;
        arm6 = pow(max(0.0, 1.0 - abs(rot45.x)) * max(0.0, 1.0 - abs(rot45.y)*10.0), 1.5)
             + pow(max(0.0, 1.0 - abs(rot45.y)) * max(0.0, 1.0 - abs(rot45.x)*10.0), 1.5);
        arm6 *= 0.6;
      }
      float core = max(0.0, 1.0 - length(l2) * 3.0);
      float star  = clamp((arm4 + arm6) * 0.5 + core, 0.0, 1.0);
      star *= fade * (h - (1.0 - density * 0.6)) / (density * 0.6 + 0.001);

      // Sparkle color: white-gold
      vec3 sc = mix(vec3(1.0,0.95,0.6), vec3(1.0,1.0,1.0), core);
      result += vec4(sc * star, star);
    }
    return clamp(result, 0.0, 1.0);
  }

  // ── Layer 7: Fresnel rim ──────────────────────────────────────────────────
  float fresnelRim(vec3 normal, vec3 viewDir, float power){
    float NdotV = max(dot(normal, viewDir), 0.0);
    return pow(1.0 - NdotV, power);
  }

  // ── Layer 8: Thin-film rainbow diffraction ────────────────────────────────
  // Only inside strong reflections; intensity capped below 10 %.
  vec3 thinFilm(vec2 uv, vec3 normal, vec3 viewDir, float intensity){
    float NdotV   = max(dot(normal, viewDir), 0.0);
    // Only inside mid-to-high reflections
    float mask    = smoothstep(0.4, 0.8, NdotV);
    // Thin-film OPD based on angle + UV position
    float opd     = NdotV * 3.0 + vnoise(uv * 6.0 + vec2(uTiltX, uTiltY)) * 1.5;
    vec3  film    = rainbow(opd * 0.3);
    return film * mask * intensity;
  }

  // ── Layer 3: View-dependent golden reflections ────────────────────────────
  vec3 goldReflection(vec3 normal, vec3 viewDir, float tiltX, float tiltY, float strength){
    // Fake "environment" with warm gold highlights at multiple angles
    vec3  reflDir = reflect(-viewDir, normal);
    float upRefl  = max(0.0, reflDir.y);
    float sideL   = max(0.0, -reflDir.x);
    float sideR   = max(0.0,  reflDir.x);

    // Gold environment tones
    vec3 sky     = vec3(1.0, 0.88, 0.4) * pow(upRefl, 2.0);
    vec3 rimL    = vec3(1.0, 0.70, 0.1) * pow(sideL,  3.0);
    vec3 rimR    = vec3(1.0, 0.80, 0.2) * pow(sideR,  3.0);

    // Tilt-reactive shimmer
    float shimmer = vnoise(vec2(tiltX, tiltY) * 3.0 + normal.xy);
    vec3  warmShim = goldColor(shimmer) * pow(shimmer, 2.0) * 0.6;

    return (sky + rimL + rimR + warmShim) * strength;
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  void main(){
    // Parallax UV offset (background slower, foil above artwork)
    vec2 parallaxOff = vec2(uTiltY, -uTiltX) * uParallaxDepth;
    vec2 uvArt   = vUv + parallaxOff * 0.5;      // artwork mid-depth
    vec2 uvFoil  = vUv + parallaxOff * 1.0;      // foil top-layer

    // L1 – Base artwork
    vec4 artwork = texture2D(tDiffuse, uvArt);

    // ── Compute view direction in view space ─────────────────────────────
    vec3 N      = normalize(vNormal);
    vec3 V      = normalize(vViewDir);
    float NdotV = max(dot(N, V), 0.0);

    // ── L2 – Gold foil tint on artwork ───────────────────────────────────
    float lum      = dot(artwork.rgb, vec3(0.299,0.587,0.114));
    vec3  goldTint = mix(goldColor(lum * 0.6), goldColor(lum * 1.2 + 0.1), lum);
    vec3  foiled   = mix(artwork.rgb, artwork.rgb * goldTint * 1.3, uGoldIntensity * uMetalness * 0.6);

    // ── L3 – View-dependent gold reflections ─────────────────────────────
    vec3  goldRefl = goldReflection(N, V, uTiltX, uTiltY, uReflectionStr * 0.3);
    foiled += goldRefl * NdotV * uMetalness;

    // ── L4 – Diagonal specular band ──────────────────────────────────────
    float spec  = specularBand(uvFoil, uTiltX, uTiltY, uSpecWidth);
    float specH = pow(spec, 3.0);
    vec3  specC = goldColor(0.8 + specH * 0.2) * specH * uClearcoat * 1.4;
    foiled += specC;

    // ── L5 – Glitter ─────────────────────────────────────────────────────
    float glit = glitter(uvFoil, V, N, uGlitterDensity);
    foiled += goldColor(0.9) * glit * uGlitterDensity * 0.8;

    // ── L7 – Fresnel rim ─────────────────────────────────────────────────
    float fres = fresnelRim(N, V, uFresnelPower);
    float fresC = fres * uClearcoat * 0.5;
    // Warm gold rim, never white-clip (max component < 1.0)
    vec3  rimColor = goldColor(0.75 + fres * 0.25) * fresC;
    foiled += rimColor;

    // ── L8 – Rainbow diffraction ──────────────────────────────────────────
    vec3 film = thinFilm(uvFoil, N, V, uRainbowIntensity);
    foiled += film;

    // Soft luminance clamp (avoid overexposing artwork)
    float lumFinal = dot(foiled, vec3(0.299,0.587,0.114));
    if(lumFinal > 1.4) foiled *= 1.4 / lumFinal;

    // ── L6 – Sparkle stars (top layer, additive) ──────────────────────────
    vec4 sparks = sparkleStars(uvFoil, V, uSparkleDensity, uSparkleSize, uBloomThreshold);

    // Final composite
    vec3 finalColor = foiled + sparks.rgb * sparks.a * 1.6;

    gl_FragColor = vec4(finalColor, artwork.a);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────
export interface GoldCard3DCanvasProps {
  imageUrl?: string;
  intensity?: number;
  width?: string;
  height?: string;
  showEditor?: boolean;
}

export function GoldCard3DCanvas({
  imageUrl,
  intensity = 0.9,
  width = '100%',
  height = '520px',
  showEditor = false,
}: GoldCard3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef<GoldParams>({ ...DEFAULT_PARAMS, goldIntensity: intensity * DEFAULT_PARAMS.goldIntensity });
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const physMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);

  // UI state for editor
  const [editorOpen, setEditorOpen] = useState(showEditor);
  const [params, setParams] = useState<GoldParams>({ ...DEFAULT_PARAMS });

  // Update shader uniforms when params change
  const updateUniforms = useCallback((p: GoldParams) => {
    const m = materialRef.current;
    if (!m) return;
    m.uniforms.uGoldIntensity.value   = p.goldIntensity;
    m.uniforms.uReflectionStr.value   = p.reflectionStr;
    m.uniforms.uSpecWidth.value       = p.specularWidth;
    m.uniforms.uSparkleDensity.value  = p.sparkleDensity;
    m.uniforms.uSparkleSize.value     = p.sparkleSize;
    m.uniforms.uGlitterDensity.value  = p.glitterDensity;
    m.uniforms.uGlowIntensity.value   = p.glowIntensity;
    m.uniforms.uRainbowIntensity.value= p.rainbowIntensity;
    m.uniforms.uFresnelPower.value    = p.fresnelPower;
    m.uniforms.uFoilRoughness.value   = p.foilRoughness;
    m.uniforms.uMetalness.value       = p.metalness;
    m.uniforms.uClearcoat.value       = p.clearcoat;
    m.uniforms.uAnimSpeed.value       = p.animSpeed;
    m.uniforms.uBloomThreshold.value  = p.bloomThreshold;
    m.uniforms.uParallaxDepth.value   = p.parallaxDepth;

    const phys = physMatRef.current;
    if (phys) {
      phys.metalness          = p.metalness;
      phys.roughness          = p.foilRoughness;
      phys.clearcoat          = p.clearcoat;
      phys.clearcoatRoughness = 0.04;
      phys.envMapIntensity    = p.reflectionStr;
    }
    const composer = composerRef.current;
    if (composer) {
      const bloom = composer.passes[1] as UnrealBloomPass;
      if (bloom) {
        bloom.strength  = p.glowIntensity;
        bloom.threshold = p.bloomThreshold;
      }
    }
  }, []);

  const setParam = useCallback(<K extends keyof GoldParams>(key: K, val: GoldParams[K]) => {
    setParams(prev => {
      const next = { ...prev, [key]: val };
      paramsRef.current = next;
      updateUniforms(next);
      return next;
    });
  }, [updateUniforms]);

  // ── Three.js Scene Setup ──────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth  || 400;
    const h = container.clientHeight || 520;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure= 1.0;

    container.appendChild(renderer.domElement);

    // ── Scene & Camera ───────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // ── Environment map (procedural warm-gold) ───────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1a0f00);
    // Warm lights baked into env
    const envA = new THREE.AmbientLight(0xffd060, 1.5);
    envScene.add(envA);
    const envD = new THREE.DirectionalLight(0xffe080, 2.0);
    envD.position.set(2, 4, 3);
    envScene.add(envD);
    const envFill = new THREE.DirectionalLight(0xff9020, 0.8);
    envFill.position.set(-3, -2, -1);
    envScene.add(envFill);
    const envTex = pmrem.fromScene(envScene as any).texture;
    scene.environment = envTex;
    pmrem.dispose();

    // ── Scene Lights ─────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffecc0, 0.6);
    scene.add(ambient);

    // Key light (warm gold)
    const keyLight = new THREE.DirectionalLight(0xffd060, 2.2);
    keyLight.position.set(3, 5, 5);
    scene.add(keyLight);

    // Fill light (cool contrast)
    const fillLight = new THREE.DirectionalLight(0x80aaff, 0.5);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    // Back rim
    const backRim = new THREE.DirectionalLight(0xffaa20, 0.8);
    backRim.position.set(0, -3, -4);
    scene.add(backRim);

    // ── Card Geometry (Rounded Box ~2 mm thick) ───────────────────────────────
    const CARD_W = 2.5, CARD_H = 3.5, CARD_D = 0.04;
    let cardGeo: THREE.BufferGeometry;
    try {
      cardGeo = new RoundedBoxGeometry(CARD_W, CARD_H, CARD_D, 4, 0.06);
    } catch {
      cardGeo = new THREE.BoxGeometry(CARD_W, CARD_H, CARD_D);
    }

    // ── Texture load ─────────────────────────────────────────────────────────
    const loader      = new THREE.TextureLoader();
    const blankTex    = new THREE.Texture();
    let   artworkTex  = blankTex;

    const loadTex = (url: string) => {
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        artworkTex = tex;
        if (physMatRef.current) {
          physMatRef.current.map = tex;
          physMatRef.current.needsUpdate = true;
        }
        if (materialRef.current) {
          materialRef.current.uniforms.tDiffuse.value = tex;
          materialRef.current.needsUpdate = true;
        }
      });
    };
    if (imageUrl) loadTex(imageUrl);

    // ── L2: Base PBR physical material (gold foil) ───────────────────────────
    const p = paramsRef.current;
    const physMat = new THREE.MeshPhysicalMaterial({
      map:                artworkTex,
      metalness:          p.metalness,
      roughness:          p.foilRoughness,
      clearcoat:          p.clearcoat,
      clearcoatRoughness: 0.04,
      ior:                1.52,
      envMap:             envTex,
      envMapIntensity:    p.reflectionStr,
      color:              new THREE.Color(1.0, 0.92, 0.55),
      side:               THREE.FrontSide,
    });
    physMatRef.current = physMat;

    const cardMesh = new THREE.Mesh(cardGeo, physMat);
    scene.add(cardMesh);

    // ── L3–L8: Overlay shader mesh (sits just in front of card face) ─────────
    const overlayGeo = new THREE.PlaneGeometry(CARD_W, CARD_H, 1, 1);
    const overlayMat = new THREE.ShaderMaterial({
      vertexShader:   OVERLAY_VERT,
      fragmentShader: OVERLAY_FRAG,
      uniforms: {
        tDiffuse:           { value: artworkTex },
        uCameraPos:         { value: new THREE.Vector3() },
        uCameraDir:         { value: new THREE.Vector3(0,0,1) },
        uTiltX:             { value: 0 },
        uTiltY:             { value: 0 },
        uGoldIntensity:     { value: p.goldIntensity },
        uReflectionStr:     { value: p.reflectionStr },
        uSpecWidth:         { value: p.specularWidth },
        uSparkleDensity:    { value: p.sparkleDensity },
        uSparkleSize:       { value: p.sparkleSize },
        uGlitterDensity:    { value: p.glitterDensity },
        uGlowIntensity:     { value: p.glowIntensity },
        uRainbowIntensity:  { value: p.rainbowIntensity },
        uFresnelPower:      { value: p.fresnelPower },
        uFoilRoughness:     { value: p.foilRoughness },
        uMetalness:         { value: p.metalness },
        uClearcoat:         { value: p.clearcoat },
        uAnimSpeed:         { value: p.animSpeed },
        uBloomThreshold:    { value: p.bloomThreshold },
        uParallaxDepth:     { value: p.parallaxDepth },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });
    materialRef.current = overlayMat;
    const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat);
    overlayMesh.position.z = CARD_D / 2 + 0.002;
    scene.add(overlayMesh);

    // ── Post-processing: Warm Bloom (L9) ─────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      p.glowIntensity,   // strength
      0.35,              // radius
      p.bloomThreshold,  // threshold
    );
    composer.addPass(bloom);
    composerRef.current = composer;

    // ── Controls ──────────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom   = false;
    controls.enablePan    = false;
    controls.maxPolarAngle= Math.PI / 1.6;
    controls.minPolarAngle= Math.PI / 2.8;
    controls.rotateSpeed  = 0.6;
    controls.enableDamping= true;
    controls.dampingFactor= 0.08;

    // ── Pointer tilt ──────────────────────────────────────────────────────────
    let targetRX = 0, targetRY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      const x = ((e.clientX - r.left)  / r.width ) * 2 - 1;
      const y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      targetRY = x * 0.55;
      targetRX = -y * 0.35;
    };
    const onMouseLeave = () => { targetRX = 0; targetRY = 0; };
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // ── Animation Loop ────────────────────────────────────────────────────────
    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();

      // Smooth card tilt
      cardMesh.rotation.x   = THREE.MathUtils.lerp(cardMesh.rotation.x, targetRX, 0.08);
      cardMesh.rotation.y   = THREE.MathUtils.lerp(cardMesh.rotation.y, targetRY, 0.08);
      overlayMesh.rotation.x = cardMesh.rotation.x;
      overlayMesh.rotation.y = cardMesh.rotation.y;

      // Update camera-dependent uniforms every frame (rotation-driven, not time-driven)
      const tiltX = cardMesh.rotation.x / 0.35;
      const tiltY = cardMesh.rotation.y / 0.55;
      overlayMat.uniforms.uTiltX.value = tiltX;
      overlayMat.uniforms.uTiltY.value = tiltY;
      overlayMat.uniforms.uCameraPos.value.copy(camera.position);
      overlayMat.uniforms.uCameraDir.value
        .copy(cardMesh.position).sub(camera.position).normalize();

      composer.render();
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth, nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      controls.dispose();
      cardGeo.dispose();
      overlayGeo.dispose();
      physMat.dispose();
      overlayMat.dispose();
      renderer.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update texture if imageUrl changes after mount
  useEffect(() => {
    if (!imageUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (materialRef.current) {
        materialRef.current.uniforms.tDiffuse.value = tex;
        materialRef.current.needsUpdate = true;
      }
      if (physMatRef.current) {
        physMatRef.current.map = tex;
        physMatRef.current.needsUpdate = true;
      }
    });
  }, [imageUrl]);

  // ─── Parameter Editor Panel ───────────────────────────────────────────────
  const sliders: Array<{ key: keyof GoldParams; label: string; min: number; max: number; step: number }> = [
    { key: 'goldIntensity',    label: '🥇 Gold Intensity',      min: 0,    max: 2,    step: 0.01 },
    { key: 'reflectionStr',    label: '💡 Reflection Strength',  min: 0,    max: 3,    step: 0.05 },
    { key: 'specularWidth',    label: '✦ Specular Width',        min: 0.05, max: 0.8,  step: 0.01 },
    { key: 'sparkleDensity',   label: '⭐ Sparkle Density',      min: 0,    max: 1,    step: 0.01 },
    { key: 'sparkleSize',      label: '⭐ Sparkle Size',         min: 0.3,  max: 2,    step: 0.05 },
    { key: 'glitterDensity',   label: '✨ Glitter Density',      min: 0,    max: 1,    step: 0.01 },
    { key: 'glowIntensity',    label: '🌟 Glow (Bloom)',         min: 0,    max: 2,    step: 0.05 },
    { key: 'rainbowIntensity', label: '🌈 Rainbow (<10%)',       min: 0,    max: 0.1,  step: 0.005 },
    { key: 'fresnelPower',     label: '🔆 Fresnel Power',        min: 1,    max: 8,    step: 0.1 },
    { key: 'foilRoughness',    label: '🪙 Foil Roughness',       min: 0.05, max: 0.5,  step: 0.01 },
    { key: 'metalness',        label: '⚙️ Metalness',            min: 0.5,  max: 1,    step: 0.01 },
    { key: 'clearcoat',        label: '🔆 Clearcoat',            min: 0,    max: 1,    step: 0.01 },
    { key: 'bloomThreshold',   label: '☀️ Bloom Threshold',      min: 0,    max: 1,    step: 0.01 },
    { key: 'parallaxDepth',    label: '🌀 Parallax Depth',       min: 0,    max: 0.05, step: 0.001 },
    { key: 'animSpeed',        label: '⚡ Anim Speed',           min: 0.1,  max: 3,    step: 0.05 },
  ];

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#0a0800',
          cursor: 'grab',
        }}
      />

      {/* Editor toggle button */}
      <button
        onClick={() => setEditorOpen(o => !o)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid #ffd06080',
          color: '#ffd060',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '0.7rem',
          fontWeight: 700,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }}
      >
        {editorOpen ? '✕ CLOSE' : '⚙️ EDITOR'}
      </button>

      {/* Parameter editor panel */}
      {editorOpen && (
        <div style={{
          position: 'absolute',
          top: '36px',
          right: '8px',
          width: '230px',
          maxHeight: 'calc(100% - 48px)',
          overflowY: 'auto',
          backgroundColor: 'rgba(10,8,0,0.88)',
          border: '1px solid #ffd06055',
          borderRadius: '10px',
          padding: '10px',
          zIndex: 10,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#ffd060', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.08em' }}>
            🥇 GOLD SHADER PARAMS
          </div>
          {sliders.map(({ key, label, min, max, step }) => (
            <div key={key} style={{ marginBottom: '7px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#ccc', marginBottom: '2px' }}>
                <span>{label}</span>
                <span style={{ color: '#ffd060', fontWeight: 700 }}>{params[key].toFixed(step < 0.01 ? 3 : 2)}</span>
              </div>
              <input
                type="range"
                min={min} max={max} step={step}
                value={params[key] as number}
                onChange={e => setParam(key, parseFloat(e.target.value) as any)}
                style={{ width: '100%', accentColor: '#ffd060', height: '3px' }}
              />
            </div>
          ))}
          <button
            onClick={() => { setParams({ ...DEFAULT_PARAMS }); paramsRef.current = { ...DEFAULT_PARAMS }; updateUniforms(DEFAULT_PARAMS); }}
            style={{ marginTop: '6px', width: '100%', background: '#ffd06022', border: '1px solid #ffd06055', color: '#ffd060', borderRadius: '5px', padding: '4px', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
          >
            Reset to Default
          </button>
        </div>
      )}
    </div>
  );
}
