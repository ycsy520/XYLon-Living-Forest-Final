/**
 * WinterSnow - 冬季雪花粒子系统
 *
 * 职责：
 * 1. 渲染 8000(桌面)/2000(移动) 个雪花粒子，带散景(Bokeh)效果
 * 2. 雪花恒速下落 + 滚动速度加速 + 摄像机 Z 轴跟随
 * 3. 鼠标排斥力（XY 平面）
 * 4. 通过 active prop 和 uAlpha uniform 实现平滑过渡
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../../utils/Config';
import { inputManager } from '../../utils/InputManager';

interface WinterSnowProps {
  active: boolean;
}

const TARGET_ALPHA_ACTIVE = 1.0;
const TARGET_ALPHA_INACTIVE = 0.0;
const ALPHA_LERP_SPEED = 0.03;

export const WinterSnow: React.FC<WinterSnowProps> = ({ active }) => {
  const meshRef = useRef<THREE.Points>(null);
  const alphaRef = useRef(active ? 1 : 0);
  
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
        uCamZ: { value: 0 },
        uInput: { value: new THREE.Vector3() },
        uAlpha: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime;
        uniform float uCamZ;
        uniform vec3 uInput;
        uniform float uAlpha;
        attribute float aRandom; 
        varying float vAlpha;
        varying vec3 vColor;
        varying float vBokeh;

        void main() {
            vec3 pos = position;

            // Camera Z follow: wrap particles around camera
            pos.z = mod(pos.z - uCamZ + 50.0, 100.0) - 50.0 + uCamZ;

            // Fall speed: 恒速下落，摄像机 Z 已跟随滚动
            pos.y -=uTime * (5.0 + aRandom * 5.0);
            pos.x += sin(uTime + aRandom * 10.0) * 0.5;

            // Repel on XY plane only
            float d = distance(pos.xy, uInput.xy);
            vec2 dir = normalize(pos.xy - uInput.xy);
            pos.xy += dir * smoothstep(15.0, 0.0, d) * 5.0;

            pos.y = mod(pos.y + 20.0, 60.0) - 20.0;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            
            float sizeBase = 4.0 + aRandom * 16.0;
            gl_PointSize = sizeBase * (30.0 / -mv.z);
            
            gl_Position = projectionMatrix * mv;
            vAlpha = smoothstep(-20.0, -5.0, pos.y) * uAlpha;
            
            vec3 colorCold = vec3(0.4, 0.6, 0.9);
            vec3 colorWarm = vec3(0.9, 0.95, 1.0);
            vColor = mix(colorCold, colorWarm, aRandom);
            
            vBokeh = aRandom;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        varying float vBokeh;

        void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);
            
            float edgeSoftness = 0.05 + vBokeh * 0.45;
            float circle = 1.0 - smoothstep(0.5 - edgeSoftness, 0.5, dist);
            
            if(circle < 0.01) discard;
            
            gl_FragColor = vec4(vColor, vAlpha * circle * (0.6 + vBokeh * 0.2));
        }
      `,
    });
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock, camera }) => {
    if (meshRef.current) {
      /* eslint-disable */
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uCamZ.value = camera.position.z;
      material.uniforms.uInput.value.set(
        inputManager.x * 20,
        5,
        0
      );
      /* eslint-enable */

      // Alpha 过渡：平滑插值到目标值
      const targetAlpha = active ? TARGET_ALPHA_ACTIVE : TARGET_ALPHA_INACTIVE;
      if (Math.abs(alphaRef.current - targetAlpha) > 0.001) {
        alphaRef.current = THREE.MathUtils.lerp(alphaRef.current, targetAlpha, ALPHA_LERP_SPEED);
      } else {
        alphaRef.current = targetAlpha;
      }
      material.uniforms.uAlpha.value = alphaRef.current;
    }
  });

  // Alpha 为 0 时跳过渲染（优化：避免提交透明 drawcall）
  if (!active && alphaRef.current < 0.01) return null;

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
