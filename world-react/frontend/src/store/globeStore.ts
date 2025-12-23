import { create } from 'zustand';
import type { GlobeState } from '../types/GlobeState';

const DAMPING = 0.95;
const MIN_VELOCITY = 0.0001;
const ROTATION_SENSITIVITY = 0.002; // Reduced from 0.005 for smoother control

export const useGlobeStore = create<GlobeState>((set, get) => ({
  rotation: [0, 0, 0],
  targetRotation: [0, 0, 0],
  isDragging: false,
  velocity: [0, 0],
  isLoading: true,
  
  setRotation: (rotation) => set({ rotation }),
  
  setTargetRotation: (targetRotation) => set({ targetRotation }),
  
  setIsDragging: (isDragging) => set({ isDragging }),
  
  setVelocity: (velocity) => set({ velocity }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  updateRotation: (delta) => {
    const currentRotation = get().rotation;
    const newRotation: [number, number, number] = [
      currentRotation[0] + delta[1] * ROTATION_SENSITIVITY,
      currentRotation[1] + delta[0] * ROTATION_SENSITIVITY,
      currentRotation[2]
    ];
    set({ rotation: newRotation, targetRotation: newRotation });
  },
  
  applyMomentum: () => {
    const { velocity, isDragging, rotation } = get();
    
    if (isDragging) return;
    
    const [vx, vy] = velocity;
    const magnitude = Math.sqrt(vx * vx + vy * vy);
    
    if (magnitude < MIN_VELOCITY) {
      set({ velocity: [0, 0] });
      return;
    }
    
    // Apply damping
    const newVelocity: [number, number] = [vx * DAMPING, vy * DAMPING];
    
    // Apply velocity to rotation
    const newRotation: [number, number, number] = [
      rotation[0] + vy * ROTATION_SENSITIVITY,
      rotation[1] + vx * ROTATION_SENSITIVITY,
      rotation[2]
    ];
    
    set({ velocity: newVelocity, rotation: newRotation, targetRotation: newRotation });
  }
}));
