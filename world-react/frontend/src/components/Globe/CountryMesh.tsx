import { useMemo, forwardRef, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHoverStore } from '../../store/hoverStore';
import type { CountryGeometry } from '../../services/geometry/topoJsonLoader';

interface CountryMeshProps {
  countries: CountryGeometry[];
}

export const CountryMesh = forwardRef<THREE.Group, CountryMeshProps>(
  ({ countries }, ref) => {
    const { hoveredCountryIso } = useHoverStore();
    const hoveredIsoRef = useRef<string | null>(hoveredCountryIso);
    const baseColor = useMemo(() => new THREE.Color(0x88ccff), []);
    const highlightColor = useMemo(() => new THREE.Color(0xffdd44), []);

    // Create lines once - don't recreate on hover
    const countryLines = useMemo(() => {
      return countries.flatMap((country, countryIndex) =>
        country.lines.map((geometry, lineIndex) => {
          const material = new THREE.LineBasicMaterial({
            color: 0x88ccff,
            opacity: 0.7,
            transparent: true,
            linewidth: 1
          });
          
          const line = new THREE.Line(geometry, material);
          line.name = `country-${country.isoCode}-${countryIndex}-${lineIndex}`;
          line.userData = {
            countryName: country.name,
            countryIso: country.isoCode
          };
          
          return {
            key: `${country.isoCode}-${countryIndex}-${lineIndex}`,
            line,
            isoCode: country.isoCode
          };
        })
      );
    }, [countries]);

    useEffect(() => {
      hoveredIsoRef.current = hoveredCountryIso;
    }, [hoveredCountryIso]);

    useFrame((_, delta) => {
      const lerpFactor = Math.min(1, delta * 8);
      countryLines.forEach(({ line, isoCode }) => {
        const material = line.material as THREE.LineBasicMaterial;
        const isHovered = hoveredIsoRef.current === isoCode;
        const targetColor = isHovered ? highlightColor : baseColor;
        material.color.lerp(targetColor, lerpFactor);

        const targetOpacity = isHovered ? 1 : 0.6;
        material.opacity += (targetOpacity - material.opacity) * lerpFactor;
        material.transparent = true;
      });
    });

    return (
      <group name="country-borders" ref={ref}>
        {countryLines.map(({ key, line }) => (
          <primitive key={key} object={line} />
        ))}
      </group>
    );
  }
);
