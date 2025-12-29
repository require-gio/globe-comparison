<template>
  <div class="globe-viewer" ref="containerRef">
    <canvas 
      ref="canvasRef" 
      :class="cursorClass"
    />
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-if="!isInitialized && !error" class="loading-message">
      Loading globe...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useGlobeStore } from '../stores/globeStore'
import { useGlobe } from '../composables/useGlobe'
import type { FeatureCollection } from 'geojson'

const props = defineProps<{
  geoJsonData: FeatureCollection | null
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const globeStore = useGlobeStore()

// Initialize globe composable (will be set up after mount)
const globeComposable = ref<ReturnType<typeof useGlobe> | null>(null)

// Cursor class based on dragging state
const cursorClass = computed(() => ({
  'cursor-grab': !globeStore.isDragging,
  'cursor-grabbing': globeStore.isDragging
}))

// Watch for data changes
watch(() => props.geoJsonData, (newData) => {
  if (newData && canvasRef.value && !globeComposable.value) {
    initializeGlobe()
  }
})

const initializeGlobe = () => {
  if (!canvasRef.value) return
  
  globeComposable.value = useGlobe(canvasRef.value, props.geoJsonData)
  if (globeComposable.value) {
    globeComposable.value.initialize()
    console.log('Globe initialized in component')
  }
}

onMounted(() => {
  // Set canvas size to match container
  if (containerRef.value && canvasRef.value) {
    updateCanvasSize()

    // Add mouse move tracking for popover positioning
    canvasRef.value.addEventListener('mousemove', handleCanvasMouseMove)

    // Add resize listener at component level
    window.addEventListener('resize', updateCanvasSize)
  }

  // Initialize if data is already available
  if (props.geoJsonData && canvasRef.value) {
    initializeGlobe()
  }
})

onUnmounted(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', handleCanvasMouseMove)
  }

  if (containerRef.value) {
    window.removeEventListener('resize', updateCanvasSize)
  }
  
  if (globeComposable.value) {
    globeComposable.value.cleanup()
  }
})

// Update canvas element size (both CSS display and drawing resolution)
const updateCanvasSize = () => {
  if (!containerRef.value || !canvasRef.value || !globeComposable.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))

  // Update canvas drawing resolution (the actual attribute)
  canvasRef.value.width = width
  canvasRef.value.height = height

  // Trigger resize in the globe composable
  globeComposable.value.triggerResize(width, height)

  console.log(`Canvas resized to ${width}x${height}`)
}

// Mouse position tracking for popover
const mousePosition = ref({ x: 0, y: 0 })

// Track mouse position
const handleCanvasMouseMove = (event: MouseEvent) => {
  mousePosition.value = { x: event.clientX, y: event.clientY }
}

// Expose computed properties from composable
const isInitialized = computed(() => globeComposable.value?.isInitialized ?? false)
const error = computed(() => globeComposable.value?.error ?? null)
const hoveredCountry = computed(() => globeComposable.value?.hoveredCountry ?? null)

// Expose to parent
defineExpose({
  hoveredCountry,
  mousePosition
})
</script>

<style scoped>
.globe-viewer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(to bottom, #000510, #0a0a1a);
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  user-select: none;
}

.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff4444;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  text-align: center;
  z-index: 10;
}

.loading-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  text-align: center;
  z-index: 10;
}
</style>
