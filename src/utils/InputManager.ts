import { isMobile } from './Config';

class InputManager {
    x = 0;
    y = 0;
    targetX = 0;
    targetY = 0;

    constructor() {
        if (typeof window === 'undefined') return;
        this.init();
    }

    init() {
        if (isMobile) {
            window.addEventListener("deviceorientation", this.onGyro.bind(this));
            window.addEventListener("touchmove", this.onTouch.bind(this), { passive: false });
        } else {
            window.addEventListener("mousemove", this.onMouse.bind(this));
        }
        
        // Start update loop
        this.update();
    }

    onMouse(e: MouseEvent) {
        this.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onGyro(e: DeviceOrientationEvent) {
        if (e.gamma === null || e.beta === null) return;
        const x = Math.min(Math.max(e.gamma, -30), 30) / 30;
        const y = Math.min(Math.max(e.beta, -30), 30) / 30;
        this.targetX = x;
        this.targetY = -y;
    }

    onTouch(e: TouchEvent) {
        const t = e.touches[0];
        this.targetX = (t.clientX / window.innerWidth) * 2 - 1;
        this.targetY = -(t.clientY / window.innerHeight) * 2 + 1;
    }

    update = () => {
        this.x += (this.targetX - this.x) * 0.05;
        this.y += (this.targetY - this.y) * 0.05;
        requestAnimationFrame(this.update);
    }
}

export const inputManager = new InputManager();
