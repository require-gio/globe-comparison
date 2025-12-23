import * as THREE from 'three'

export interface MousePosition {
  x: number
  y: number
}

export interface DragState {
  isDragging: boolean
  previousPosition: MousePosition
  currentPosition: MousePosition
}

export interface RaycastResult {
  countryCode: string
  countryName: string
  distance: number
  point: THREE.Vector3
}

export class InteractionHandler {
  private dragState: DragState = {
    isDragging: false,
    previousPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  }

  private velocity = { x: 0, y: 0 }
  private readonly sensitivity = 0.005 // Rotation sensitivity
  private readonly momentumDecay = 0.95 // Momentum decay factor
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  /**
   * Handle mouse down event - start dragging
   */
  onMouseDown(event: MouseEvent): void {
    this.dragState.isDragging = true
    this.dragState.previousPosition = {
      x: event.clientX,
      y: event.clientY
    }
    this.dragState.currentPosition = {
      x: event.clientX,
      y: event.clientY
    }
    // Stop momentum when user starts dragging
    this.velocity = { x: 0, y: 0 }
  }

  /**
   * Handle mouse move event - calculate rotation delta
   */
  onMouseMove(event: MouseEvent): { deltaX: number; deltaY: number } | null {
    if (!this.dragState.isDragging) {
      return null
    }

    this.dragState.currentPosition = {
      x: event.clientX,
      y: event.clientY
    }

    const deltaX = (this.dragState.currentPosition.x - this.dragState.previousPosition.x) * this.sensitivity
    const deltaY = (this.dragState.currentPosition.y - this.dragState.previousPosition.y) * this.sensitivity

    // Update velocity for momentum
    this.velocity.x = deltaY // Y movement rotates around X axis
    this.velocity.y = deltaX // X movement rotates around Y axis

    this.dragState.previousPosition = { ...this.dragState.currentPosition }

    return { deltaX, deltaY }
  }

  /**
   * Handle mouse up event - stop dragging
   */
  onMouseUp(): void {
    this.dragState.isDragging = false
  }

  /**
   * Handle touch start event
   */
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      this.dragState.isDragging = true
      this.dragState.previousPosition = {
        x: touch.clientX,
        y: touch.clientY
      }
      this.dragState.currentPosition = {
        x: touch.clientX,
        y: touch.clientY
      }
      this.velocity = { x: 0, y: 0 }
    }
  }

  /**
   * Handle touch move event
   */
  onTouchMove(event: TouchEvent): { deltaX: number; deltaY: number } | null {
    if (!this.dragState.isDragging || event.touches.length !== 1) {
      return null
    }

    event.preventDefault()

    const touch = event.touches[0]
    this.dragState.currentPosition = {
      x: touch.clientX,
      y: touch.clientY
    }

    const deltaX = (this.dragState.currentPosition.x - this.dragState.previousPosition.x) * this.sensitivity
    const deltaY = (this.dragState.currentPosition.y - this.dragState.previousPosition.y) * this.sensitivity

    this.velocity.x = deltaY
    this.velocity.y = deltaX

    this.dragState.previousPosition = { ...this.dragState.currentPosition }

    return { deltaX, deltaY }
  }

  /**
   * Handle touch end event
   */
  onTouchEnd(): void {
    this.dragState.isDragging = false
  }

  /**
   * Get current velocity
   */
  getVelocity(): { x: number; y: number } {
    return { ...this.velocity }
  }

  /**
   * Apply momentum decay to velocity
   */
  applyMomentumDecay(): void {
    this.velocity.x *= this.momentumDecay
    this.velocity.y *= this.momentumDecay

    // Stop very small velocities
    if (Math.abs(this.velocity.x) < 0.0001) this.velocity.x = 0
    if (Math.abs(this.velocity.y) < 0.0001) this.velocity.y = 0
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.dragState.isDragging
  }

  /**
   * Check if has momentum
   */
  hasMomentum(): boolean {
    return Math.abs(this.velocity.x) > 0.0001 || Math.abs(this.velocity.y) > 0.0001
  }

  /**
   * Get normalized mouse position for raycasting (-1 to 1)
   */
  getNormalizedMousePosition(event: MouseEvent): THREE.Vector2 {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    } as THREE.Vector2
  }

  /**
   * Perform raycasting to detect country under mouse
   */
  raycastCountries(
    event: MouseEvent,
    camera: THREE.Camera,
    countryMeshes: THREE.Mesh[]
  ): RaycastResult | null {
    const mousePos = this.getNormalizedMousePosition(event)
    
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mousePos, camera)

    // Raycast against all country meshes
    const intersects = raycaster.intersectObjects(countryMeshes, false)

    if (intersects.length > 0) {
      const firstIntersect = intersects[0]
      const mesh = firstIntersect.object as THREE.Mesh

      // Get country metadata from mesh userData
      const countryCode = mesh.userData.countryCode || 'UNKNOWN'
      const countryName = mesh.userData.countryName || 'Unknown'

      return {
        countryCode,
        countryName,
        distance: firstIntersect.distance,
        point: firstIntersect.point
      }
    }

    return null
  }

  /**
   * Reset interaction state
   */
  reset(): void {
    this.dragState = {
      isDragging: false,
      previousPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    }
    this.velocity = { x: 0, y: 0 }
  }
}
