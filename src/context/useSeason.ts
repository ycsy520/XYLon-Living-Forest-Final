/**
 * useSeason - 获取当前季节上下文
 * 必须在 SeasonProvider 内部使用
 */
import { useContext } from 'react';
import { SeasonContext } from './SeasonContextValue';

export const useSeason = () => {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error('useSeason must be used within SeasonProvider');
  return ctx;
};
