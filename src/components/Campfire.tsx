/**
 * Campfire - 篝火模型 + 3D 体积火组件
 *
 * 职责：
 * 1. 加载 FBX 篝火模型，应用 PBR 贴图
 * 2. 春季/秋季：使用 @wolffo/three-fire 体素火焰 + PointLight 闪烁
 * 3. 夏季/冬季：仅显示篝火模型，无火光
 *
 * 纹理容错：FBX 模型始终渲染，纹理失败时自动降级为纯色材质
 */
import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Fire } from '@wolffo/three-fire/react';
import { useSeason } from '../context/useSeason';
import { isMobile } from '../utils/Config';
import { createFireTexture } from '../utils/FireTexture';

/** 带 fallback 的纹理加载：失败时返回 null 而非 throw */
function useSafeTexture(url: string): THREE.Texture | null {
  const gl = useThree((s) => s.gl);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = gl.outputColorSpace;
        setTex(texture);
      },
      undefined,
      () => console.warn(`[Campfire] 纹理加载失败，使用 fallback: ${url}`),
    );
  }, [url, gl]);

  return tex;
}

function applyPBRMaterial(
  child: THREE.Mesh,
  map: THREE.Texture | null,
  normalMap: THREE.Texture | null,
  emissiveMap?: THREE.Texture | null,
  emissiveColor?: number,
) {
  const mat = new THREE.MeshStandardMaterial({
    map: map ?? undefined,
    normalMap: normalMap ?? undefined,
    color: map ? 0xffffff : 0x665544,
    roughness: 0.85,
    metalness: 0.05,
  });
  if (emissiveMap && emissiveColor !== undefined) {
    mat.emissiveMap = emissiveMap;
    mat.emissive = new THREE.Color(emissiveColor);
    mat.emissiveIntensity = 1.5;
  }
  child.material = mat;
}

export const Campfire: React.FC = () => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { season } = useSeason();

  /** 春秋季节显示火焰 */
  const fireActive = season === 'spring' || season === 'autumn';

  /** 火焰纹理（Canvas2D 运行时生成，仅创建一次） */
  const fireTex = useMemo(() => createFireTexture(), []);

  /** 性能分档 */
  const fireIterations = isMobile ? 10 : 18;
  const fireOctaves = isMobile ? 2 : 3;

  /** Flag — onUpdate 中仅在首次回调时补丁 material */
  const patchedRef = useRef(false);

  /** fireActive 变化时重置 patch 标志（Fire 组件会重挂载） */
  useEffect(() => {
    patchedRef.current = false;
  }, [fireActive]);

  /** FBX 模型（手动加载，失败时不 throw） */
  const [fbx, setFbx] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      '/campfire_model/Campfire_FBX.fbx',
      (obj) => setFbx(obj),
      undefined,
      (err) => console.error('[Campfire] FBX 加载失败:', err),
    );
  }, []);

  /** 纹理容错加载：失败时返回 null，对应网格用纯色材质 */
  const campDiffuse = useSafeTexture('/campfire_model/Textures/camp_diffuse.jpg');
  const campNormal = useSafeTexture('/campfire_model/Textures/camp_normal.jpg');
  const rocksDiffuse = useSafeTexture('/campfire_model/Textures/rocks_diffuse.jpg');
  const rocksNormal = useSafeTexture('/campfire_model/Textures/rocks_normal.jpg');
  const woodsDiffuse = useSafeTexture('/campfire_model/Textures/woodsground_diffuse.jpg');
  const woodsGlow = useSafeTexture('/campfire_model/Textures/woodsground_glow.jpg');

  /** 遍历 FBX，按网格名应用贴图 */
  useEffect(() => {
    if (!fbx) return;
    fbx.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const name = child.name.toLowerCase();

      if (name.includes('wood') && name.includes('ground')) {
        child.visible = false;
        return;
      }
      if (name.includes('camp')) {
        applyPBRMaterial(child, campDiffuse, campNormal);
      } else if (name.includes('rock')) {
        applyPBRMaterial(child, rocksDiffuse, rocksNormal);
      } else if (name.includes('wood')) {
        applyPBRMaterial(child, woodsDiffuse, null, woodsGlow, 0xff6600);
      } else {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x443322,
          roughness: 0.9,
        });
      }
    });
  }, [fbx, campDiffuse, campNormal, rocksDiffuse, rocksNormal, woodsDiffuse, woodsGlow]);

  /** PointLight 闪烁动画（仅春秋） */
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    if (!fireActive) {
      lightRef.current.intensity = 0;
      return;
    }
    const t = clock.getElapsedTime();
    const flicker = 1 + Math.sin(t * 8) * 0.12 + Math.sin(t * 13) * 0.06 + Math.sin(t * 21) * 0.03;
    lightRef.current.intensity = 8 * flicker;
  });

  /** 卸载时释放 GPU 资源（不 dispose 由 useLoader 缓存的纹理） */
  useEffect(() => {
    return () => {
      if (!fbx) return;
      fbx.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const mat = child.material;
          if (mat instanceof THREE.Material) {
            mat.dispose();
          }
        }
      });
    };
  }, [fbx]);

  /** FBX 加载完成前不渲染 */
  if (!fbx) return null;

  return (
    <group position={[1, 0, 2]} scale={0.2}>
      {/* FBX 篝火模型 */}
      <primitive object={fbx} />

      {/* 体积火焰（仅春季+秋季） */}
      {fireActive && (
        <Fire
          texture={fireTex}
          color={0xff6622}
          scale={[8.2, 10.5, 8.2]}
          position={[13, 7, 0]}
          magnitude={1.3}
          iterations={fireIterations}
          octaves={fireOctaves}
          autoUpdate
          onUpdate={(fireMesh) => {
            if (patchedRef.current) return;
            if (fireMesh.material) {
              fireMesh.material.depthTest = true;
              fireMesh.material.depthWrite = true;
            }
            patchedRef.current = true;
          }}
        />
      )}

      {/* 点光源 — 春秋闪烁，夏冬关闭 */}
      <pointLight
        ref={lightRef}
        position={[0, 8, 0]}
        color={0xff6622}
        intensity={fireActive ? 8 : 0}
        distance={30}
        decay={2}
        castShadow
      />
    </group>
  );
};
