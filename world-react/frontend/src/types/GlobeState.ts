export interface GlobeState {
  rotation: [number, number, number];
  targetRotation: [number, number, number];
  isDragging: boolean;
  velocity: [number, number];
  isLoading: boolean;
  
  // Actions
  setRotation: (rotation: [number, number, number]) => void;
  setTargetRotation: (rotation: [number, number, number]) => void;
  setIsDragging: (isDragging: boolean) => void;
  setVelocity: (velocity: [number, number]) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateRotation: (delta: [number, number]) => void;
  applyMomentum: () => void;
}
