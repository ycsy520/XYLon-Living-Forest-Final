# XYLon Living Forest 🌲❄️

[English](./README.md) | 简体中文

基于 **React Three Fiber**、**Three.js** 和 **WebGL** 构建的高性能沉浸式 3D 互动体验。本项目包含程序化生成的森林、动态雪花粒子系统以及氛围感音频，所有内容均针对现代浏览器进行了优化。

## ✨ 核心特性

*   **程序化森林**：使用 `InstancedMesh` 和自定义顶点着色器（Vertex Shader）模拟风动效果及鼠标交互。
*   **动态雪花系统**：8,000+ 个粒子，配合自定义着色器实现景深（Bokeh）、基于速度的拉伸效果以及深海色调分级。
*   **自适应质量**：根据设备类型（移动端 vs 桌面端）自动调整粒子数量、阴影和渲染分辨率。
*   **平滑滚动**：集成 **Lenis** 实现惯性滚动，并以此驱动摄像机在 3D 场景中的运动。
*   **程序化音频**：使用 Web Audio API 实现实时风声合成，并根据滚动速度产生反应。
*   **后处理效果**：泛光（Bloom）和噪点（Noise）效果，打造电影级视觉质量（仅限桌面端）。

## 🛠 技术栈

*   **框架**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
*   **3D 引擎**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
*   **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **动画**: [GSAP](https://greensock.com/gsap)
*   **滚动**: [Lenis](https://lenis.studiofreight.com/)

## 🚀 快速开始

### 前置要求

*   Node.js (建议 v18 或更高版本)
*   npm 或 yarn

### 安装

1.  克隆仓库：
    ```bash
    git clone https://github.com/ycsy520/XYLon-Living-Forest-Final.git
    cd xylon-living-forest
    ```

2.  安装依赖：
    ```bash
    npm install
    ```

3.  启动开发服务器：
    ```bash
    npm run dev
    ```

4.  构建生产版本：
    ```bash
    npm run build
    ```

## 🧩 组件指南

本项目模块化为可复用的 3D 组件。

### 1. Forest (`src/components/Forest.tsx`)
核心环境组件。
*   **技术**: 使用 `InstancedMesh` 通过一次绘制调用渲染数百棵树。
*   **Shader 逻辑**:
    *   **风**: 使用 `sin(uTime + position.x)` 进行顶点着色器操作。
    *   **交互**: 使用 `smoothstep` 和距离计算，使树木避开鼠标/触摸位置。
    *   **几何体**: 优化的圆锥体几何（`ConeGeometry`）。

### 2. Snow (`src/components/Snow.tsx`)
高性能粒子系统。
*   **Props**:
    *   `scrollVelocity`: 引用对象，将滚动速度传递给 Shader 以实现“极速穿越”效果。
*   **技术**: `THREE.Points` 配合自定义 `ShaderMaterial`。
*   **视觉效果**:
    *   **散景 (Bokeh)**: 基于随机属性柔化粒子边缘，模拟景深。
    *   **颜色**: 从冷蓝 (`#6699CC`) 到暖白 (`#FFF`) 的渐变。

### 3. Monolith (`src/components/Monolith.tsx`)
场景的中心焦点。
*   **几何体**: 组合了二十面体几何（`IcosahedronGeometry`，实体）和线框几何（`WireframeGeometry`）。
*   **动画**: 使用 `useFrame` 实现缓慢旋转和悬浮。
*   **优化**: 在 `useEffect` 中显式处理资源销毁（disposal）以防止内存泄漏。

### 4. Scene (`src/components/Scene.tsx`)
主要场景容器。
*   **职责**: 设置 `Canvas`、灯光、雾效、后处理和摄像机逻辑。
*   **滚动集成**: 将 `Lenis` 的滚动进度连接到摄像机的 Z 轴位置。

## ⚙️ 配置

您可以在 `src/utils/Config.ts` 中调整体验设置。系统会自动检测移动设备并降低质量设置。

```typescript
// src/utils/Config.ts

export const CONFIG = {
    // 雪花粒子数量 (对性能影响较大)
    snowCount: isMobile ? 2000 : 8000,
    
    // 森林中树木的数量
    treeCount: isMobile ? 60 : 180,
    
    // 启用/禁用实时阴影
    shadows: !isMobile,
    
    // 雾的密度，用于营造大气深度
    fogDensity: isMobile ? 0.04 : 0.02,
    
    // 摄像机起始/结束位置 (滚动范围)
    camZStart: isMobile ? 40 : 35,
    camZEnd: 5,
    
    // 渲染分辨率 (DPR)
    pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
};
```

## 📂 目录结构

```
src/
├── components/       # 3D 和 UI 组件
│   ├── Forest.tsx    # 实例化树木
│   ├── Snow.tsx      # 粒子系统
│   ├── Monolith.tsx  # 中心图腾
│   ├── Scene.tsx     # Canvas 设置
│   ├── UI.tsx        # HTML 覆盖层
│   └── Cursor.tsx    # 自定义光标
├── utils/            # 逻辑与辅助函数
│   ├── AudioEngine.ts# Web Audio API 实现
│   ├── Config.ts     # 全局设置
│   └── InputManager.ts # 鼠标/触摸/陀螺仪处理
├── App.tsx           # 主入口
└── index.css         # Tailwind & 全局样式
```

## 🎨 自定义

*   **颜色**: 要更改主题，请修改 `Forest.tsx` 和 `Snow.tsx` 中的 `ShaderMaterial` uniform 变量，或更新 `index.css` 中的 `background` 渐变。
*   **滚动长度**: 调整 `App.tsx` 中的 `height: 500vh` div 以控制滚动体验的持续时间。

## 📄 许可证

MIT
