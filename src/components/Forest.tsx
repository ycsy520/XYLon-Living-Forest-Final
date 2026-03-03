import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../utils/Config';
import { inputManager } from '../utils/InputManager';

export const Forest: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(1, 1, 8, 12, true);
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x0f172a) },
        uTopColor: { value: new THREE.Color(0xffffff) },
        uInput: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec3 uInput;
        varying float vHeight;
        
        // Constants
        const float Y_SCALE = 12.0;
        const float XZ_SCALE = 3.5;
        const float INTERACT_RADIUS = 10.0;
        
        void main() {
            vec3 pos = position;
            pos.y *= Y_SCALE; 
            
            // Tapering effect
            float taper = 1.0 - pos.y / (Y_SCALE + 1.0);
            pos.x *= XZ_SCALE * taper; 
            pos.z *= XZ_SCALE * taper;
            
            vec4 wPos = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
            float dist = distance(wPos.xz, uInput.xz);
            float interact = smoothstep(INTERACT_RADIUS, 0.0, dist);
            
            float wind = sin(uTime * 0.8 + wPos.x * 0.3) * 0.1;
            pos.x += (pos.y * 0.1) * (wind + interact * 0.2);
            
            vHeight = pos.y;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor; uniform vec3 uTopColor; varying float vHeight;
        void main() {
            float m = smoothstep(2.0, 10.0, vHeight);
            gl_FragColor = vec4(mix(uColor, uTopColor, m * 0.8), 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < CONFIG.treeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 10 + Math.random() * 40;
        dummy.position.set(
            Math.cos(angle) * r,
            -1,
            Math.sin(angle) * r
        );
        const s = 0.5 + Math.random();
        dummy.scale.set(s, s, s);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame(({ clock }) => {
    if (material) {
        // eslint-disable-next-line
        material.uniforms.uTime.value = clock.getElapsedTime();
        material.uniforms.uInput.value.set(
            inputManager.x * 20,
            5,
            -inputManager.y * 10
        );
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.treeCount]}
      geometry={geometry}
      material={material}
      castShadow={CONFIG.shadows}
      receiveShadow={CONFIG.shadows}
    />
  );
};
