import { useCallback, useEffect, useRef } from 'react';
import { useGlobeStore } from '../../store/globeStore';

interface MousePosition {
  x: number;
  y: number;
}

export function useGlobeControls() {
  const lastMousePos = useRef<MousePosition>({ x: 0, y: 0 });
  const lastMoveTime = useRef<number>(Date.now());
  const dragStartPos = useRef<MousePosition | null>(null);
  
  const { 
    isDragging,
    setIsDragging, 
    setVelocity,
    updateRotation 
  } = useGlobeStore();
  
  const handlePointerDown = useCallback((event: PointerEvent) => {
    setIsDragging(true);
    setVelocity([0, 0]);
    lastMousePos.current = { x: event.clientX, y: event.clientY };
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    document.body.style.cursor = 'grabbing';
  }, [setIsDragging, setVelocity]);
  
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDragging) {
      // Change cursor to 'grab' when hovering over canvas
      const target = event.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        document.body.style.cursor = 'grab';
      } else {
        document.body.style.cursor = 'default';
      }
      return;
    }
    
    const deltaX = event.clientX - lastMousePos.current.x;
    const deltaY = event.clientY - lastMousePos.current.y;
    
    const now = Date.now();
    const timeDelta = now - lastMoveTime.current;
    
    // Calculate velocity for momentum
    if (timeDelta > 0) {
      const vx = deltaX / timeDelta;
      const vy = deltaY / timeDelta;
      setVelocity([vx * 50, vy * 50]); // Reduced from 100 for gentler momentum
    }
    
    updateRotation([deltaX, deltaY]);
    
    lastMousePos.current = { x: event.clientX, y: event.clientY };
    lastMoveTime.current = now;
  }, [isDragging, setVelocity, updateRotation]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartPos.current = null;
    document.body.style.cursor = 'default';
  }, [setIsDragging]);
  
  // Attach global event listeners
  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.cursor = 'default';
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);
  
  return {
    isDragging
  };
}
