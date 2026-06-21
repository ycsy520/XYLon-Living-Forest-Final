/**
 * CanvasErrorBoundary - 捕获 3D 子树内的运行时错误
 *
 * 解决问题：
 * - 纹理加载失败时 useLoader throw Error，不被 Suspense 捕获
 * - 没有 ErrorBoundary 时，Error 冲出 Canvas → React root 卸载 → 黑屏
 *
 * 捕获错误后渲染 null，不破坏整棵 React 树
 */
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export class CanvasErrorBoundary extends React.Component<Props> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[CanvasErrorBoundary] 3D 组件树错误，已降级为 fallback:', error.message);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
