import { create } from 'zustand';
import type { HoverState } from '../types/HoverState';

export const useHoverStore = create<HoverState>((set) => ({
  hoveredCountryIso: null,
  hoveredCountryName: null,
  mousePosition: null,
  isHovering: false,
  
  setHoveredCountry: (iso, name) => set({
    hoveredCountryIso: iso,
    hoveredCountryName: name,
    isHovering: iso !== null
  }),
  
  setMousePosition: (position) => set({ mousePosition: position }),
  
  clearHover: () => set({
    hoveredCountryIso: null,
    hoveredCountryName: null,
    mousePosition: null,
    isHovering: false
  })
}));
