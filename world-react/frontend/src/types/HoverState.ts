export interface HoverState {
  hoveredCountryIso: string | null;
  hoveredCountryName: string | null;
  mousePosition: { x: number; y: number } | null;
  isHovering: boolean;
  
  // Actions
  setHoveredCountry: (iso: string | null, name: string | null) => void;
  setMousePosition: (position: { x: number; y: number } | null) => void;
  clearHover: () => void;
}
