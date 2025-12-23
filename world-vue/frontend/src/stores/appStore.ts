import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ApiError } from '@/types/api';

/**
 * Application-wide state management
 * Handles global loading states, errors, and app configuration
 */
export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false);
  const loadingMessage = ref<string | null>(null);
  const error = ref<ApiError | null>(null);
  const isInitialized = ref(false);

  // Feature flags from environment
  const features = ref({
    enableHover: import.meta.env.VITE_ENABLE_HOVER === 'true',
    enableRotation: import.meta.env.VITE_ENABLE_ROTATION !== 'false', // Default true
    enableZoom: true,
  });

  // Computed
  const hasError = computed(() => error.value !== null);

  // Actions
  function setLoading(loading: boolean, message?: string) {
    isLoading.value = loading;
    loadingMessage.value = message || null;
    if (!loading) {
      loadingMessage.value = null;
    }
  }

  function setError(err: ApiError | null) {
    error.value = err;
  }

  function clearError() {
    error.value = null;
  }

  function setInitialized(value: boolean) {
    isInitialized.value = value;
  }

  function toggleFeature(feature: keyof typeof features.value) {
    features.value[feature] = !features.value[feature];
  }

  // Initialization
  async function initialize() {
    if (isInitialized.value) return;

    try {
      setLoading(true, 'Initializing application...');
      
      // Perform any app initialization logic here
      // e.g., check API health, load initial data, etc.
      
      setInitialized(true);
    } catch (err) {
      setError({
        error: 'Initialization Error',
        message: err instanceof Error ? err.message : 'Failed to initialize application',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    // State
    isLoading,
    loadingMessage,
    error,
    isInitialized,
    features,
    
    // Computed
    hasError,
    
    // Actions
    setLoading,
    setError,
    clearError,
    setInitialized,
    toggleFeature,
    initialize,
  };
});
