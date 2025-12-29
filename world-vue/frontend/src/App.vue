<template>
  <div id="app" class="min-h-screen bg-space-dark text-white">
    <!-- Tech name badge -->
    <div class="fixed top-4 left-4 z-10 rounded-lg bg-space-blue/20 border border-space-blue/50 px-3 py-1">
      <span class="text-sm font-semibold text-space-blue">Vue</span>
    </div>

    <!-- Loading overlay -->
    <div
      v-if="appStore.isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-space-dark/90"
    >
      <div class="text-center">
        <div class="mb-4">
          <svg
            class="inline-block h-12 w-12 animate-spin text-space-blue"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p v-if="appStore.loadingMessage" class="text-lg">
          {{ appStore.loadingMessage }}
        </p>
      </div>
    </div>

    <!-- Error notification -->
    <div
      v-if="appStore.hasError"
      class="fixed top-4 right-4 z-40 max-w-md rounded-lg border border-red-500/50 bg-red-900/80 p-4 shadow-lg animate-slideUp"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-200">
            {{ appStore.error?.error || 'Error' }}
          </h3>
          <div class="mt-2 text-sm text-red-300">
            <p>{{ appStore.error?.message }}</p>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button
            @click="appStore.clearError()"
            class="inline-flex rounded-md text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <main class="relative h-screen w-full overflow-hidden">
      <!-- Globe viewer -->
      <GlobeViewer ref="globeViewerRef" :geo-json-data="geoJsonData" />
      
      <!-- Country popover -->
      <CountryPopover
        :country-data="countryData"
        :is-loading="isLoading"
        :is-error="isError"
        :mouse-x="mousePosition.x"
        :mouse-y="mousePosition.y"
        :show="!!hoveredCountryCode"
      />
    </main>

    <!-- Debug info (development only) -->
    <div
      v-if="isDevelopment"
      class="fixed bottom-4 left-4 rounded-lg bg-black/50 px-3 py-2 text-xs text-gray-400"
    >
      <div>Features: Rotation={{ appStore.features.enableRotation }} | Hover={{ appStore.features.enableHover }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAppStore } from '@/stores/appStore';
import GlobeViewer from '@/components/GlobeViewer.vue';
import CountryPopover from '@/components/CountryPopover.vue';
import { useCountryQuery } from '@/composables/useCountryQuery';
import type { FeatureCollection } from 'geojson';

const appStore = useAppStore();
const isDevelopment = import.meta.env.DEV;
const geoJsonData = ref<FeatureCollection | null>(null);

// Globe viewer ref to access exposed properties
const globeViewerRef = ref<InstanceType<typeof GlobeViewer> | null>(null);

// Hovering state
const hoveredCountryCode = computed(() => {
  return globeViewerRef.value?.hoveredCountry?.countryCode || null;
});

const mousePosition = computed(() => {
  return globeViewerRef.value?.mousePosition || { x: 0, y: 0 };
});

// Query country data when hovering
const hoveredCountryIso = computed(() => hoveredCountryCode.value);
const { data: countryData, isLoading, isError } = useCountryQuery(hoveredCountryIso);

onMounted(async () => {
  await appStore.initialize();
  
  // Load GeoJSON data
  try {
    appStore.setLoading(true, 'Loading globe data...');
    const response = await fetch('/data/countries.geo.json');
    if (!response.ok) {
      throw new Error('Failed to load country data');
    }
    geoJsonData.value = await response.json();
  } catch (error) {
    console.error('Failed to load GeoJSON data:', error);
    appStore.setError({
      error: 'Data Load Error',
      message: 'Failed to load country data. Please refresh the page.',
      details: error
    });
  } finally {
    appStore.setLoading(false);
  }
});
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
