import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { AudioEngine } from '../utils/AudioEngine';
import { isMobile } from '../utils/Config';
import { useSeason } from '../context/useSeason';
import type { Season } from '../context/SeasonPalette';

const SEASON_LABELS: Record<Season, string> = {
  spring: 'SPRING',
  summer: 'SUMMER',
  autumn: 'AUTUMN',
  winter: 'WINTER',
};

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

interface UIProps {
  onEnter: () => void;
}

export const UI: React.FC<UIProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const { season, setSeason } = useSeason();

  useEffect(() => {
    // Loader Logic
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const target = document.getElementById("decode-target");
    if (target) {
      const originalText = target.innerText;
      let iterations = 0;
      const interval = setInterval(() => {
        target.innerText = originalText
          .split("")
          .map((_, index) => {
            if (index < iterations) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 3;
      }, 30);
    }

    let p = 0;
    const loadInt = setInterval(() => {
      p += Math.random() * 8;
      if (p > 100) p = 100;
      setProgress(Math.floor(p));

      if (p === 100) {
        clearInterval(loadInt);
        if (enterBtnRef.current) {
            gsap.to(enterBtnRef.current, {
                opacity: 1,
                pointerEvents: "all",
                duration: 0.5,
            });
        }
      }
    }, 100);
    
    // Audio Toggle Listener
    const handleAudioToggle = (e: CustomEvent) => {
        setAudioEnabled(e.detail);
    };
    window.addEventListener('audio-toggle', handleAudioToggle as EventListener);

    return () => {
        window.removeEventListener('audio-toggle', handleAudioToggle as EventListener);
        clearInterval(loadInt);
    };
  }, []);

  const handleEnter = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (isMobile && (typeof DeviceOrientationEvent !== "undefined") && (DeviceOrientationEvent as any).requestPermission) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (DeviceOrientationEvent as any).requestPermission().catch(console.error);
    }
    AudioEngine.start().catch(console.error);

    gsap.to(loaderRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: "expo.inOut",
      onComplete: () => {
        onEnter();
      }
    });

    gsap.to(".intro-anim", {
      y: 0,
      opacity: 1,
      duration: 1.5,
      stagger: 0.1,
      delay: 0.3,
      ease: "power4.out",
    });
  };

  return (
    <>
      {/* LOADER */}
      <div id="loader" ref={loaderRef} className="fixed inset-0 z-[10000] bg-black flex flex-col justify-center items-center transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)]">
        <div className="relative w-[800px] h-[100px] text-center">
          <div className="decode-text font-syne text-[3rem] font-extrabold tracking-[0.2em] text-white uppercase" id="decode-target">LIVING FOREST</div>
        </div>
        
        <button
          ref={enterBtnRef}
          id="enter-btn"
          className="hover-target absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 px-10 py-4 border border-white/20 rounded-full font-mono text-xs tracking-widest text-white bg-transparent cursor-none opacity-0 pointer-events-none transition-all duration-400 overflow-hidden hover:text-black hover:border-white group"
          onClick={handleEnter}
        >
          <span className="relative z-10">ENTER EXPERIENCE</span>
          <div className="absolute inset-0 bg-white transform scale-x-0 origin-right transition-transform duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-x-100 group-hover:origin-left z-0"></div>
        </button>

        <div className="absolute bottom-10 w-full flex justify-between px-10 text-[10px] text-white/40 uppercase">
          <span className="mono-font">{progress === 100 ? "SYSTEM READY" : "INITIALIZING SYSTEM..."}</span>
          <span className="mono-font">{progress}%</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10">
          <div className="h-full bg-white transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* MAIN UI */}
      <nav className="fixed top-0 left-0 w-full px-6 py-6 md:px-8 md:py-8 flex justify-between items-center z-50 mix-blend-difference text-white pointer-events-auto">
        <a href="#" className="text-sm md:text-lg font-bold tracking-[0.2em] brand-font hover-target opacity-0 intro-anim translate-y-10">XYLON</a>
        <div className="flex gap-3 md:gap-6 text-[10px] md:text-xs uppercase tracking-widest opacity-0 intro-anim translate-y-10 items-center">
          {SEASON_ORDER.map((s) => (
            <span
              key={s}
              className={`cursor-pointer transition-colors duration-300 hover-target ${
                season === s ? 'text-[#38bdf8]' : 'text-white/40 hover:text-white/80'
              }`}
              onClick={() => setSeason(s)}
            >
              {SEASON_LABELS[s]}
            </span>
          ))}
          <span className="text-white/20">|</span>
          <span 
            className="cursor-pointer hover:text-indigo-400 transition-colors"
            onClick={() => AudioEngine.toggle()}
          >
            {audioEnabled ? "[ SOUND ON ]" : "[ SOUND OFF ]"}
          </span>
        </div>
      </nav>

      <div className="ui-layer fixed inset-0 pointer-events-none z-10 flex flex-col justify-center px-[5vw]">
        <div className="overflow-hidden mb-2 md:mb-4">
          <p className="text-[10px] md:text-sm uppercase tracking-[0.2em] opacity-60 text-white mix-blend-difference intro-anim translate-y-10">
            Digital Ecosystem
          </p>
        </div>

        <div className="relative">
          <h1 id="title-living" className="text-[12vw] leading-[0.85] font-bold uppercase brand-font title-glitch intro-anim opacity-0 translate-y-20">
            Living
          </h1>
          <h1 id="title-forest" className="text-[12vw] leading-[0.85] font-bold uppercase brand-font ml-[15vw] title-outline intro-anim opacity-0 translate-y-20 -mt-[2vw]">
            Forest
          </h1>
        </div>

        <div className="max-w-xs mt-8 md:mt-12 intro-anim opacity-0 translate-y-10 pointer-events-auto mix-blend-difference text-white">
          <p className="text-[10px] md:text-xs leading-loose opacity-90 font-light tracking-wide mono-font">
            // SYSTEM READY<br />
            <span className="text-indigo-300">SCROLL</span> TO EXPLORE<br />
            <span className="text-indigo-300">MOVE</span> TO OBSERVE
          </p>
        </div>
      </div>

      <div className="scroll-indicator fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 intro-anim translate-y-10">
        <span className="text-[10px] tracking-widest uppercase text-white">Explore</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </>
  );
};
