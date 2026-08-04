'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getPresetById } from '@tcg/shaders';

export interface Card3DCanvasProps {
  presetId?: string;
  intensity?: number;
  imageUrl?: string;
  width?: string;
  height?: string;
}

export function Card3DCanvas({
  presetId = 'basic-foil',
  intensity = 0.75,
  imageUrl,
  width = '100%',
  height = '520px',
}: Card3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);

  // Update texture when imageUrl changes
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

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.6);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // 4. Card Geometry & Shader Material
    const geometry = new THREE.BoxGeometry(2.5, 3.5, 0.04);
    const preset = getPresetById(presetId);

    const initialTexture = new THREE.Texture();
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
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        tDiffuse: { value: initialTexture },
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

    // 6. Pointer Tilt Effect
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = x * 0.5;
      targetRotX = -y * 0.5;
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
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
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
  }, []);

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
