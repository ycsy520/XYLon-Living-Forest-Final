/**
 * SeasonContext - 四季系统状态管理
 *
 * 职责：提供 SeasonProvider 组件，包裹整个应用以提供季节状态
 *
 * 类型定义在 SeasonPalette.ts，context 在 SeasonContextValue.ts，
 * hook 在 useSeason.ts，保持每个文件职责单一。
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SEASONS, type Season } from './SeasonPalette';
import { SeasonContext } from './SeasonContextValue';
import { AudioEngine } from '../utils/AudioEngine';

export const SeasonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [season, setSeasonState] = useState<Season>('winter');

  const setSeason = useCallback((s: Season) => {
    setSeasonState(s);
  }, []);

  // 应用启动时预加载默认季节音频（loading 阶段完成下载）
  useEffect(() => {
    AudioEngine.preload();
  }, []);

  // 季节切换时同步更新音效预设
  useEffect(() => {
    AudioEngine.setSeason(season);
  }, [season]);

  const palette = SEASONS[season];
  const contextValue = useMemo(() => ({ season, setSeason, palette }), [season, setSeason, palette]);

  return (
    <SeasonContext.Provider value={contextValue}>
      {children}
    </SeasonContext.Provider>
  );
};
