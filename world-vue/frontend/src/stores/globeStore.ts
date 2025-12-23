import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Vector3 } from '../types/globe'

export const useGlobeStore = defineStore('globe', () => {
  // Rotation state (Euler angles in radians)
  const rotation = ref<Vector3>({
    x: 0,
    y: 0,
    z: 0
  })

  // Velocity for momentum (radians per frame)
  const velocity = ref<Vector3>({
    x: 0,
    y: 0,
    z: 0
  })

  // Interaction state
  const isDragging = ref(false)

  // Update rotation
  const setRotation = (newRotation: Partial<Vector3>) => {
    rotation.value = { ...rotation.value, ...newRotation }
  }

  // Update velocity
  const setVelocity = (newVelocity: Partial<Vector3>) => {
    velocity.value = { ...velocity.value, ...newVelocity }
  }

  // Set dragging state
  const setDragging = (dragging: boolean) => {
    isDragging.value = dragging
  }

  // Apply momentum decay
  const applyMomentumDecay = (decayFactor = 0.95) => {
    velocity.value.x *= decayFactor
    velocity.value.y *= decayFactor
    velocity.value.z *= decayFactor

    // Stop very small velocities to prevent floating point drift
    if (Math.abs(velocity.value.x) < 0.0001) velocity.value.x = 0
    if (Math.abs(velocity.value.y) < 0.0001) velocity.value.y = 0
    if (Math.abs(velocity.value.z) < 0.0001) velocity.value.z = 0
  }

  // Apply velocity to rotation
  const applyVelocity = () => {
    rotation.value.x += velocity.value.x
    rotation.value.y += velocity.value.y
    rotation.value.z += velocity.value.z
  }

  // Reset state
  const reset = () => {
    rotation.value = { x: 0, y: 0, z: 0 }
    velocity.value = { x: 0, y: 0, z: 0 }
    isDragging.value = false
  }

  return {
    // State
    rotation,
    velocity,
    isDragging,
    // Actions
    setRotation,
    setVelocity,
    setDragging,
    applyMomentumDecay,
    applyVelocity,
    reset
  }
})
