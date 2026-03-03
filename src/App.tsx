import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { Cursor } from './components/Cursor';
import './index.css';

function App() {
  const handleEnter = () => {
    // Started
  };

  return (
    <>
      <UI onEnter={handleEnter} />
      <Scene />
      <Cursor />
      
      <div className="grain-overlay fixed inset-0 pointer-events-none z-[900] opacity-[0.04] hidden" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div style={{ height: '500vh', width: '100%', pointerEvents: 'none' }}></div>
    </>
  );
}

export default App;
