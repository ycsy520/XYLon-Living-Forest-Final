import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../utils/Config';
import { inputManager } from '../utils/InputManager';

interface SnowProps {
  scrollVelocity: React.MutableRefObject<number>;
}

export const Snow: React.FC<SnowProps> = ({ scrollVelocity }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const { positions, randoms } = useMemo(() => {
    const pos = [];
    const rnd = [];
    for (let i = 0; i < CONFIG.snowCount; i++) {
      // eslint-disable-next-line
      const x = (Math.random() - 0.5) * 100;
      // eslint-disable-next-line
      const y = Math.random() * 60 - 10;
      // eslint-disable-next-line
      const z = (Math.random() - 0.5) * 100;
      pos.push(x, y, z);
      // eslint-disable-next-line
      rnd.push(Math.random());
    }
    return {
      positions: new Float32Array(pos),
      randoms: new Float32Array(rnd)
    };
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uInput: { value: new THREE.Vector3() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime; uniform float uScroll; uniform vec3 uInput;
        attribute float aRandom; 
        varying float vAlpha;
        varying vec3 vColor;
        varying float vBokeh;

        void main() {
            vec3 pos = position;
            pos.y -= uTime * (5.0 + aRandom * 5.0 + uScroll * 0.1); // Reduced multiplier for velocity
            pos.x += sin(uTime + aRandom * 10.0) * 0.5;
            // Repel
            float d = distance(pos.xz, uInput.xz);
            vec3 dir = normalize(pos - uInput);
            pos += dir * smoothstep(15.0, 0.0, d) * 5.0;

            pos.y = mod(pos.y + 20.0, 60.0) - 20.0;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            
            // Enhanced Size Variation for Depth
            float sizeBase = 4.0 + aRandom * 16.0;
            gl_PointSize = sizeBase * (30.0 / -mv.z);
            
            gl_Position = projectionMatrix * mv;
            vAlpha = smoothstep(-20.0, -5.0, pos.y);
            
            // Deep Sea Color Grading: Cold Blue to Warm White
            vec3 colorCold = vec3(0.4, 0.6, 0.9); // Cool Cyan/Blue
            vec3 colorWarm = vec3(0.9, 0.95, 1.0); // Warm/White
            vColor = mix(colorCold, colorWarm, aRandom);
            
            vBokeh = aRandom; // Use random as bokeh factor
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        varying float vBokeh;

        void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);
            
            // Bokeh Effect: Softer edges for "out of focus" particles
            float edgeSoftness = 0.05 + vBokeh * 0.45;
            float circle = 1.0 - smoothstep(0.5 - edgeSoftness, 0.5, dist);
            
            if(circle < 0.01) discard;
            
            // Combine alpha, circle shape and bokeh dimming
            gl_FragColor = vec4(vColor, vAlpha * circle * (0.6 + vBokeh * 0.2));
        }
      `,
    });
  }, []);

  useFrame(({ clock, camera }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      // eslint-disable-next-line
      material.uniforms.uTime.value = time;
      material.uniforms.uScroll.value = scrollVelocity.current;
      
      material.uniforms.uInput.value.set(
        inputManager.x * 20,
        0,
        camera.position.z - 10
      );
    }
  });

  return (
    <points ref={meshRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 1]}
        />
      </bufferGeometry>
    </points>
  );
};
