export interface Country {
  code: string;
  name: string;
  population: number;
  capital: string;
  region: string;
}

export interface CountryGeometry {
  type: 'Feature';
  properties: {
    ISO_A2: string;
    NAME: string;
    [key: string]: unknown;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface CountryGeoJSON {
  type: 'FeatureCollection';
  features: CountryGeometry[];
}

export interface HoverState {
  countryCode: string | null;
  mousePosition: { x: number; y: number } | null;
  isLoading: boolean;
  countryData: Country | null;
  error: string | null;
}
