import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import Lenis from 'lenis';
import { CONFIG, isMobile } from '../utils/Config';
import { inputManager } from '../utils/InputManager';
import { AudioEngine } from '../utils/AudioEngine';
import { Forest } from './Forest';
import { Snow } from './Snow';
import { Monolith } from './Monolith';

const CameraController = ({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    // Camera Scroll Logic
    // eslint-disable-next-line
    camera.position.z = THREE.MathUtils.lerp(
      CONFIG.camZStart,
      CONFIG.camZEnd,
      scrollProgress.current
    );

    // Parallax Logic
    camera.position.x = inputManager.x * 2.0;
    camera.position.y = 12 - inputManager.y * 3.0;
    camera.lookAt(0, 1, 0);
  });

  return null;
};

export const Scene: React.FC = () => {
  const scrollProgress = useRef(0);
  const scrollVelocity = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onScroll = ({ scroll, limit, velocity }: any) => {
        scrollProgress.current = limit > 0 ? scroll / limit : 0;
        scrollVelocity.current = Math.abs(velocity);
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
        <fogExp2 attach="fog" args={[0x0f172a, CONFIG.fogDensity]} />
        
        <ambientLight intensity={0.6} color={0x404060} />
        <spotLight
            position={[5, 15, 5]}
            color={0xaabbff}
            intensity={8}
            angle={Math.PI * 0.3}
            penumbra={0.5}
            castShadow={CONFIG.shadows}
            shadow-mapSize={[1024, 1024]}
        />

        <Suspense fallback={null}>
            <Monolith />
            <Forest />
            <Snow scrollVelocity={scrollVelocity} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow={CONFIG.shadows}>
                <planeGeometry args={[200, 200, 32, 32]} />
                <meshStandardMaterial color={0x050508} roughness={0.4} metalness={0.6} />
            </mesh>
        </Suspense>

        <CameraController scrollProgress={scrollProgress} />

        {!isMobile && (
            <EffectComposer>
                <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.0} radius={0.9} />
                <Noise opacity={0.15} />
            </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};
