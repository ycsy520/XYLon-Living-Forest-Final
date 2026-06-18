# XYLon Living Forest 🌲❄️

English | [简体中文](./README_zh-CN.md)

A high-performance, immersive 3D interactive experience built with **React Three Fiber**, **Three.js**, and **WebGL**. This project features a procedurally generated forest, four-season weather systems, volumetric campfire, and atmospheric audio — all optimized for modern web browsers.

## ✨ Core Features

* **Four Seasons System**: Dynamic season switching (Spring/Summer/Autumn/Winter) with smooth palette transitions for fog, lighting, ground, and trees.
* **Procedural Forest**: `InstancedMesh` with custom vertex shaders for wind simulation and mouse interaction — hundreds of trees in a single draw call.
* **Weather Systems**: Seasonal snow (Winter) and rain (Summer) particle systems with custom shaders for bokeh, velocity-based stretching, and alpha transitions.
* **Volumetric Campfire**: Ray-marched fire effect (Spring/Autumn) using `@wolffo/three-fire`, with flickering PointLight and depth-aware rendering.
* **Adaptive Quality**: Automatically adjusts particle count, shadows, and render resolution based on device type (Mobile vs. Desktop).
* **Smooth Scrolling**: Integrated **Lenis** for inertial scrolling that drives camera movement through the 3D scene.
* **Atmospheric Audio**: Four-season ambient soundtracks with crossfade transitions, preload optimization, and browser autoplay policy compliance.
* **Season-Aware Cursor**: Custom cursor with per-season color theming and inertial tracking.
* **Post-Processing**: Bloom and Noise effects for cinematic visual quality (Desktop only).

## 🛠 Tech Stack

* **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
* **3D Engine**: [Three.js r183](https://threejs.org/) + [React Three Fiber v9](https://docs.pmnd.rs/react-three-fiber)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animation**: [GSAP](https://greensock.com/gsap)
* **Scroll**: [Lenis](https://lenis.studiofreight.com/)
* **Volumetric Fire**: [@wolffo/three-fire](https://github.com/typeWolffo/THREE.Fire)

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/ycsy520/XYLon-Living-Forest-Final.git
    cd XYLon-Living-Forest-Final
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Build for production:

    ```bash
    npm run build
    ```

## 🧩 Component Architecture

### Scene (`src/components/Scene.tsx`)

The main composition container. Sets up `Canvas`, lighting, fog, ground, post-processing, camera control, and Lenis scroll integration.

### Forest (`src/components/Forest.tsx`)

Procedural forest using `InstancedMesh` + custom `ShaderMaterial`.

* **Wind**: Vertex shader with dual-frequency `sin()` animation.
* **Interaction**: Trees bend away from mouse/touch using `smoothstep` and distance calculation.
* **Geometry**: Optimized `ConeGeometry` with tree-top and tree-bottom color interpolation.

### Campfire (`src/components/Campfire.tsx`)

FBX campfire model with volumetric fire effect.

* **Volumetric Fire**: `@wolffo/three-fire` ray-marching shader (Spring/Autumn only).
* **PointLight**: Flickering fire light with sinusoidal intensity animation.
* **Season-Aware**: Fire and light active only in Spring/Autumn; dormant in Summer/Winter.

### Weather System (`src/components/weather/`)

| Component | Season | Technique |
|-----------|--------|-----------|
| `WinterSnow.tsx` | Winter | `THREE.Points` + custom shader with bokeh, velocity stretching, deep-sea color grading |
| `SummerRain.tsx` | Summer | `THREE.Points` + splash ripple shader, dual draw calls |

Both use `uAlpha` uniform lerp for smooth transitions — no mount/unmount flicker.

### Season System (`src/context/`)

* `SeasonPalette.ts`: Type-safe palette constants for all four seasons (fog, lights, ground, trees, cursor color, ground roughness/metalness).
* `SeasonContext.tsx`: React Context with `useMemo`-wrapped value for minimal re-renders.
* `useScenePalette.ts`: Mutable-ref lerp hook — smooth 60fps interpolation with convergence-based setState optimization.

### Audio Engine (`src/utils/AudioEngine.ts`)

* **Preload**: Loads default season audio during loading screen.
* **Start**: Resumes AudioContext on user interaction (ENTER click), then plays.
* **Crossfade**: Season switching with gain-based crossfade and timer-managed pause.

### Input Manager (`src/utils/InputManager.ts`)

Handles mouse, touch, and gyroscope input with RAF-based smoothing. Supports `destroy()` for cleanup.

## ⚙️ Configuration

You can tweak the experience in `src/utils/Config.ts`. The system automatically detects mobile devices to downgrade quality settings.

```typescript
// src/utils/Config.ts

export const CONFIG = {
    // Snow/rain particle count (High impact on performance)
    snowCount: isMobile ? 2000 : 8000,
    rainCount: isMobile ? 1500 : 5000,
    
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
├── App.tsx                   # Main entry, layout composition
├── main.tsx                  # React root mount
├── index.css                 # Tailwind & global styles
├── components/
│   ├── Scene.tsx             # Canvas, lights, fog, ground, post-processing
│   ├── Forest.tsx            # Instanced trees with wind shader
│   ├── Campfire.tsx          # FBX model + volumetric fire
│   ├── UI.tsx                # Loading screen, ENTER button, season menu, sound toggle
│   ├── Cursor.tsx            # Season-aware custom cursor
│   └── weather/
│       ├── WinterSnow.tsx    # Snow particle system
│       └── SummerRain.tsx    # Rain + splash particle system
├── context/
│   ├── SeasonPalette.ts      # Four-season palette constants & types
│   ├── SeasonContext.tsx      # React Context provider
│   ├── SeasonContextValue.ts  # Context type definition
│   └── useSeason.ts          # Consumer hook
├── hooks/
│   └── useScenePalette.ts    # Mutable-ref lerp hook for smooth transitions
└── utils/
    ├── AudioEngine.ts        # Four-season audio with crossfade
    ├── Config.ts             # Device-adaptive settings
    ├── InputManager.ts       # Mouse/touch/gyro input handling
    └── FireTexture.ts        # Runtime canvas-generated fire texture
```

## 🎨 Customization

* **Seasons**: Modify palette constants in `src/context/SeasonPalette.ts` to change colors, fog density, lighting intensity, ground roughness, and cursor colors per season.
* **Weather**: Adjust particle counts in `Config.ts`. Shader uniforms (bokeh, stretch, color) are in each weather component.
* **Scroll Length**: Adjust the `height: 500vh` div in `App.tsx` to control the scroll experience duration.
* **Audio**: Replace MP3 files in `public/white_noise/` with your own ambient tracks.

## 📄 License

MIT
