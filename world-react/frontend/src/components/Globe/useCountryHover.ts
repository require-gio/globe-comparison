import { useCallback, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useHoverStore } from '../../store/hoverStore';
import { raycastHelper } from '../../services/geometry/raycastHelper';

const HOVER_DEBOUNCE_MS = 50;

interface UseCountryHoverProps {
  countryMeshesRef: React.RefObject<THREE.Group>;
}

export function useCountryHover({ countryMeshesRef }: UseCountryHoverProps) {
  const { camera, gl } = useThree();
  const { setHoveredCountry, setMousePosition, clearHover } = useHoverStore();
  
  const debounceTimerRef = useRef<number | null>(null);
  const lastHoveredIsoRef = useRef<string | null>(null);
  
  const handlePointerMove = useCallback((event: PointerEvent) => {
    // Update mouse position for popover placement
    setMousePosition({ x: event.clientX, y: event.clientY });
    
    // Debounce the raycast operation
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      if (!countryMeshesRef.current) {
        clearHover();
        return;
      }
      
      const canvas = gl.domElement;
      raycastHelper.updateMousePosition(event.clientX, event.clientY, canvas);
      
      // Get all line objects (country borders)
      const countryLines: THREE.Object3D[] = [];
      countryMeshesRef.current.traverse((child) => {
        if (child instanceof THREE.Line) {
          countryLines.push(child);
        }
      });
      
      const hit = raycastHelper.findClosest(camera, countryLines);
      
      if (hit && hit.object.parent) {
        // Extract ISO code from the object name
        // Format: "country-{isoCode}-{countryIndex}-{lineIndex}"
        const objectName = hit.object.name || '';
        const parts = objectName.split('-');
        
        if (parts.length >= 2) {
          const isoCode = parts[1];
          
          // Only update if hovering a different country
          if (isoCode !== lastHoveredIsoRef.current) {
            lastHoveredIsoRef.current = isoCode;
            
            // Find the country name from userData if available
            const countryName = hit.object.userData?.countryName || isoCode;
            setHoveredCountry(isoCode, countryName);
          }
        } else {
          // No valid country found
          if (lastHoveredIsoRef.current !== null) {
            lastHoveredIsoRef.current = null;
            clearHover();
          }
        }
      } else {
        // No intersection
        if (lastHoveredIsoRef.current !== null) {
          lastHoveredIsoRef.current = null;
          clearHover();
        }
      }
    }, HOVER_DEBOUNCE_MS);
  }, [camera, gl, countryMeshesRef, setHoveredCountry, setMousePosition, clearHover]);
  
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handlePointerMove]);
  
  return {
    // Expose any needed methods here if required
  };
}
