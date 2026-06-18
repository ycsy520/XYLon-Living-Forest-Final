import { isMobile } from './Config';

class InputManager {
    x = 0;
    y = 0;
    targetX = 0;
    targetY = 0;
    private _rafId = 0;
    private _boundUpdate!: () => void;
    private _boundOnMouse!: (e: MouseEvent) => void;
    private _boundOnGyro!: (e: DeviceOrientationEvent) => void;
    private _boundOnTouch!: (e: TouchEvent) => void;

    constructor() {
        if (typeof window === 'undefined') return;
        // H-01 修复：预绑定函数引用，确保 removeEventListener 能正确移除
        this._boundUpdate = this.update.bind(this);
        this._boundOnMouse = this.onMouse.bind(this);
        this._boundOnGyro = this.onGyro.bind(this);
        this._boundOnTouch = this.onTouch.bind(this);
        this.init();
    }

    init() {
        if (isMobile) {
            window.addEventListener("deviceorientation", this._boundOnGyro);
            window.addEventListener("touchmove", this._boundOnTouch, { passive: false });
        } else {
            window.addEventListener("mousemove", this._boundOnMouse);
        }
        this._rafId = requestAnimationFrame(this._boundUpdate);
    }

    /** H-01 修复：停止 RAF 循环并移除事件监听（HMR / 组件卸载时调用） */
    destroy() {
        cancelAnimationFrame(this._rafId);
        window.removeEventListener("mousemove", this._boundOnMouse);
        window.removeEventListener("deviceorientation", this._boundOnGyro);
        window.removeEventListener("touchmove", this._boundOnTouch);
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

    update() {
        this.x += (this.targetX - this.x) * 0.05;
        this.y += (this.targetY - this.y) * 0.05;
        this._rafId = requestAnimationFrame(this._boundUpdate);
    }
}

export const inputManager = new InputManager();
