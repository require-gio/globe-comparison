import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { geoContains } from 'd3-geo';
import { useHoverStore } from '../../store/hoverStore';
import { raycastHelper } from '../../services/geometry/raycastHelper';
import type { CountryGeometry } from '../../services/geometry/topoJsonLoader';

const HOVER_DEBOUNCE_MS = 50;
const HOVER_EXIT_DELAY_MS = 80;
const BOUNDS_PADDING_DEG = 0.5;

interface HoverHandlerProps {
  countries: CountryGeometry[];
  earthMeshRef: React.RefObject<THREE.Mesh>;
}

function normalizeLongitude(lon: number): number {
  let normalized = lon;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function vector3ToLatLon(point: THREE.Vector3): { lat: number; lon: number } {
  const normalized = point.clone().normalize();
  const lat = THREE.MathUtils.radToDeg(Math.asin(normalized.y));
  const lon = normalizeLongitude(THREE.MathUtils.radToDeg(Math.atan2(normalized.z, -normalized.x)) - 180);
  return { lat, lon };
}

function isWithinBounds(
  bounds: CountryGeometry['bounds'],
  lat: number,
  lon: number,
  padding: number
): boolean {
  const paddedLatMin = bounds.minLat - padding;
  const paddedLatMax = bounds.maxLat + padding;
  if (lat < paddedLatMin || lat > paddedLatMax) {
    return false;
  }
  const paddedLonMin = bounds.minLon - padding;
  const paddedLonMax = bounds.maxLon + padding;
  const lonCandidates = [lon, lon + 360, lon - 360];
  return lonCandidates.some(candidate => candidate >= paddedLonMin && candidate <= paddedLonMax);
}

export function HoverHandler({ countries, earthMeshRef }: HoverHandlerProps) {
  const { camera, gl } = useThree();
  const { setHoveredCountry, setMousePosition, clearHover } = useHoverStore();

  const debounceTimerRef = useRef<number | null>(null);
  const lastHoveredIsoRef = useRef<string | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  const countriesByIso = useMemo(() => {
    const map = new Map<string, CountryGeometry>();
    countries.forEach(country => {
      map.set(country.isoCode, country);
    });
    return map;
  }, [countries]);

  const findCountryAtLocation = useCallback(
    (lat: number, lon: number): CountryGeometry | null => {
      const lastIso = lastHoveredIsoRef.current;
      if (lastIso) {
        const lastCountry = countriesByIso.get(lastIso);
        if (lastCountry && isWithinBounds(lastCountry.bounds, lat, lon, BOUNDS_PADDING_DEG)) {
          if (geoContains(lastCountry.geometry, [lon, lat])) {
            return lastCountry;
          }
        }
      }

      for (const country of countries) {
        if (!isWithinBounds(country.bounds, lat, lon, BOUNDS_PADDING_DEG)) {
          continue;
        }

        if (geoContains(country.geometry, [lon, lat])) {
          return country;
        }
      }

      return null;
    },
    [countries, countriesByIso]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(() => {
        if (!earthMeshRef.current) {
          if (exitTimeoutRef.current === null && lastHoveredIsoRef.current !== null) {
            exitTimeoutRef.current = window.setTimeout(() => {
              lastHoveredIsoRef.current = null;
              clearHover();
              exitTimeoutRef.current = null;
            }, HOVER_EXIT_DELAY_MS);
          }
          return;
        }

        const canvas = gl.domElement;
        raycastHelper.updateMousePosition(event.clientX, event.clientY, canvas);

        const globeHit = raycastHelper.findClosest(camera, [earthMeshRef.current]);
        if (!globeHit) {
          if (exitTimeoutRef.current === null && lastHoveredIsoRef.current !== null) {
            exitTimeoutRef.current = window.setTimeout(() => {
              lastHoveredIsoRef.current = null;
              clearHover();
              exitTimeoutRef.current = null;
            }, HOVER_EXIT_DELAY_MS);
          }
          return;
        }

        const { lat, lon } = vector3ToLatLon(globeHit.point);
        const hoveredCountry = findCountryAtLocation(lat, lon);

        if (hoveredCountry) {
          if (exitTimeoutRef.current !== null) {
            window.clearTimeout(exitTimeoutRef.current);
            exitTimeoutRef.current = null;
          }
          if (hoveredCountry.isoCode !== lastHoveredIsoRef.current) {
            lastHoveredIsoRef.current = hoveredCountry.isoCode;
            setHoveredCountry(hoveredCountry.isoCode, hoveredCountry.name);
          }
        } else if (exitTimeoutRef.current === null && lastHoveredIsoRef.current !== null) {
          exitTimeoutRef.current = window.setTimeout(() => {
            lastHoveredIsoRef.current = null;
            clearHover();
            exitTimeoutRef.current = null;
          }, HOVER_EXIT_DELAY_MS);
        }
      }, HOVER_DEBOUNCE_MS);
    },
    [camera, gl, setMousePosition, earthMeshRef, findCountryAtLocation, clearHover, setHoveredCountry]
  );

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [handlePointerMove]);

  return null;
}
