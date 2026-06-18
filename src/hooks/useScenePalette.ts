/**
 * useScenePalette - Canvas 内调色板插值 hook
 *
 * 职责：
 * 1. 在 Canvas 内部读取 SeasonContext 的目标 palette
 * 2. 每帧通过 lerp 将当前值平滑过渡到目标值
 * 3. 收敛到目标值后停止更新 state，避免不必要的 re-render
 * 4. 返回当前插值后的 palette，供 Scene/Forest/PostProcessing 等组件使用
 *
 * 架构说明：
 * - 使用 useRef 存储可变 THREE.Color 实例，仅在 useFrame 中原地修改
 * - 使用 useState 存储快照值，供 React 渲染树读取
 * - useFrame 中仅在值变化时调用 setState（收敛后停止）
 */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSeason } from '../context/useSeason';
import { SEASONS, type SeasonPalette } from '../context/SeasonPalette';

const LERP_SPEED = 0.02;
const EPSILON = 0.001;

/** 可变调色板（useRef 持有），在 useFrame 中原地更新 */
interface MutablePalette {
  fogColor: THREE.Color;
  fogDensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  spotColor: THREE.Color;
  spotIntensity: number;
  groundColor: THREE.Color;
  treeBottom: THREE.Color;
  treeTop: THREE.Color;
  windAmplitude: number;
  bloomIntensity: number;
  noiseOpacity: number;
  cursorColor: number;
  groundRoughness: number;
  groundMetalness: number;
}

/** 不可变快照（useState 持有），供 React 渲染树读取 */
export interface ResolvedPalette {
  fogColor: THREE.Color;
  fogDensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  spotColor: THREE.Color;
  spotIntensity: number;
  groundColor: THREE.Color;
  treeBottom: THREE.Color;
  treeTop: THREE.Color;
  windAmplitude: number;
  bloomIntensity: number;
  noiseOpacity: number;
  cursorColor: number;
  groundRoughness: number;
  groundMetalness: number;
}

function createMutable(p: SeasonPalette): MutablePalette {
  return {
    fogColor: new THREE.Color(p.fogColor),
    fogDensity: p.fogDensity,
    ambientColor: new THREE.Color(p.ambientColor),
    ambientIntensity: p.ambientIntensity,
    spotColor: new THREE.Color(p.spotColor),
    spotIntensity: p.spotIntensity,
    groundColor: new THREE.Color(p.groundColor),
    treeBottom: new THREE.Color(p.treeBottom),
    treeTop: new THREE.Color(p.treeTop),
    windAmplitude: p.windAmplitude,
    bloomIntensity: p.bloomIntensity,
    noiseOpacity: p.noiseOpacity,
    cursorColor: p.cursorColor,
    groundRoughness: p.groundRoughness,
    groundMetalness: p.groundMetalness,
  };
}

/** 从 MutablePalette 复制一份快照 */
function snapshot(m: MutablePalette): ResolvedPalette {
  return {
    fogColor: m.fogColor.clone(),
    fogDensity: m.fogDensity,
    ambientColor: m.ambientColor.clone(),
    ambientIntensity: m.ambientIntensity,
    spotColor: m.spotColor.clone(),
    spotIntensity: m.spotIntensity,
    groundColor: m.groundColor.clone(),
    treeBottom: m.treeBottom.clone(),
    treeTop: m.treeTop.clone(),
    windAmplitude: m.windAmplitude,
    bloomIntensity: m.bloomIntensity,
    noiseOpacity: m.noiseOpacity,
    cursorColor: m.cursorColor,
    groundRoughness: m.groundRoughness,
    groundMetalness: m.groundMetalness,
  };
}

/**
 * useScenePalette - 在 Canvas 内使用，返回每帧插值后的调色板快照
 */
export function useScenePalette(): ResolvedPalette {
  const { season } = useSeason();
  const mutable = useRef<MutablePalette>(createMutable(SEASONS['winter']));
  const [value, setValue] = useState<ResolvedPalette>(() => snapshot(createMutable(SEASONS[season])));
  // 复用 Color 实例，避免每帧 new Color() 产生 GC 压力
  const tmpColor = useRef(new THREE.Color());

  useFrame(() => {
    const target = SEASONS[season];
    const c = mutable.current;
    let needsUpdate = false;

    // --- Color 类型 lerp ---
    const colorFields: (keyof Pick<MutablePalette, 'fogColor' | 'ambientColor' | 'spotColor' | 'groundColor' | 'treeBottom' | 'treeTop'>)[] =
      ['fogColor', 'ambientColor', 'spotColor', 'groundColor', 'treeBottom', 'treeTop'];

    for (const field of colorFields) {
      tmpColor.current.set(target[field]);
      if (!c[field].equals(tmpColor.current)) {
        c[field].lerp(tmpColor.current, LERP_SPEED);
        if (c[field].equals(tmpColor.current)) {
          c[field].copy(tmpColor.current);
        }
        needsUpdate = true;
      }
    }

    // --- 数值类型 lerp ---
    const numFields: { key: keyof MutablePalette; target: number }[] = [
      { key: 'fogDensity', target: target.fogDensity },
      { key: 'ambientIntensity', target: target.ambientIntensity },
      { key: 'spotIntensity', target: target.spotIntensity },
      { key: 'windAmplitude', target: target.windAmplitude },
      { key: 'bloomIntensity', target: target.bloomIntensity },
      { key: 'noiseOpacity', target: target.noiseOpacity },
      { key: 'groundRoughness', target: target.groundRoughness },
      { key: 'groundMetalness', target: target.groundMetalness },
    ];

    for (const { key, target: tgt } of numFields) {
      const cur = (c as unknown as Record<string, number>)[key];
      if (Math.abs(cur - tgt) > EPSILON) {
        (c as unknown as Record<string, number>)[key] = THREE.MathUtils.lerp(cur, tgt, LERP_SPEED);
        needsUpdate = true;
      } else if (cur !== tgt) {
        (c as unknown as Record<string, number>)[key] = tgt;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setValue(snapshot(c));
    }
  });

  return value;
}
