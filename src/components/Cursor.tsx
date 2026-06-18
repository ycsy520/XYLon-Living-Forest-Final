import { useEffect, useRef, useMemo } from 'react';
import { isMobile } from '../utils/Config';
import { useSeason } from '../context/useSeason';

/**
 * 将 hex 数值转为 CSS 颜色字符串
 */
function hexToCss(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}

export const Cursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const { palette } = useSeason();
  const cursorColor = useMemo(() => hexToCss(palette.cursorColor), [palette.cursorColor]);

  useEffect(() => {
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        if (dotRef.current) {
            dotRef.current.style.left = `${e.clientX}px`;
            dotRef.current.style.top = `${e.clientY}px`;
        }
    };

    const animate = () => {
        posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.08;
        posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.08;
        
        if (cursorRef.current) {
            cursorRef.current.style.left = `${posRef.current.x}px`;
            cursorRef.current.style.top = `${posRef.current.y}px`;
        }
        requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    const animId = requestAnimationFrame(animate);

    const onMouseOver = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('a, button, .hover-target')) {
            cursorRef.current?.classList.add('scale-[2]', 'mix-blend-difference');
        } else {
            cursorRef.current?.classList.remove('scale-[2]', 'mix-blend-difference');
        }
    };

    document.addEventListener('mouseover', onMouseOver);

    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseover', onMouseOver);
        cancelAnimationFrame(animId);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* 外环 — 32px，季节着色，不透明度 50% */}
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 border rounded-full pointer-events-none z-[10001] -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out"
        style={{
          left: '50%',
          top: '50%',
          borderColor: cursorColor + '80',
          boxShadow: `0 0 16px ${cursorColor}30`,
        }}
      />
      {/* 中心点 — 6px，季节实心色 */}
      <div
        ref={dotRef}
        className="fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[10001] -translate-x-1/2 -translate-y-1/2"
        style={{
          left: '50%',
          top: '50%',
          backgroundColor: cursorColor,
        }}
      />
    </>
  );
};
