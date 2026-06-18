/**
 * FireTexture - 运行时生成火焰灰度纹理
 *
 * 使用 Canvas2D API 生成一张从底到上白→灰→黑的径向渐变图，
 * 供 @wolffo/three-fire 的 Fire 组件使用。
 * 避免依赖外部 PNG 文件，无需额外网络请求。
 */
import { CanvasTexture } from 'three';

export function createFireTexture(width = 180, height = 360): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 基础径向 + 线性渐变：底部中心白亮 → 顶部边缘全黑
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 水平距离（0=中心, 1=边缘）
      const dx = (x / width - 0.5) * 2;
      // 垂直距离（0=底部, 1=顶部）
      const dy = y / height;

      // 径向衰减：中心亮，边缘暗
      const radial = 1 - Math.abs(dx) * 1.6;

      // 垂直衰减：底部最亮，顶部渐暗
      const vertical = 1 - dy * 1.3;

      // 混合：底部中心最亮
      let v = radial * vertical;

      // 夹持到 [0, 1]
      v = Math.max(0, Math.min(1, v));

      // 加一点随机噪音模拟火焰颗粒感
      const noise = (Math.random() - 0.5) * 0.05;
      v = Math.max(0, Math.min(1, v + noise));

      const gray = Math.floor(v * 255);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // 整体高斯模糊一次，柔化火焰边缘
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.drawImage(canvas, -1, 0);
    ctx.drawImage(canvas, 1, 0);
    ctx.drawImage(canvas, 0, -1);
    ctx.drawImage(canvas, 0, 1);
  }
  ctx.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
