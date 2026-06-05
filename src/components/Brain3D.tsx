import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Icosahedron, Sphere, Torus } from '@react-three/drei'
import * as THREE from 'three'

function NeuralCore() {
  const inner = useRef<THREE.Mesh>(null)
  const wire = useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    if (wire.current) {
      wire.current.rotation.y += dt * 0.25
      wire.current.rotation.x += dt * 0.08
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.4
    }
  })

  return (
    <group>
      {/* glowing inner core */}
      <Sphere ref={inner} args={[0.95, 32, 32]}>
        <meshStandardMaterial
          color="#3dd9ff"
          emissive="#1d6fff"
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.4}
        />
      </Sphere>
      {/* wireframe "brain" shell */}
      <Icosahedron ref={wire} args={[1.55, 2]}>
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.7}
        />
      </Icosahedron>
      {/* outer halo */}
      <Sphere args={[1.85, 32, 32]}>
        <meshBasicMaterial color="#1e40af" transparent opacity={0.08} side={THREE.BackSide} />
      </Sphere>
    </group>
  )
}

function OrbitRings() {
  const g = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z += dt * 0.15
  })
  return (
    <group ref={g} rotation={[Math.PI / 2.3, 0, 0]}>
      <Torus args={[2.5, 0.012, 16, 120]}>
        <meshBasicMaterial color="#3dd9ff" transparent opacity={0.6} />
      </Torus>
      <Torus args={[3.1, 0.008, 16, 120]} rotation={[0.4, 0.2, 0]}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </Torus>
    </group>
  )
}

function Particles({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    // deterministic pseudo-random (mulberry32) so render stays pure & stable
    let seed = 0x9e3779b9
    const rand = () => {
      seed |= 0
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // distribute in a spherical shell
      const r = 2.2 + rand() * 2.4
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.05
      ref.current.rotation.x += dt * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#7dd3fc" transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

export function Brain3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#3dd9ff" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#a855f7" />
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        <NeuralCore />
      </Float>
      <OrbitRings />
      <Particles />
    </Canvas>
  )
}
