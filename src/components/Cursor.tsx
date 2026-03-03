import { useEffect, useRef } from 'react';
import { isMobile } from '../utils/Config';

export const Cursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

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
        posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.15;
        posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.15;
        
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
            cursorRef.current?.classList.add('scale-[3]', 'bg-[#38bdf8]', 'mix-blend-difference');
            cursorRef.current?.classList.remove('border-[#38bdf8]/50');
        } else {
            cursorRef.current?.classList.remove('scale-[3]', 'bg-[#38bdf8]', 'mix-blend-difference');
            cursorRef.current?.classList.add('border-[#38bdf8]/50');
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
      <div ref={cursorRef} className="fixed w-5 h-5 border border-[#38bdf8]/50 rounded-full pointer-events-none z-[10001] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out" style={{ left: '50%', top: '50%' }}></div>
      <div ref={dotRef} className="fixed w-1 h-1 bg-[#38bdf8] rounded-full pointer-events-none z-[10001] -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '50%' }}></div>
    </>
  );
};
