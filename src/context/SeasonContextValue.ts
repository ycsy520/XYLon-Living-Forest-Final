/**
 * SeasonContextValue - Context 对象与类型定义
 *
 * 从 SeasonContext.tsx 拆分，符合 Fast Refresh 规则：
 * 组件文件只能导出组件。
 */
import { createContext } from 'react';
import type { Season, SeasonPalette } from './SeasonPalette';

export interface SeasonContextValue {
  season: Season;
  setSeason: (s: Season) => void;
  palette: SeasonPalette;
}

export const SeasonContext = createContext<SeasonContextValue | null>(null);
