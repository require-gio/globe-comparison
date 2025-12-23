import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Extend THREE.BufferGeometry with BVH methods
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export interface RaycastHit {
  object: THREE.Object3D;
  distance: number;
  point: THREE.Vector3;
  face: THREE.Face | null;
}

export class RaycastHelper {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Configure raycaster for better line detection
    this.raycaster.params.Line = { threshold: 0.1 };
  }
  
  /**
   * Update mouse position in normalized device coordinates (-1 to +1)
   */
  updateMousePosition(clientX: number, clientY: number, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }
  
  /**
   * Perform raycast against a scene or specific objects
   */
  raycast(camera: THREE.Camera, objects: THREE.Object3D[]): RaycastHit[] {
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(objects, true);
    
    return intersects.map(intersect => ({
      object: intersect.object,
      distance: intersect.distance,
      point: intersect.point,
      face: intersect.face || null
    }));
  }
  
  /**
   * Find the closest intersected object
   */
  findClosest(camera: THREE.Camera, objects: THREE.Object3D[]): RaycastHit | null {
    const hits = this.raycast(camera, objects);
    return hits.length > 0 ? hits[0] : null;
  }
  
  /**
   * Check if mouse is hovering over any of the given objects
   */
  isHovering(camera: THREE.Camera, objects: THREE.Object3D[]): boolean {
    const hits = this.raycast(camera, objects);
    return hits.length > 0;
  }
}

export const raycastHelper = new RaycastHelper();
