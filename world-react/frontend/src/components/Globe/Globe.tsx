import { useEffect, useRef, useState, Suspense, forwardRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useGlobeStore } from '../../store/globeStore';
import { useGlobeControls } from './useGlobeControls';
import { HoverHandler } from './HoverHandler';
import { loadTopoJSON, GLOBE_RADIUS } from '../../services/geometry/topoJsonLoader';
import { CountryMesh } from './CountryMesh';
import { CountryPopover } from '../Popover/CountryPopover';
import type { CountryGeometry } from '../../services/geometry/topoJsonLoader';

const EarthSphere = forwardRef<THREE.Mesh>(function EarthSphere(_props, ref) {
  // Load texture using useLoader to prevent flickering
  const earthTexture = useLoader(THREE.TextureLoader, '/assets/textures/earth2.jpg');
  
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshStandardMaterial map={earthTexture} />
    </mesh>
  );
});

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const { rotation, applyMomentum } = useGlobeStore();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation[0];
      groupRef.current.rotation.y = rotation[1];
      groupRef.current.rotation.z = rotation[2];
    }
    
    // Apply momentum when not dragging
    applyMomentum();
  });
  
  return <group ref={groupRef}>{children}</group>;
}

export function Globe() {
  const [countries, setCountries] = useState<CountryGeometry[]>([]);
  const { setIsLoading } = useGlobeStore();
  const earthMeshRef = useRef<THREE.Mesh>(null);
  
  // Initialize globe controls
  useGlobeControls();
  
  // Load TopoJSON data
  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await loadTopoJSON('/data/countries.topojson');
        
        if (mounted) {
          setCountries(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load TopoJSON:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, [setIsLoading]);
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        
        {/* Hover detection handler */}
  <HoverHandler countries={countries} earthMeshRef={earthMeshRef} />
        
        {/* Globe with Suspense to prevent flickering */}
        <Suspense fallback={null}>
          <RotatingGroup>
            <EarthSphere ref={earthMeshRef} />
            {countries.length > 0 && <CountryMesh countries={countries} />}
          </RotatingGroup>
        </Suspense>
      </Canvas>
      
      {/* Country information popover */}
      <CountryPopover />
    </div>
  );
}
