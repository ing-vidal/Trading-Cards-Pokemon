'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getPresetById } from '@tcg/shaders';
import { GoldCard3DCanvas } from './GoldCard3DCanvas';


export interface Card3DCanvasProps {
  presetId?: string;
  intensity?: number;
  imageUrl?: string;
  width?: string;
  height?: string;
}

// Light config per preset for rarity-specific atmosphere
const RARITY_LIGHTS: Record<string, { ambient: number; d1Color: number; d1Intensity: number; d2Color: number; d2Intensity: number }> = {
  'gold-relic': {
    ambient: 0.8,
    d1Color: 0xffd060,  // warm gold
    d1Intensity: 1.8,
    d2Color: 0xffa040,  // amber fill
    d2Intensity: 0.8,
  },
  'rainbow-hyper': {
    ambient: 0.7,
    d1Color: 0xffffff,
    d1Intensity: 1.6,
    d2Color: 0xff40ff,  // magenta fill
    d2Intensity: 0.9,
  },
  'glass-shatter': {
    ambient: 0.8,
    d1Color: 0xd0eeff,  // cool white
    d1Intensity: 1.6,
    d2Color: 0x4080ff,  // blue fill
    d2Intensity: 0.7,
  },
  'immersive-rare': {
    ambient: 0.62,
    d1Color: 0xfff6df,
    d1Intensity: 1.95,
    d2Color: 0x7ddcff,
    d2Intensity: 1.05,
  },
  'promo-glow': {
    ambient: 0.78,
    d1Color: 0xffffff,
    d1Intensity: 1.8,
    d2Color: 0xff42c8,
    d2Intensity: 1.0,
  },
  'special-art': {
    ambient: 0.5,
    d1Color: 0x8040ff,  // purple
    d1Intensity: 1.4,
    d2Color: 0x2020ff,  // deep blue
    d2Intensity: 0.7,
  },
  'trainer-gallery': {
    ambient: 0.9,
    d1Color: 0xe0eeff,  // silver-white
    d1Intensity: 1.5,
    d2Color: 0xb0c8ff,  // blue-silver
    d2Intensity: 0.6,
  },
  'basic-foil': {
    ambient: 0.9,
    d1Color: 0xffffff,
    d1Intensity: 1.4,
    d2Color: 0xd9e7d2,
    d2Intensity: 0.45,
  },
  'rare-foil': {
    ambient: 0.82,
    d1Color: 0xffffff,
    d1Intensity: 1.65,
    d2Color: 0x7dd3fc,
    d2Intensity: 0.65,
  },
  'double-rare-foil': {
    ambient: 0.78,
    d1Color: 0xfffff0,
    d1Intensity: 1.85,
    d2Color: 0x7ee787,
    d2Intensity: 0.85,
  },
  'star-foil': {
    ambient: 0.84,
    d1Color: 0xf8f7ff,
    d1Intensity: 1.7,
    d2Color: 0x77e8d5,
    d2Intensity: 0.72,
  },
  'two-star-foil': {
    ambient: 0.82,
    d1Color: 0xffffff,
    d1Intensity: 2.1,
    d2Color: 0x67e8f9,
    d2Intensity: 1.05,
  },
};

export function Card3DCanvas({
  presetId = 'basic-foil',
  intensity = 0.75,
  imageUrl,
  width = '100%',
  height = '520px',
}: Card3DCanvasProps) {
  // ── Premium metallic renderers ─────────────────────────────────────────────
  if (presetId === 'gold-relic' || presetId === 'crown-rare') {
    return (
      <GoldCard3DCanvas
        imageUrl={imageUrl}
        intensity={intensity}
        width={width}
        height={height}
        showEditor={false}
        variant={presetId === 'crown-rare' ? 'crown' : 'gold'}
      />
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);

  // Update texture when imageUrl changes without remounting
  useEffect(() => {
    if (materialRef.current && imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        imageUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          if (materialRef.current) {
            materialRef.current.uniforms.tDiffuse.value = texture;
            materialRef.current.needsUpdate = true;
          }
        },
        undefined,
        (err) => {
          console.warn('Error loading texture for 3D card:', err);
        }
      );
    }
  }, [imageUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0, 4.8);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Rarity-specific lights
    const lightCfg = RARITY_LIGHTS[presetId] || RARITY_LIGHTS['basic-foil'];

    const ambientLight = new THREE.AmbientLight(0xffffff, lightCfg.ambient);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(lightCfg.d1Color, lightCfg.d1Intensity);
    dirLight1.position.set(4, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(lightCfg.d2Color, lightCfg.d2Intensity);
    dirLight2.position.set(-4, -3, -2);
    scene.add(dirLight2);

    // 4. Card Geometry & Shader Material
    const geometry = new RoundedBoxGeometry(2.5, 3.5, 0.12, 0.08, 6);
    const preset = getPresetById(presetId);

    const initialTexture = new THREE.DataTexture(
      new Uint8Array([255, 255, 255, 255, 255, 255]),
      1,
      1,
      THREE.RGBFormat,
    );
    initialTexture.needsUpdate = true;
    if (imageUrl) {
      new THREE.TextureLoader().load(imageUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        if (materialRef.current) {
          materialRef.current.uniforms.tDiffuse.value = tex;
          materialRef.current.needsUpdate = true;
        }
      });
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: preset.vertexShader,
      fragmentShader: preset.fragmentShader,
      uniforms: {
        uTime:      { value: 0 },
        uIntensity: { value: intensity },
        uDoubleIntensity: { value: presetId === 'double-immersive-rare' ? 1 : 0 },
        uMousePos:  { value: new THREE.Vector2(0, 0) },
        tDiffuse:   { value: initialTexture },
      },
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const cardMesh = new THREE.Mesh(geometry, material);
    cardMeshRef.current = cardMesh;
    scene.add(cardMesh);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minPolarAngle = Math.PI / 3;

    // 6. Pointer Tilt + Mouse uniform
    let targetRotX = 0;
    let targetRotY = 0;
    let targetRotZ = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      const y = -(((e.clientY - rect.top)  / rect.height) * 2 - 1);

      const doubleImmersive = presetId === 'double-immersive-rare';
      const promo = presetId === 'promo-glow';
      const twoStar = presetId === 'two-star-foil';
      targetRotY = x * (doubleImmersive ? 0.52 : promo ? 0.48 : twoStar ? 0.46 : 0.42);
      targetRotX = -y * (doubleImmersive ? 0.38 : promo ? 0.36 : twoStar ? 0.3 : 0.32);
      targetRotZ = -x * (doubleImmersive ? 0.085 : promo ? 0.07 : twoStar ? 0.045 : 0.055);

      // Pass normalized mouse position to shader
      if (materialRef.current) {
        materialRef.current.uniforms.uMousePos.value.set(x, y);
      }
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      targetRotZ = 0;
      if (materialRef.current) {
        materialRef.current.uniforms.uMousePos.value.set(0, 0);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta;
      }

      if (cardMeshRef.current) {
        cardMeshRef.current.rotation.x = THREE.MathUtils.lerp(cardMeshRef.current.rotation.x, targetRotX, 0.1);
        cardMeshRef.current.rotation.y = THREE.MathUtils.lerp(cardMeshRef.current.rotation.y, targetRotY, 0.1);
        cardMeshRef.current.rotation.z = THREE.MathUtils.lerp(cardMeshRef.current.rotation.z, targetRotZ, 0.1);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
      }}
    />
  );
}
