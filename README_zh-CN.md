# XYLon Living Forest 🌲❄️

[English](./README.md) | 简体中文

基于 **React Three Fiber**、**Three.js** 和 **WebGL** 构建的高性能沉浸式 3D 互动体验。本项目包含程序化生成的森林、四季天气系统、体素篝火火焰以及氛围感音频，所有内容均针对现代浏览器进行了优化。

## ✨ 核心特性

* **四季系统**：支持春/夏/秋/冬四季动态切换，雾效、灯光、地面、树木颜色平滑过渡。
* **程序化森林**：使用 `InstancedMesh` + 自定义顶点着色器，一次绘制调用渲染数百棵树，支持风动模拟和鼠标交互。
* **天气系统**：冬季雪花（8000+ 粒子）和夏季雨滴粒子系统，自定义着色器实现散景、速度拉伸和透明度过渡。
* **体素篝火**：使用 `@wolffo/three-fire` 光线步进着色器渲染体素火焰（仅春/秋），配合闪烁 PointLight 和深度感知渲染。
* **自适应质量**：根据设备类型（移动端 vs 桌面端）自动调整粒子数量、阴影和渲染分辨率。
* **平滑滚动**：集成 **Lenis** 实现惯性滚动，驱动摄像机在 3D 场景中的运动。
* **氛围音频**：四季环境音效，支持交叉淡入淡出、预加载优化和浏览器自动播放策略兼容。
* **季节光标**：自定义光标随季节变色，惯性跟踪鼠标。
* **后处理效果**：泛光（Bloom）和噪点（Noise）效果，打造电影级视觉质量（仅限桌面端）。

## 🛠 技术栈

