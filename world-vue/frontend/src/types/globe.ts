/**
 * Globe and Three.js related types
 */

/**
 * 3D Vector coordinates
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D coordinates
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Geographic coordinates
 */
export interface GeoCoordinates {
  lat: number;
  lng: number;
}

/**
 * Globe rotation state
 */
export interface GlobeRotation {
  x: number; // Rotation around X axis (radians)
  y: number; // Rotation around Y axis (radians)
  z: number; // Rotation around Z axis (radians)
}

/**
 * Globe interaction state
 */
export interface GlobeInteractionState {
  isDragging: boolean;
  lastMousePosition: Vector2 | null;
  velocity: Vector2; // Angular velocity for momentum
}

/**
 * Country hover state
 */
export interface HoverState {
  countryId: string | null;
  position: Vector3 | null; // 3D position of hover in world space
  screenPosition: Vector2 | null; // 2D screen position for popover
}

/**
 * Complete globe state
 */
export interface GlobeState {
  rotation: GlobeRotation;
  interaction: GlobeInteractionState;
  hover: HoverState;
  isInitialized: boolean;
}

/**
 * Globe configuration options
 */
export interface GlobeConfig {
  radius: number;
  segments: number;
  animationSpeed: number;
  momentumDecay: number; // Friction coefficient for momentum decay
  minZoom: number;
  maxZoom: number;
  enableRotation: boolean;
  enableZoom: boolean;
}

/**
 * Camera configuration
 */
export interface CameraConfig {
  position: Vector3;
  fov: number; // Field of view
  near: number; // Near clipping plane
  far: number; // Far clipping plane
}

/**
 * Material configuration for country rendering
 */
export interface CountryMaterial {
  color: string;
  emissive: string;
  opacity: number;
  hoverColor?: string;
  selectedColor?: string;
}
