import { useEffect, useState } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitor';

export function FPSMonitor() {
  const [fps, setFps] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Toggle visibility with Ctrl+Shift+F
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        setIsVisible((prev) => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    if (isVisible) {
      performanceMonitor.start((newFps) => {
        setFps(newFps);
      });
    } else {
      performanceMonitor.stop();
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      performanceMonitor.stop();
    };
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  const fpsColor = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className="fixed top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 z-50">
      <div className="flex items-center gap-2">
        <span className="text-white/70 text-sm font-mono">FPS:</span>
        <span className={`${fpsColor} text-lg font-bold font-mono`}>{fps}</span>
      </div>
      <p className="text-white/40 text-xs mt-1">Ctrl+Shift+F to toggle</p>
    </div>
  );
}
