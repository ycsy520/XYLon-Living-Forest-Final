export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const CONFIG = {
    // Adaptive Quality
    snowCount: isMobile ? 2000 : 8000,
    treeCount: isMobile ? 60 : 180,
    shadows: !isMobile,
    fogDensity: isMobile ? 0.04 : 0.02,
    camZStart: isMobile ? 40 : 35,
    camZEnd: 5,
    pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
};
