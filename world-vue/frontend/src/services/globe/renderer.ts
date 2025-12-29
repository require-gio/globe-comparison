import * as THREE from 'three'

export interface RendererConfig {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

export class GlobeRenderer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private globe: THREE.Group

  constructor(config: RendererConfig) {
    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000510) // Dark space theme

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      45, // Field of view
      config.width / config.height, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    )
    this.camera.position.z = 4

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(config.width, config.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create globe group (container for all globe elements)
    this.globe = new THREE.Group()
    this.scene.add(this.globe)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Add directional light (simulating sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 3, 5)
    this.scene.add(directionalLight)

    // Add subtle fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3)
    fillLight.position.set(-5, -3, -5)
    this.scene.add(fillLight)
  }

  /**
   * Get the scene
   */
  getScene(): THREE.Scene {
    return this.scene
  }

  /**
   * Get the camera
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  /**
   * Get the renderer
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  /**
   * Get the globe group
   */
  getGlobe(): THREE.Group {
    return this.globe
  }

  /**
   * Set globe rotation
   */
  setGlobeRotation(x: number, y: number, z: number) {
    this.globe.rotation.set(x, y, z)
  }

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * Handle window resize
   */
  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.renderer.dispose()
    
    // Dispose geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material?.dispose()
        }
      }
    })
  }
}
