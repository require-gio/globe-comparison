import * as THREE from 'three'
import type { Feature, FeatureCollection, GeoJsonProperties } from 'geojson'

export interface CountryMesh {
  mesh: THREE.Mesh
  countryCode: string
  countryName: string
}

/**
 * Convert latitude/longitude to 3D coordinates on a sphere
 */
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

/**
 * Create a mesh from a single polygon's coordinates
 * Note: In GeoJSON Polygon, coordinates[0] is exterior ring, coordinates[1+] are holes
 */
function createPolygonMesh(
  polygonCoordinates: number[][][],
  radius: number,
  material: THREE.Material
): THREE.Mesh {
  const shapes: THREE.Shape[] = []

  // Process each ring in the polygon
  polygonCoordinates.forEach((ring, ringIndex) => {
    if (ring.length === 0) return

    if (ringIndex === 0) {
      // First ring is the exterior boundary
      const shape = new THREE.Shape()
      
      ring.forEach((point, index) => {
        const [lon, lat] = point
        
        // Convert 3D point to 2D UV coordinates for shape
        const u = (lon + 180) / 360
        const v = (lat + 90) / 180
        
        if (index === 0) {
          shape.moveTo(u, v)
        } else {
          shape.lineTo(u, v)
        }
      })

      shapes.push(shape)
    } else {
      // Subsequent rings are holes (lakes, etc.)
      if (shapes.length > 0) {
        const hole = new THREE.Path()
        
        ring.forEach((point, index) => {
          const [lon, lat] = point
          const u = (lon + 180) / 360
          const v = (lat + 90) / 180
          
          if (index === 0) {
            hole.moveTo(u, v)
          } else {
            hole.lineTo(u, v)
          }
        })
        
        shapes[shapes.length - 1].holes.push(hole)
      }
    }
  })

  // Create geometry from shapes
  const geometry = new THREE.ShapeGeometry(shapes)
  
  // Transform flat geometry to sphere surface
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const u = positions.getX(i)
    const v = positions.getY(i)
    
    // Convert UV back to lat/lon
    const lon = u * 360 - 180
    const lat = v * 180 - 90
    
    const vector = latLonToVector3(lat, lon, radius)
    positions.setXYZ(i, vector.x, vector.y, vector.z)
  }
  
  geometry.computeVertexNormals()
  
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

/**
 * Create country boundary lines
 */
function createCountryBoundaries(
  coordinates: number[][][],
  radius: number,
  color: number = 0x444444
): THREE.Line[] {
  const lines: THREE.Line[] = []
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color,
    linewidth: 1,
    opacity: 0.5,
    transparent: true
  })

  coordinates.forEach((polygon) => {
    if (polygon.length === 0) return

    const points: THREE.Vector3[] = []
    
    polygon.forEach((point) => {
      const [lon, lat] = point
      const vector = latLonToVector3(lat, lon, radius + 0.001) // Slightly above surface
      points.push(vector)
    })

    // Close the polygon
    if (points.length > 0) {
      points.push(points[0].clone())
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, lineMaterial)
    lines.push(line)
  })

  return lines
}

/**
 * Convert TopoJSON/GeoJSON to Three.js meshes
 */
export function createCountryMeshes(
  geoJson: FeatureCollection,
  material: THREE.Material,
  radius: number = 1
): CountryMesh[] {
  const countryMeshes: CountryMesh[] = []

  geoJson.features.forEach((feature: Feature) => {
    const properties = feature.properties as GeoJsonProperties
    const geometry = feature.geometry

    if (!geometry || !properties) return

    const countryCode = properties.ISO_A3 || properties.iso_a3 || properties.ISO_A2 || properties.iso_a2 || properties.id || 'UNKNOWN'
    const countryName = properties.name || properties.NAME || properties.ADMIN || 'Unknown'

    try {
      let polygons: number[][][][] = []

      if (geometry.type === 'Polygon') {
        // Single polygon: wrap in array for uniform processing
        polygons = [geometry.coordinates as number[][][]]
      } else if (geometry.type === 'MultiPolygon') {
        // Multiple polygons: each is an array of rings (exterior + holes)
        polygons = geometry.coordinates as number[][][][]
      }

      if (polygons.length === 0) return

      // Create a mesh for each polygon (some countries are made of multiple separate pieces)
      polygons.forEach((polygonCoords, index) => {
        try {
          if (polygonCoords.length === 0) {
            console.warn(`Empty polygon ${index} for ${countryName}`)
            return
          }
          
          const mesh = createPolygonMesh(polygonCoords, radius, material)
          
          // Store country metadata
          mesh.userData = {
            countryCode,
            countryName,
            polygonIndex: index
          }

          countryMeshes.push({
            mesh,
            countryCode,
            countryName
          })
          
          if (countryName === 'Brazil' || countryName === 'United States of America') {
            console.log(`Created mesh for ${countryName} polygon ${index}/${polygons.length}, rings: ${polygonCoords.length}`)
          }
        } catch (error) {
          console.warn(`Failed to create mesh for polygon ${index} of ${countryName}:`, error)
        }
      })
    } catch (error) {
      console.warn(`Failed to create mesh for ${countryName}:`, error)
    }
  })

  return countryMeshes
}

/**
 * Create boundary lines for all countries
 */
export function createAllBoundaries(
  geoJson: FeatureCollection,
  radius: number = 1,
  color: number = 0x444444
): THREE.Line[] {
  const allLines: THREE.Line[] = []

  geoJson.features.forEach((feature: Feature) => {
    const geometry = feature.geometry

    if (!geometry) return

    try {
      let polygons: number[][][][] = []

      if (geometry.type === 'Polygon') {
        polygons = [geometry.coordinates as number[][][]]
      } else if (geometry.type === 'MultiPolygon') {
        polygons = geometry.coordinates as number[][][][]
      }

      if (polygons.length === 0) return

      // Create boundaries for each polygon
      polygons.forEach((polygonCoords) => {
        const lines = createCountryBoundaries(polygonCoords, radius, color)
        allLines.push(...lines)
      })
    } catch (error) {
      console.warn('Failed to create boundary lines:', error)
    }
  })

  return allLines
}

/**
 * Create a simple sphere geometry for the globe base
 */
export function createGlobeSphere(radius: number = 1, color: number = 0x1a1a2e): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 64, 64)
  const material = new THREE.MeshPhongMaterial({
    color,
    emissive: 0x0a0a1a,
    specular: 0x333333,
    shininess: 5,
    transparent: true,
    opacity: 0.9
  })
  
  return new THREE.Mesh(geometry, material)
}
