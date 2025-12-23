import * as THREE from 'three';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { numericToIso, isNumericCountryCode } from '../../utils/countryCodeMapping';

interface CountryBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

interface CountryFeature {
  type: 'Feature';
  id?: string | number;
  properties: {
    name?: string;
    iso_a3?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface CountryGeometry {
  isoCode: string;
  id?: string | number;
  name: string;
  lines: THREE.BufferGeometry[];
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  bounds: CountryBounds;
}

const GLOBE_RADIUS = 2;
const BORDER_OFFSET = 0.005; // Slightly above surface to prevent z-fighting

// Convert lat/lon to 3D coordinates on a sphere
function latLonToVector3(lat: number, lon: number, radius: number = GLOBE_RADIUS + BORDER_OFFSET): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}

// Convert a polygon ring to a line geometry
function ringToLineGeometry(ring: number[][]): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    points.push(latLonToVector3(lat, lon));
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

function initializeBounds(): CountryBounds {
  return {
    minLat: 90,
    maxLat: -90,
    minLon: 180,
    maxLon: -180
  };
}

function extendBounds(bounds: CountryBounds, lat: number, lon: number): void {
  if (lat < bounds.minLat) bounds.minLat = lat;
  if (lat > bounds.maxLat) bounds.maxLat = lat;
  if (lon < bounds.minLon) bounds.minLon = lon;
  if (lon > bounds.maxLon) bounds.maxLon = lon;
}

// Parse TopoJSON and convert to country geometries
export function parseTopoJSON(data: Topology): CountryGeometry[] {
  const countries: CountryGeometry[] = [];
  
  // Find the countries object in the topology
  const countriesObject = data.objects.countries as GeometryCollection;
  if (!countriesObject) {
    console.error('No countries object found in TopoJSON');
    return countries;
  }
  
  // Convert to GeoJSON features
  const geoJson = feature(data, countriesObject) as {
    type: 'FeatureCollection';
    features: CountryFeature[];
  };
  
  for (const feat of geoJson.features) {
    // Extract ID and convert numeric codes to ISO alpha-3
    const rawId = feat.id?.toString() || feat.properties.iso_a3 || 'UNKNOWN';
    const isoCode = isNumericCountryCode(rawId) ? numericToIso(rawId) : rawId;
    const name = feat.properties.name || 'Unknown';
    const lines: THREE.BufferGeometry[] = [];
    const bounds = initializeBounds();
    const geometry = feat.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
    
    if (feat.geometry.type === 'Polygon') {
      // Single polygon
      for (const ring of feat.geometry.coordinates as number[][][]) {
        lines.push(ringToLineGeometry(ring));
        for (const [lon, lat] of ring) {
          extendBounds(bounds, lat, lon);
        }
      }
    } else if (feat.geometry.type === 'MultiPolygon') {
      // Multiple polygons (e.g., island nations)
      for (const polygon of feat.geometry.coordinates as number[][][][]) {
        for (const ring of polygon) {
          lines.push(ringToLineGeometry(ring));
          for (const [lon, lat] of ring) {
            extendBounds(bounds, lat, lon);
          }
        }
      }
    }
    
    countries.push({ isoCode, name, lines, geometry, bounds });
  }
  
  return countries;
}

// Load TopoJSON from URL
export async function loadTopoJSON(url: string): Promise<CountryGeometry[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load TopoJSON: ${response.statusText}`);
    }
    
    const data = await response.json() as Topology;
    return parseTopoJSON(data);
  } catch (error) {
    console.error('Error loading TopoJSON:', error);
    throw error;
  }
}

export { GLOBE_RADIUS };
export type { CountryGeometry };
