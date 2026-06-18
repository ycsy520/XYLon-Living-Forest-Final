import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { Cursor } from './components/Cursor';
import { SeasonProvider } from './context/SeasonContext';
import './index.css';

function App() {
  return (
    <SeasonProvider>
      <UI onEnter={() => {}} />
      <Scene />
      <Cursor />
      
      <div style={{ height: '500vh', width: '100%', pointerEvents: 'none' }}></div>
    </SeasonProvider>
  );
}

export default App;
