import { ref } from 'vue';

export interface HoverState {
  isHovering: boolean;
  countryCode: string | null;
  countryName: string | null;
  mouseX: number;
  mouseY: number;
}

/**
 * Composable for managing hover state with debouncing
 * @param debounceMs - Delay in milliseconds before triggering hover (default: 200ms)
 */
export function useHover(debounceMs: number = 200) {
  const hoverState = ref<HoverState>({
    isHovering: false,
    countryCode: null,
    countryName: null,
    mouseX: 0,
    mouseY: 0
  });

  const hoveredCountryCode = ref<string | null>(null);
  let debounceTimeout: NodeJS.Timeout | null = null;

  /**
   * Set hover state immediately (for visual feedback like highlighting)
   */
  const setImmediateHover = (
    countryCode: string | null,
    countryName: string | null,
    mouseX: number,
    mouseY: number
  ) => {
    hoverState.value = {
      isHovering: !!countryCode,
      countryCode,
      countryName,
      mouseX,
      mouseY
    };
  };

  /**
   * Set debounced hover state (for triggering API calls or popovers)
   */
  const setDebouncedHover = (
    countryCode: string | null,
    countryName: string | null,
    mouseX: number,
    mouseY: number
  ) => {
    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }

    // Set immediate visual feedback
    setImmediateHover(countryCode, countryName, mouseX, mouseY);

    // If hovering over a country, debounce the API call
    if (countryCode) {
      debounceTimeout = setTimeout(() => {
        hoveredCountryCode.value = countryCode;
      }, debounceMs);
    } else {
      // If not hovering, clear immediately
      hoveredCountryCode.value = null;
    }
  };

  /**
   * Clear hover state
   */
  const clearHover = () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }

    hoverState.value = {
      isHovering: false,
      countryCode: null,
      countryName: null,
      mouseX: 0,
      mouseY: 0
    };
    
    hoveredCountryCode.value = null;
  };

  /**
   * Update mouse position without changing hover state
   */
  const updateMousePosition = (mouseX: number, mouseY: number) => {
    hoverState.value.mouseX = mouseX;
    hoverState.value.mouseY = mouseY;
  };

  /**
   * Check if hovering over a specific country
   */
  const isHoveringCountry = (countryCode: string): boolean => {
    return hoverState.value.isHovering && hoverState.value.countryCode === countryCode;
  };

  return {
    hoverState,
    hoveredCountryCode,
    setImmediateHover,
    setDebouncedHover,
    clearHover,
    updateMousePosition,
    isHoveringCountry
  };
}
