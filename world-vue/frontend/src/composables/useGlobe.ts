import { ref } from 'vue'
import { useGlobeStore } from '../stores/globeStore'
import { GlobeRenderer } from '../services/globe/renderer'
import { InteractionHandler, type RaycastResult } from '../services/globe/interactions'
import type { FeatureCollection } from 'geojson'
import { createCountryMeshes, createAllBoundaries, createGlobeSphere } from '../services/globe/geometry'
import { createCountryMaterial, createHighlightMaterial } from '../services/globe/materials'
import type * as THREE from 'three'

export function useGlobe(canvas: HTMLCanvasElement | null, geoJsonData: FeatureCollection | null) {
  const globeStore = useGlobeStore()
  const isInitialized = ref(false)
  const error = ref<string | null>(null)
  const hoveredCountry = ref<RaycastResult | null>(null)

  let renderer: GlobeRenderer | null = null
  let interactionHandler: InteractionHandler | null = null
  let animationFrameId: number | null = null
  let countryMeshesArray: Array<{ mesh: THREE.Mesh; countryCode: string; countryName: string }> = []
  let highlightMaterial: THREE.Material | null = null
  let defaultMaterial: THREE.Material | null = null
  let currentHighlightedMesh: THREE.Mesh | null = null

  /**
   * Initialize the globe
   */
  const initialize = () => {
    if (!canvas) {
      error.value = 'Canvas element not found'
      return
    }

    if (!geoJsonData) {
      error.value = 'GeoJSON data not loaded'
      return
    }

    try {
      // Create renderer
      renderer = new GlobeRenderer({
        canvas,
        width: canvas.clientWidth,
        height: canvas.clientHeight
      })

      // Create interaction handler
      interactionHandler = new InteractionHandler(canvas)

      // Create globe sphere base
      const globeSphere = createGlobeSphere(1, 0x1a1a2e)
      renderer.getGlobe().add(globeSphere)

      // Create materials
      defaultMaterial = createCountryMaterial()
      highlightMaterial = createHighlightMaterial()

      // Create country meshes
      const countryMeshes = createCountryMeshes(geoJsonData, defaultMaterial, 1.01)
      countryMeshesArray = countryMeshes
      
      countryMeshes.forEach(({ mesh }) => {
        renderer!.getGlobe().add(mesh)
      })

      // Create country boundaries
      const boundaries = createAllBoundaries(geoJsonData, 1.01, 0x666666)
      boundaries.forEach(line => {
        renderer!.getGlobe().add(line)
      })

      // Set up event listeners
      setupEventListeners()

      // Start animation loop
      startAnimationLoop()

      // Wait for first render before marking as initialized
      setTimeout(() => {
        isInitialized.value = true
        console.log('Globe initialization complete')
      }, 100)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize globe'
      console.error('Globe initialization error:', err)
    }
  }

  /**
   * Set up mouse and touch event listeners
   */
  const setupEventListeners = () => {
    if (!canvas || !interactionHandler) return

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)

    window.addEventListener('resize', handleResize)
  }

  /**
   * Clean up event listeners
   */
  const cleanupEventListeners = () => {
    if (!canvas) return

    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseup', handleMouseUp)
    canvas.removeEventListener('mouseleave', handleMouseUp)

    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)

    window.removeEventListener('resize', handleResize)
  }

  /**
   * Handle mouse down
   */
  const handleMouseDown = (event: MouseEvent) => {
    if (!interactionHandler) return
    interactionHandler.onMouseDown(event)
    globeStore.setDragging(true)
  }

  /**
   * Handle mouse move
   */
  const handleMouseMove = (event: MouseEvent) => {
    if (!interactionHandler || !renderer) return
    
    const delta = interactionHandler.onMouseMove(event)
    if (delta) {
      // User is dragging - update rotation
      const currentRotation = globeStore.rotation
      globeStore.setRotation({
        x: currentRotation.x + delta.deltaY,
        y: currentRotation.y + delta.deltaX
      })
    } else if (!globeStore.isDragging) {
      // Not dragging - perform raycasting for hover
      const meshes = countryMeshesArray.map(item => item.mesh)
      const raycastResult = interactionHandler.raycastCountries(
        event,
        renderer.getCamera(),
        meshes
      )
      
      // Update hover state
      if (raycastResult) {
        hoveredCountry.value = raycastResult
        updateHighlight(raycastResult.countryCode)
      } else {
        hoveredCountry.value = null
        clearHighlight()
      }
    }
  }

  /**
   * Update mesh highlight when hovering
   */
  const updateHighlight = (countryCode: string) => {
    if (!highlightMaterial || !defaultMaterial) return

    // Find meshes for this country
    const targetMeshes = countryMeshesArray.filter(item => item.countryCode === countryCode)

    // Clear previous highlight if different country
    if (currentHighlightedMesh && currentHighlightedMesh.userData.countryCode !== countryCode) {
      clearHighlight()
    }

    // Apply highlight to all meshes of this country
    targetMeshes.forEach(({ mesh }) => {
      mesh.material = highlightMaterial!
      currentHighlightedMesh = mesh
    })
  }

  /**
   * Clear mesh highlight
   */
  const clearHighlight = () => {
    if (!defaultMaterial) return

    if (currentHighlightedMesh) {
      const countryCode = currentHighlightedMesh.userData.countryCode
      const meshesToReset = countryMeshesArray.filter(item => item.countryCode === countryCode)
      
      meshesToReset.forEach(({ mesh }) => {
        mesh.material = defaultMaterial!
      })

      currentHighlightedMesh = null
    }
  }

  /**
   * Handle mouse up
   */
  const handleMouseUp = () => {
    if (!interactionHandler) return
    interactionHandler.onMouseUp()
    globeStore.setDragging(false)
  }

  /**
   * Handle touch start
   */
  const handleTouchStart = (event: TouchEvent) => {
    if (!interactionHandler) return
    interactionHandler.onTouchStart(event)
    globeStore.setDragging(true)
  }

  /**
   * Handle touch move
   */
  const handleTouchMove = (event: TouchEvent) => {
    if (!interactionHandler) return
    
    const delta = interactionHandler.onTouchMove(event)
    if (delta) {
      const currentRotation = globeStore.rotation
      globeStore.setRotation({
        x: currentRotation.x + delta.deltaY,
        y: currentRotation.y + delta.deltaX
      })
    }
  }

  /**
   * Handle touch end
   */
  const handleTouchEnd = () => {
    if (!interactionHandler) return
    interactionHandler.onTouchEnd()
    globeStore.setDragging(false)
  }

  /**
   * Handle window resize
   */
  const handleResize = () => {
    if (!canvas || !renderer) return
    
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    renderer.resize(width, height)
  }

  /**
   * Start animation loop
   */
  const startAnimationLoop = () => {
    const animate = () => {
      if (!renderer || !interactionHandler) return

      // Apply momentum if not dragging
      if (!globeStore.isDragging && interactionHandler.hasMomentum()) {
        const velocity = interactionHandler.getVelocity()
        const currentRotation = globeStore.rotation
        
        globeStore.setRotation({
          x: currentRotation.x + velocity.x,
          y: currentRotation.y + velocity.y
        })

        interactionHandler.applyMomentumDecay()
      }

      // Update globe rotation from store
      renderer.setGlobeRotation(
        globeStore.rotation.x,
        globeStore.rotation.y,
        globeStore.rotation.z
      )

      // Render scene
      renderer.render()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * Stop animation loop
   */
  const stopAnimationLoop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  /**
   * Clean up resources
   */
  const cleanup = () => {
    stopAnimationLoop()
    cleanupEventListeners()
    
    if (renderer) {
      renderer.dispose()
      renderer = null
    }

    if (interactionHandler) {
      interactionHandler.reset()
      interactionHandler = null
    }

    globeStore.reset()
    isInitialized.value = false
  }

  return {
    isInitialized,
    error,
    hoveredCountry,
    initialize,
    cleanup
  }
}