* **框架**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
* **3D 引擎**: [Three.js r183](https://threejs.org/) + [React Three Fiber v9](https://docs.pmnd.rs/react-three-fiber)
* **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
* **动画**: [GSAP](https://greensock.com/gsap)
* **滚动**: [Lenis](https://lenis.studiofreight.com/)
* **体素火焰**: [@wolffo/three-fire](https://github.com/typeWolffo/THREE.Fire)

## 🚀 快速开始

### 前置要求

* Node.js (建议 v18 或更高版本)
* npm 或 yarn

### 安装

1. 克隆仓库：

    ```bash
    git clone https://github.com/ycsy520/XYLon-Living-Forest-Final.git
    cd XYLon-Living-Forest-Final
    ```

2. 安装依赖：

    ```bash
    npm install
    ```

3. 启动开发服务器：

    ```bash
    npm run dev
    ```

4. 构建生产版本：

    ```bash
    npm run build
    ```

## 🧩 组件架构

### Scene (`src/components/Scene.tsx`)

主场景容器。设置 `Canvas`、灯光、雾效、地面、后处理、摄像机控制和 Lenis 滚动集成。

### Forest (`src/components/Forest.tsx`)

程序化森林，使用 `InstancedMesh` + 自定义 `ShaderMaterial`。

* **风动**：双频 `sin()` 顶点着色器动画。
* **交互**：树木远离鼠标/触摸位置弯曲（`smoothstep` + 距离计算）。
* **几何体**：优化的 `ConeGeometry`，支持树顶和树底颜色插值。

### Campfire (`src/components/Campfire.tsx`)

FBX 篝火模型 + 体素火焰效果。

* **体素火焰**：`@wolffo/three-fire` 光线步进着色器（仅春/秋）。
* **点光源**：正弦闪烁强度动画。
* **季节感知**：火焰和灯光仅在春/秋激活，夏/冬休眠。

### 天气系统 (`src/components/weather/`)

| 组件 | 季节 | 技术 |
|------|------|------|
| `WinterSnow.tsx` | 冬季 | `THREE.Points` + 自定义着色器（散景、速度拉伸、深海色调） |
| `SummerRain.tsx` | 夏季 | `THREE.Points` + 水花涟漪着色器，双绘制调用 |

两者均使用 `uAlpha` uniform 插值实现平滑过渡——无 mount/unmount 闪烁。

### 季节系统 (`src/context/`)

* `SeasonPalette.ts`：四季类型安全调色板常量（雾、灯光、地面、树木、光标色、地面粗糙度/金属度）。
* `SeasonContext.tsx`：React Context，`useMemo` 包裹 value 对象以减少重渲染。
* `useScenePalette.ts`：可变引用 lerp hook——60fps 平滑插值，收敛后停止 setState 优化。

### 音频引擎 (`src/utils/AudioEngine.ts`)

* **预加载**：loading 阶段下载默认季节音频。
* **开始播放**：用户点击 ENTER 时 resume AudioContext，立即播放。
* **交叉淡入淡出**：季节切换时 gain-based 交叉淡入淡出，定时器管理暂停。

### 输入管理器 (`src/utils/InputManager.ts`)

处理鼠标、触摸和陀螺仪输入，RAF 平滑。支持 `destroy()` 清理。

## ⚙️ 配置

你可以在 `src/utils/Config.ts` 中调整体验设置。系统会自动检测移动设备并降低质量。

```typescript
// src/utils/Config.ts

export const CONFIG = {
    // 雪/雨粒子数量（对性能影响较大）
    snowCount: isMobile ? 2000 : 8000,
    rainCount: isMobile ? 1500 : 5000,
    
    // 森林中树木的数量
    treeCount: isMobile ? 60 : 180,
    
    // 启用/禁用实时阴影
    shadows: !isMobile,
    
    // 雾的密度，用于营造大气深度
    fogDensity: isMobile ? 0.04 : 0.02,
    
    // 摄像机起始/结束位置（滚动范围）
    camZStart: isMobile ? 40 : 35,
    camZEnd: 5,
    
    // 渲染分辨率（DPR）
    pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
};
```

## 📂 目录结构

```
src/
├── App.tsx                   # 主入口，布局组合
├── main.tsx                  # React 根挂载
├── index.css                 # Tailwind & 全局样式
├── components/
│   ├── Scene.tsx             # Canvas、灯光、雾效、地面、后处理
│   ├── Forest.tsx            # 风动着色器实例化树木
│   ├── Campfire.tsx          # FBX 模型 + 体素火焰
│   ├── UI.tsx                # Loading 屏、ENTER 按钮、季节菜单、声音开关
│   ├── Cursor.tsx            # 季节变色自定义光标
│   └── weather/
│       ├── WinterSnow.tsx    # 雪花粒子系统
│       └── SummerRain.tsx    # 雨滴 + 水花粒子系统
├── context/
│   ├── SeasonPalette.ts      # 四季调色板常量 & 类型
│   ├── SeasonContext.tsx      # React Context Provider
│   ├── SeasonContextValue.ts  # Context 类型定义
│   └── useSeason.ts          # 消费者 hook
├── hooks/
│   └── useScenePalette.ts    # 可变引用 lerp hook，平滑过渡
└── utils/
    ├── AudioEngine.ts        # 四季音频 + 交叉淡入淡出
    ├── Config.ts             # 设备自适应设置
    ├── InputManager.ts       # 鼠标/触摸/陀螺仪输入处理
    └── FireTexture.ts        # 运行时 Canvas 生成火焰纹理
```

## 🎨 自定义

* **季节**：修改 `src/context/SeasonPalette.ts` 中的调色板常量，可调整颜色、雾密度、灯光强度、地面粗糙度和光标颜色。
* **天气**：在 `Config.ts` 中调整粒子数量。着色器 uniform（散景、拉伸、颜色）在各天气组件内。
* **滚动长度**：调整 `App.tsx` 中 `height: 500vh` 的 div 控制滚动体验时长。
* **音频**：替换 `public/white_noise/` 中的 MP3 文件即可使用自定义环境音。

## 📄 许可证

MIT
