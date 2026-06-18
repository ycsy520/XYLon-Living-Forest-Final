/**
 * SeasonPalette - 四季调色板常量与类型定义
 *
 * 从 SeasonContext.tsx 拆分出来，以符合 Vite Fast Refresh 规则：
 * 组件文件只能导出组件，常量和类型需独立文件。
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonPalette {
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  ambientIntensity: number;
  spotColor: number;
  spotIntensity: number;
  groundColor: number;
  treeBottom: number;
  treeTop: number;
  windAmplitude: number;
  bloomIntensity: number;
  noiseOpacity: number;
  cursorColor: number;
  groundRoughness: number;
  groundMetalness: number;
}

export const SEASONS: Record<Season, SeasonPalette> = {
  winter: {
    fogColor: 0x0f172a,
    fogDensity: 0.02,
    ambientColor: 0x404060,
    ambientIntensity: 0.6,
    spotColor: 0xaabbff,
    spotIntensity: 8,
    groundColor: 0xd0d8e0,
    treeBottom: 0x0f172a,
    treeTop: 0xffffff,
    windAmplitude: 0.1,
    bloomIntensity: 1.0,
    noiseOpacity: 0.08,
    cursorColor: 0xaaccff,
    groundRoughness: 0.15,
    groundMetalness: 0.05,
  },
  spring: {
    fogColor: 0x1e3e1e,
    fogDensity: 0.02,
    ambientColor: 0x304830,
    ambientIntensity: 0.8,
    spotColor: 0xd4e8c0,
    spotIntensity: 4,
    groundColor: 0x0a150a,
    treeBottom: 0x0a1a0a,
    treeTop: 0x6ab04c,
    windAmplitude: 0.25,
    bloomIntensity: 1.2,
    noiseOpacity: 0.08,
    cursorColor: 0x6ab04c,
    groundRoughness: 0.65,
    groundMetalness: 0.10,
  },
  summer: {
    fogColor: 0x1a2a3a,
    fogDensity: 0.035,
    ambientColor: 0x303045,
    ambientIntensity: 0.4,
    spotColor: 0x6688aa,
    spotIntensity: 3,
    groundColor: 0x050505,
    treeBottom: 0x0D2B01,
    treeTop: 0x228833,
    windAmplitude: 0.15,
    bloomIntensity: 0.8,
    noiseOpacity: 0.08,
    cursorColor: 0xf0a040,
    groundRoughness: 0.40,
    groundMetalness: 0.60,
  },
  autumn: {
    fogColor: 0x1a1008,
    fogDensity: 0.03,
    ambientColor: 0x504030,
    ambientIntensity: 0.7,
    spotColor: 0xffcc88,
    spotIntensity: 6,
    groundColor: 0x3a1500,
    treeBottom: 0x1a0a05,
    treeTop: 0xcc8822,
    windAmplitude: 0.4,
    bloomIntensity: 0.6,
    noiseOpacity: 0.08,
    cursorColor: 0xe87830,
    groundRoughness: 0.55,
    groundMetalness: 0.30,
  },
};
