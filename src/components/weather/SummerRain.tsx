/**
 * SummerRain - 夏季暴雨粒子系统
 *
 * 参考 three.js webgpu_particles_rain 官方案例参数：
 * - 雨丝: PlaneGeometry(0.1, 2) + uv().distance(vec2(.5,0)).oneMinus().mul(3).exp().mul(.1)
 * - 速度: velocity.y = -0.2 ~ -0.24 每帧 → 约 12~15 单位/秒
 * - 涟漪: rippleTime 驱动的扩散环，生命周期内扩散+消散
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isMobile } from '../../utils/Config';

interface SummerRainProps {
  active: boolean;
}

const RAIN_COUNT = isMobile ? 48000 : 144000;
const SPLASH_COUNT = isMobile ? 800 : 2000;
const TARGET_ALPHA_ACTIVE = 1.0;
const TARGET_ALPHA_INACTIVE = 0.0;
const ALPHA_LERP_SPEED = 0.03;

/**
 * SummerRain 组件 - 暴雨雨丝 + 地面溅射涟漪
 *
 * 两层粒子系统：
 * - 主层: 雨丝（细长水滴，1:20 宽高比）
 * - 副层: 地面涟漪（扩散环，模拟雨滴落地）
 */
export const SummerRain: React.FC<SummerRainProps> = ({ active }) => {
  const rainRef = useRef<THREE.Points>(null);
  const splashRef = useRef<THREE.Points>(null);
  const alphaRef = useRef(active ? 1 : 0);

  /* ===== 雨丝粒子数据 ===== */
  const rainData = useMemo(() => {
    const pos = [];
    const rnd = [];
    for (let i = 0; i < RAIN_COUNT; i++) {
      // eslint-disable-next-line
      pos.push((Math.random() - 0.5) * 120, Math.random() * 50, (Math.random() - 0.5) * 120);
      // eslint-disable-next-line
      rnd.push(Math.random());
    }
    return {
      positions: new Float32Array(pos),
      randoms: new Float32Array(rnd),
    };
  }, []);

  /* ===== 地面涟漪粒子数据 ===== */
  const splashData = useMemo(() => {
    const pos = [];
    const rnd = [];
    for (let i = 0; i < SPLASH_COUNT; i++) {
      // eslint-disable-next-line
      pos.push((Math.random() - 0.5) * 120, -1.4, (Math.random() - 0.5) * 120);
      // eslint-disable-next-line
      rnd.push(Math.random());
    }
    return {
      positions: new Float32Array(pos),
      randoms: new Float32Array(rnd),
    };
  }, []);

  /* ===== 雨丝材质 ===== */
  const rainMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCamZ: { value: 0 },
        uAlpha: { value: 0.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uCamZ;
        uniform float uAlpha;
        attribute float aRandom;
        varying float vAlpha;
        varying vec3 vColor;
        varying float vVariation;

        void main() {
            vec3 pos = position;

            /* 摄像机 Z 跟随 */
            pos.z = mod(pos.z - uCamZ + 60.0, 120.0) - 60.0 + uCamZ;

            /* 下落速度：12~18 单位/秒（与官方 0.2~0.24/帧 对齐） */
            pos.y -= uTime * (12.0 + aRandom * 6.0);

            /* 风偏移 */
            pos.x += sin(uTime * 0.3 + aRandom * 6.28) * 2.0;

            /* 循环 */
            pos.x = mod(pos.x + 60.0, 120.0) - 60.0;
            pos.y = mod(pos.y + 10.0, 60.0) - 10.0;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            float viewZ = -mv.z;

            /* 粒子大小 */
            float sizeBase = 4.0 + aRandom * 6.0;
            gl_PointSize = sizeBase * (30.0 / max(viewZ, 1.0));
            gl_PointSize = clamp(gl_PointSize, 1.5, 22.0);

            gl_Position = projectionMatrix * mv;
            vAlpha = smoothstep(-10.0, 2.0, pos.y) * uAlpha;

            vec3 colorCool = vec3(0.6, 0.7, 0.9);
            vec3 colorWhite = vec3(0.9, 0.92, 1.0);
            vColor = mix(colorCool, colorWhite, aRandom);
            vVariation = aRandom;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        varying vec3 vColor;
        varying float vVariation;

        void main() {
            vec2 uv = gl_PointCoord;

            /*
             * 水滴形态：模拟官方 PlaneGeometry(0.1, 2) 的 1:20 宽高比
             * 官方: uv().distance(vec2(.5,0)).oneMinus().mul(3).exp().mul(.1)
             *
             * 将 UV 的 X 轴压缩 10 倍，模拟细长平面的 UV 空间
             * 然后用距离+指数衰减形成从顶部向下的水滴形状
             */
            float compressX = 8.0 + vVariation * 4.0;
            vec2 stretched = vec2((uv.x - 0.5) * compressX + 0.5, uv.y);

            /* 距离顶部中心 (0.5, 0) 的距离 */
            float d = distance(stretched, vec2(0.5, 0.0));
            float drop = (1.0 - d) * 3.0;
            drop = clamp(exp(drop) * 0.1, 0.0, 1.0);

            if (drop < 0.01) discard;

            gl_FragColor = vec4(vColor, vAlpha * drop * 0.6);
        }
      `,
    });
  }, []);

  /* ===== 地面涟漪材质 ===== */
  const splashMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCamZ: { value: 0 },
        uAlpha: { value: 0.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uCamZ;
        uniform float uAlpha;
        attribute float aRandom;
        varying float vAlpha;

        void main() {
            vec3 pos = position;

            /* 摄像机 Z 跟随（与雨丝相同坐标系） */
            pos.z = mod(pos.z - uCamZ + 60.0, 120.0) - 60.0 + uCamZ;
            pos.x += sin(uTime * 0.3 + aRandom * 6.28) * 2.0;
            pos.x = mod(pos.x + 60.0, 120.0) - 60.0;

            /* 涟漪生命周期：快速循环，保持密集 */
            float cycle = 1.0 + aRandom * 2.0;
            float t = mod(uTime * (1.0 + aRandom * 0.5) + aRandom * 100.0, cycle);

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            float viewZ = -mv.z;

            /* 扩散环：从 0 扩大到 5 单位 */
            float ringSize = t * 4.0;
            gl_PointSize = ringSize * (30.0 / max(viewZ, 1.0));
            gl_PointSize = clamp(gl_PointSize, 0.5, 25.0);

            gl_Position = projectionMatrix * mv;

            /* 生命周期 alpha：sin 曲线，出现→扩散→消散 */
            float lifeT = t / cycle;
            vAlpha = sin(lifeT * 3.14159) * uAlpha * 0.8;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;

        void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);

            /* 扩散环：官方 rippleEffect 公式简化版
               distance.min(1).sub(distance.max(1).sub(1)) → 环形 */
            float ring = smoothstep(0.25, 0.35, dist) * (1.0 - smoothstep(0.4, 0.5, dist));
            if (ring < 0.01) discard;

            gl_FragColor = vec4(0.3, 0.35, 0.45, vAlpha * ring * 0.5);
        }
      `,
    });
  }, []);

  useEffect(() => {
    return () => {
      rainMaterial.dispose();
      splashMaterial.dispose();
    };
  }, [rainMaterial, splashMaterial]);

  useFrame(({ clock, camera }) => {
    const targetAlpha = active ? TARGET_ALPHA_ACTIVE : TARGET_ALPHA_INACTIVE;
    if (Math.abs(alphaRef.current - targetAlpha) > 0.001) {
      alphaRef.current = THREE.MathUtils.lerp(alphaRef.current, targetAlpha, ALPHA_LERP_SPEED);
    } else {
      alphaRef.current = targetAlpha;
    }

    /* eslint-disable */
    rainMaterial.uniforms.uTime.value = clock.getElapsedTime();
    rainMaterial.uniforms.uCamZ.value = camera.position.z;
    rainMaterial.uniforms.uAlpha.value = alphaRef.current;

    splashMaterial.uniforms.uTime.value = clock.getElapsedTime();
    splashMaterial.uniforms.uCamZ.value = camera.position.z;
    splashMaterial.uniforms.uAlpha.value = alphaRef.current;
    /* eslint-enable */
  });

  if (!active && alphaRef.current < 0.01) return null;

  return (
    <>
      <points ref={rainRef} material={rainMaterial} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[rainData.positions, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[rainData.randoms, 1]} />
        </bufferGeometry>
      </points>
      <points ref={splashRef} material={splashMaterial} renderOrder={2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[splashData.positions, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[splashData.randoms, 1]} />
        </bufferGeometry>
      </points>
    </>
  );
};
