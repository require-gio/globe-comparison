<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isVisible"
        ref="popoverRef"
        class="country-popover"
        :style="popoverStyle"
      >
        <!-- Loading state -->
        <div v-if="isLoading" class="popover-content">
          <div class="flex items-center space-x-2">
            <div class="spinner"></div>
            <span class="text-sm">Loading...</span>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="isError" class="popover-content">
          <div class="text-red-400 text-sm">
            <p class="font-semibold">Information unavailable</p>
            <p class="text-xs mt-1 opacity-80">Unable to load country data</p>
          </div>
        </div>

        <!-- Success state with data -->
        <div v-else-if="countryData" class="popover-content">
          <h3 class="text-lg font-bold text-white mb-2">{{ countryData.name }}</h3>
          
          <div class="space-y-1 text-sm">
            <div v-if="countryData.capital" class="flex justify-between">
              <span class="text-gray-400">Capital:</span>
              <span class="text-white font-medium">{{ countryData.capital }}</span>
            </div>
            
            <div v-if="countryData.population" class="flex justify-between">
              <span class="text-gray-400">Population:</span>
              <span class="text-white font-medium">{{ formatNumber(countryData.population) }}</span>
            </div>
            
            <div v-if="countryData.region" class="flex justify-between">
              <span class="text-gray-400">Region:</span>
              <span class="text-white font-medium">{{ countryData.region }}</span>
            </div>
            
            <div v-if="countryData.area" class="flex justify-between">
              <span class="text-gray-400">Area:</span>
              <span class="text-white font-medium">{{ formatNumber(countryData.area) }} km²</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue';
import type { CountryData } from '../composables/useCountryQuery';

const props = defineProps<{
  countryData: CountryData | null | undefined;
  isLoading: boolean;
  isError: boolean;
  mouseX: number;
  mouseY: number;
  show: boolean;
}>();

const popoverRef = ref<HTMLElement | null>(null);

// Virtual reference element for positioning near mouse
const virtualReference = ref({
  getBoundingClientRect() {
    return {
      width: 0,
      height: 0,
      x: props.mouseX,
      y: props.mouseY,
      top: props.mouseY,
      right: props.mouseX,
      bottom: props.mouseY,
      left: props.mouseX
    };
  }
});

// Floating UI setup
const { floatingStyles } = useFloating(virtualReference, popoverRef, {
  placement: 'right',
  middleware: [
    offset(12),
    flip(),
    shift({ padding: 8 })
  ],
  whileElementsMounted: autoUpdate
});

const popoverStyle = computed(() => ({
  ...floatingStyles.value
}));

const isVisible = computed(() => {
  return props.show && (props.isLoading || props.isError || !!props.countryData);
});

// Update virtual reference when mouse position changes
watch([() => props.mouseX, () => props.mouseY], () => {
  virtualReference.value = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: props.mouseX,
        y: props.mouseY,
        top: props.mouseY,
        right: props.mouseX,
        bottom: props.mouseY,
        left: props.mouseX
      };
    }
  };
});

/**
 * Format large numbers with commas
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};
</script>

<style scoped>
.country-popover {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  pointer-events: none;
  max-width: 300px;
}

.popover-content {
  @apply backdrop-blur-md bg-black/80 border border-white/20 rounded-lg shadow-2xl p-4;
}

.spinner {
  @apply inline-block h-4 w-4 animate-spin rounded-full border-2 border-space-blue border-t-transparent;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
