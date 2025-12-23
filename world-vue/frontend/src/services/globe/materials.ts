import * as THREE from 'three'

/**
 * Create basic material for country surfaces
 */
export function createCountryMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0x2a4858,
    emissive: 0x0a1a2a,
    specular: 0x444444,
    shininess: 10,
    flatShading: false,
    side: THREE.FrontSide, // Changed from DoubleSide to avoid rendering issues
    transparent: true,
    opacity: 0.95,
    depthWrite: true,
    depthTest: true
  })
}

/**
 * Create highlight material for hovered countries
 */
export function createHighlightMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0x4a9eff,
    emissive: 0x2a5eff,
    specular: 0x888888,
    shininess: 20,
    flatShading: false,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0
  })
}

/**
 * Create material for the globe sphere base
 */
export function createGlobeBaseMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0x1a1a2e,
    emissive: 0x0a0a1a,
    specular: 0x333333,
    shininess: 5,
    transparent: true,
    opacity: 0.9
  })
}

/**
 * Create material for country boundaries
 */
export function createBoundaryMaterial(color: number = 0x444444): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color,
    linewidth: 1,
    opacity: 0.5,
    transparent: true
  })
}

/**
 * Create material for atmosphere glow effect (to be used later)
 */
export function createAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      coefficient: { value: 0.5 },
      power: { value: 3.5 },
      glowColor: { value: new THREE.Color(0x4488ff) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float coefficient;
      uniform float power;
      
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      
      void main() {
        float intensity = pow(coefficient + dot(vNormal, vPositionNormal), power);
        gl_FragColor = vec4(glowColor, intensity);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  })
}
