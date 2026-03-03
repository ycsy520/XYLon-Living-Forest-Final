XYLon | Living Forest

一个探索 WebGL 程序化生成、着色器艺术与沉浸式交互的实验性作品集网站。

An experimental portfolio exploring procedural generation, shader art, and immersive interaction.

🔗 在线演示: [点击这里查看 (替换为您的部署链接)]

🌲 项目概述 (Overview)

XYLon | Living Forest 不仅仅是一个网站，它是一个运行在浏览器中的“数字生态系统”。通过数学算法实时生成森林、积雪和风暴，摒弃了传统的图片贴图，实现了极小的体积与无限的细节。

核心特性 (Key Features)

🎨 程序化森林 (Procedural Forest): 使用 InstancedMesh 和自定义顶点着色器生成的 3D 雪松，随风摇曳。

❄️ 着色器积雪 (Shader-Based Accumulation): 独特的着色器算法模拟雪花在物体表面的物理堆积感。

🔊 生成式音频 (Generative Audio): 基于 Web Audio API 实时合成的风声与环境音，无需加载外部音频文件。

📱 移动端陀螺仪 (Gyroscope Parallax): 移动设备支持倾斜视差，带来原生 App 般的交互体验。

⚡ 智能性能分级 (LOD System): 自动检测设备性能，动态调整粒子数量与渲染质量。

🎞️ 电影级后处理 (Cinematic Post-Processing): 集成 Bloom (辉光)、Film Grain (噪点) 和 FXAA 抗锯齿。

🛠️ 技术栈 (Tech Stack)

Core: HTML5, Tailwind CSS

WebGL Engine: Three.js (r128)

Animation: GSAP (ScrollTrigger)

Smooth Scroll: Lenis

Post-Processing: Three.js EffectComposer (UnrealBloom, FilmPass, FXAA)

🚀 快速开始 (Quick Start)

由于本项目采用了 Single File Component (单文件组件) 架构且完全基于 CDN，您不需要复杂的构建步骤（如 Webpack 或 Vite）。

本地运行 (Local Development)

您只需要一个静态文件服务器即可运行。

方法 A: 使用 VS Code (推荐)

安装 "Live Server" 扩展。

右键点击 XYLon_Living_Forest_Final.html。

选择 "Open with Live Server"。

方法 B: 使用 Python

# 在项目目录下运行
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000/XYLon_Living_Forest_Final.html


方法 C: 使用 Node.js

npx http-server .


📦 部署指南 (Deployment)

您可以将此项目免费部署到任何静态托管服务。

Vercel / Netlify (推荐)

将项目推送到 GitHub/GitLab。

在 Vercel/Netlify 中导入仓库。

关键设置:

确保 XYLon_Living_Forest_Final.html 位于根目录。

如果需要，将其重命名为 index.html 以便作为默认主页访问。

点击 Deploy。

GitHub Pages

将文件重命名为 index.html。

推送到仓库的 main 分支。

在仓库 Settings -> Pages 中开启 GitHub Pages。

📂 文件结构 (File Structure)

.
├── XYLon_Living_Forest_Final.html  # 核心入口文件 (包含所有逻辑)
├── robots.txt                      # 搜索引擎爬虫配置
├── site.webmanifest                # PWA 配置 (可选)
└── README.md                       # 说明文档


⚠️ 注意事项 (Notes)

CDN 依赖: 本项目依赖 cdnjs 和 unpkg 加载库文件。如果部署在中国大陆服务器，建议替换为国内 CDN 源（如 bootcdn）以提高加载速度。

浏览器兼容性: 需要支持 WebGL 2.0 的现代浏览器（Chrome, Firefox, Safari, Edge）。

📜 许可证 (License)

MIT License © 2026 XYLon Studio
