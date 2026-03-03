# XYLon Living Forest 🌲❄️

A high-performance, immersive 3D interactive experience built with **React Three Fiber**, **Three.js**, and **WebGL**. This project features a procedurally generated forest, a dynamic particle snow system, and atmospheric audio, all optimized for modern web browsers.

![Project Preview](https://via.placeholder.com/800x400?text=XYLon+Living+Forest+Preview)

## ✨ Core Features

*   **Procedural Forest**: Instanced meshes with custom vertex shaders for wind simulation and mouse interaction.
*   **Dynamic Snow System**: 8,000+ particles with custom shaders implementing depth-of-field (bokeh), velocity-based stretching, and deep-sea color grading.
*   **Adaptive Quality**: Automatically adjusts particle count, shadows, and render resolution based on device type (Mobile vs. Desktop).
*   **Smooth Scrolling**: Integrated **Lenis** for inertial scrolling that drives the camera movement through the 3D scene.
*   **Procedural Audio**: Real-time wind sound synthesis using the Web Audio API, reacting to scroll velocity.
*   **Post-Processing**: Bloom and Noise effects for cinematic visual quality (Desktop only).

## 🛠 Tech Stack

*   **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
*   **3D Engine**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animation**: [GSAP](https://greensock.com/gsap)
*   **Scroll**: [Lenis](https://lenis.studiofreight.com/)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ycsy520e/xylon-living-forest.git
    cd xylon-living-forest
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Build for production:
    ```bash
    npm run build
    ```

## 🧩 Components Guide

The project is modularized into reusable 3D components.

### 1. Forest (`src/components/Forest.tsx`)
The core environment component.
*   **Technique**: Uses `InstancedMesh` to render hundreds of trees with a single draw call.
*   **Shader Logic**:
    *   **Wind**: Vertex shader manipulation using `sin(uTime + position.x)`.
    *   **Interaction**: Trees bend away from the mouse/touch position using `smoothstep` and distance calculation.
    *   **Geometry**: Optimized `ConeGeometry`.

### 2. Snow (`src/components/Snow.tsx`)
A high-performance particle system.
*   **Props**:
    *   `scrollVelocity`: Ref object to pass scroll speed to the shader for "warp speed" effects.
*   **Technique**: `THREE.Points` with a custom `ShaderMaterial`.
*   **Visuals**:
    *   **Bokeh**: Simulates depth of field by softening particle edges based on a random attribute.
    *   **Color**: Gradients from cold blue (`#6699CC`) to warm white (`#FFF`).

### 3. Monolith (`src/components/Monolith.tsx`)
The central focal point of the scene.
*   **Geometry**: Combined `IcosahedronGeometry` (solid) and `WireframeGeometry`.
*   **Animation**: Slowly rotates and floats using `useFrame`.
*   **Optimization**: Explicit resource disposal in `useEffect` to prevent memory leaks.

### 4. Scene (`src/components/Scene.tsx`)
The main composition container.
*   **Responsibility**: Sets up the `Canvas`, Lights, Fog, Post-processing, and Camera Logic.
*   **Scroll Integration**: Connects `Lenis` scroll progress to the camera's Z-position.

## ⚙️ Configuration

You can tweak the experience in `src/utils/Config.ts`. The system automatically detects mobile devices to downgrade quality settings.

```typescript
// src/utils/Config.ts

export const CONFIG = {
    // Number of snow particles (High impact on performance)
    snowCount: isMobile ? 2000 : 8000,
    
    // Number of trees in the forest
    treeCount: isMobile ? 60 : 180,
    
    // Enable/Disable real-time shadows
    shadows: !isMobile,
    
    // Fog density for atmospheric depth
    fogDensity: isMobile ? 0.04 : 0.02,
    
    // Camera start/end positions (Scroll range)
    camZStart: isMobile ? 40 : 35,
    camZEnd: 5,
    
    // Render resolution (DPR)
    pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
};
```

## 📂 Directory Structure

```
src/
├── components/       # 3D and UI Components
│   ├── Forest.tsx    # Instanced Trees
│   ├── Snow.tsx      # Particle System
│   ├── Monolith.tsx  # Centerpiece
│   ├── Scene.tsx     # Canvas Setup
│   ├── UI.tsx        # HTML Overlay
│   └── Cursor.tsx    # Custom Cursor
├── utils/            # Logic & Helpers
│   ├── AudioEngine.ts# Web Audio API implementation
│   ├── Config.ts     # Global settings
│   └── InputManager.ts # Mouse/Touch/Gyro handling
├── App.tsx           # Main Entry
└── index.css         # Tailwind & Global Styles
```

## 🎨 Customization

*   **Colors**: To change the theme, modify the `ShaderMaterial` uniforms in `Forest.tsx` and `Snow.tsx`, or update the `background` gradient in `index.css`.
*   **Scroll Length**: Adjust the `height: 500vh` div in `App.tsx` to control the duration of the scroll experience.

## 📄 License

MIT
