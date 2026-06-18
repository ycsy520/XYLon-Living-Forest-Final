/**
 * Scene - 3D 场景主容器
 *
 * 职责：
 * 1. 初始化 Canvas、Lenis 滚动、摄像机控制
 * 2. 根据季节调色板动态调整灯光、雾效、地面颜色
 * 3. 根据当前季节条件渲染对应的天气效果组件
 * 4. 为桌面端启用后处理效果（Bloom + Noise）
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import Lenis from 'lenis';
import { CONFIG, isMobile } from '../utils/Config';
import { inputManager } from '../utils/InputManager';
import { AudioEngine } from '../utils/AudioEngine';
import { useSeason } from '../context/useSeason';
import { useScenePalette } from '../hooks/useScenePalette';
import { Forest } from './Forest';
import { WinterSnow } from './weather/WinterSnow';
import { SummerRain } from './weather/SummerRain';
import { Campfire } from './Campfire';

/**
 * CameraController - 摄像机控制组件
 * 根据滚动进度驱动 Z 轴移动，根据鼠标/触摸做视差偏移
 */
const CameraController = ({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    // eslint-disable-next-line
    camera.position.z = THREE.MathUtils.lerp(
      CONFIG.camZStart,
      CONFIG.camZEnd,
      scrollProgress.current
    );
    camera.position.x = inputManager.x * 2.0;
    camera.position.y = 12 - inputManager.y * 3.0;
    camera.lookAt(0, 1, 0);
  });

  return null;
};

/**
 * SceneLighting - 场景灯光与雾效组件
 * 在 Canvas 内部使用 useScenePalette 获取插值后的调色板，平滑过渡灯光和雾效
 */
const SceneLighting: React.FC = () => {
  const palette = useScenePalette();
  const fogRef = useRef<THREE.FogExp2>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const groundRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    // 雾效平滑过渡
    if (fogRef.current) {
      fogRef.current.color.lerp(palette.fogColor, 0.02);
      fogRef.current.density = THREE.MathUtils.lerp(fogRef.current.density, palette.fogDensity, 0.02);
    }
    // 环境光平滑过渡
    if (ambientRef.current) {
      ambientRef.current.color.lerp(palette.ambientColor, 0.02);
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, palette.ambientIntensity, 0.02);
    }
    // 聚光灯平滑过渡
    if (spotRef.current) {
      spotRef.current.color.lerp(palette.spotColor, 0.02);
      spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, palette.spotIntensity, 0.02);
    }
    // 地面材质颜色 + 物理属性过渡
    if (groundRef.current) {
      groundRef.current.color.lerp(palette.groundColor, 0.02);
      groundRef.current.roughness = THREE.MathUtils.lerp(groundRef.current.roughness, palette.groundRoughness, 0.02);
      groundRef.current.metalness = THREE.MathUtils.lerp(groundRef.current.metalness, palette.groundMetalness, 0.02);
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={[0x0f172a, CONFIG.fogDensity]} />
      <ambientLight ref={ambientRef} intensity={0.6} color={0x404060} />
      <spotLight
        ref={spotRef}
        position={[5, 15, 5]}
        color={0xaabbff}
        intensity={8}
        angle={Math.PI * 0.3}
        penumbra={0.5}
        castShadow={CONFIG.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow={CONFIG.shadows}>
        <planeGeometry args={[200, 200, 32, 32]} />
        <meshStandardMaterial ref={groundRef} color={0x050508} roughness={0.4} metalness={0.6} />
      </mesh>
    </>
  );
};

/**
 * SceneForest - 带季节参数的森林组件
 */
const SceneForest: React.FC = () => {
  const palette = useScenePalette();
  return (
    <Forest
      treeBottom={palette.treeBottom.getHex()}
      treeTop={palette.treeTop.getHex()}
      windAmplitude={palette.windAmplitude}
    />
  );
};

/**
 * WeatherSwitcher - 天气效果切换组件
 * 根据当前季节渲染对应的天气效果，两个季节同时存在以实现平滑过渡
 * 春天雾气效果需要 WebGPU + TSL 支持，当前 WebGL 架构暂不实现
 */
const WeatherSwitcher: React.FC = () => {
  const { season } = useSeason();
  return (
    <>
      <WinterSnow active={season === 'winter'} />
      <SummerRain active={season === 'summer'} />
    </>
  );
};

/**
 * PostProcessing - 后处理效果组件
 * 根据季节调色板动态调整 Bloom 和 Noise 参数
 */
const PostProcessing: React.FC = () => {
  const palette = useScenePalette();
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.8} mipmapBlur intensity={palette.bloomIntensity} radius={0.9} />
      <Noise opacity={palette.noiseOpacity} />
    </EffectComposer>
  );
};

export const Scene: React.FC = () => {
  const scrollProgress = useRef(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onScroll = ({ scroll, limit, velocity }: any) => {
        scrollProgress.current = limit > 0 ? scroll / limit : 0;
        AudioEngine.update(velocity * 0.005);
    };
    
    lenis.on('scroll', onScroll);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div id="canvas-container" className="fixed inset-0 w-full h-full bg-transparent">
      <Canvas
        className="w-full h-full"
        dpr={CONFIG.pixelRatio}
        gl={{ 
            antialias: !CONFIG.shadows,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping
        }}
        shadows={CONFIG.shadows}
        camera={{
            position: [0, 12, CONFIG.camZStart],
            fov: 45,
            near: 0.1,
            far: 100
        }}
      >
        <SceneLighting />

        <Suspense fallback={null}>
            <Campfire />
            <SceneForest />
            <WeatherSwitcher />
        </Suspense>

        <CameraController scrollProgress={scrollProgress} />

        {!isMobile && <PostProcessing />}
      </Canvas>
    </div>
  );
};
