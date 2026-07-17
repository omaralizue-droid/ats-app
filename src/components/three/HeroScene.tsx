'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  MeshTransmissionMaterial,
  Float,
  Sparkles,
  Environment,
  Instances,
  Instance,
} from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Mouse tracker hook ──────────────────────────────────────────────────────
function useSmoothMouse() {
  const mouse = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    smooth.current.x += (mouse.current.x - smooth.current.x) * 0.05
    smooth.current.y += (mouse.current.y - smooth.current.y) * 0.05
  })

  return smooth
}

// ── Cinematic camera ────────────────────────────────────────────────────────
function CinematicCamera() {
  const { camera } = useThree()
  const mouse = useSmoothMouse()
  const basePos = useRef(new THREE.Vector3(0, 0, 6))

  useEffect(() => {
    camera.position.set(0, 0, 6)
    // Animate in on mount
    gsap.fromTo(camera.position, { z: 12 }, { z: 6, duration: 2.8, ease: 'power3.out' })
  }, [camera])

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.6 - camera.position.x) * 0.04
    camera.position.y += (mouse.current.y * 0.35 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ── Core energy sphere ──────────────────────────────────────────────────────
function EnergySphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const mouse = useSmoothMouse()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.15 + mouse.current.y * 0.08
      meshRef.current.rotation.y = t * 0.12 + mouse.current.x * 0.12
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = -t * 0.08
      outerRef.current.rotation.y = t * 0.05
      outerRef.current.rotation.z = t * 0.03
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.06
      ringRef.current.rotation.y = t * 0.18
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Core glass sphere */}
        <mesh ref={meshRef} castShadow>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={1024}
            transmission={1}
            roughness={0.0}
            thickness={0.5}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropy={0.1}
            distortion={0.3}
            distortionScale={0.2}
            temporalDistortion={0.1}
            color="#a0e8ff"
            attenuationColor="#0066ff"
            attenuationDistance={0.5}
          />
        </mesh>

        {/* Inner glow core */}
        <mesh>
          <sphereGeometry args={[0.62, 64, 64]} />
          <meshStandardMaterial
            color="#00cfff"
            emissive="#0088ff"
            emissiveIntensity={3.5}
            transparent
            opacity={0.18}
          />
        </mesh>

        {/* Outer wireframe shell */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[1.36, 1]} />
          <meshStandardMaterial
            color="#00cfff"
            emissive="#00cfff"
            emissiveIntensity={0.6}
            wireframe
            transparent
            opacity={0.14}
          />
        </mesh>

        {/* Equatorial ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.58, 0.014, 6, 256]} />
          <meshStandardMaterial
            color="#00cfff"
            emissive="#00cfff"
            emissiveIntensity={2.5}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Second ring tilted */}
        <mesh rotation={[Math.PI / 3, 0, Math.PI / 6]}>
          <torusGeometry args={[1.72, 0.008, 6, 256]} />
          <meshStandardMaterial
            color="#7c3aed"
            emissive="#7c3aed"
            emissiveIntensity={1.8}
            transparent
            opacity={0.45}
          />
        </mesh>

        {/* Sparkles around sphere */}
        <Sparkles
          count={90}
          scale={4}
          size={1.8}
          speed={0.18}
          opacity={0.7}
          color="#00cfff"
        />
      </group>
    </Float>
  )
}

// ── Neural network nodes ────────────────────────────────────────────────────
function NeuralNodes() {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useSmoothMouse()

  const nodes = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / 28)
      const theta = Math.sqrt(28 * Math.PI) * phi
      return {
        position: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * 3.2,
          Math.sin(phi) * Math.sin(theta) * 3.2,
          Math.cos(phi) * 3.2,
        ),
        scale: Math.random() * 0.035 + 0.018,
        speed: Math.random() * 0.5 + 0.2,
      }
    })
  }, [])

  const connections = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].position.distanceTo(nodes[j].position) < 2.5) {
          pairs.push([nodes[i].position, nodes[j].position])
        }
      }
    }
    return pairs
  }, [nodes])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0015
      groupRef.current.rotation.x += (mouse.current.y * 0.06 - groupRef.current.rotation.x) * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      {/* Node spheres */}
      <Instances limit={nodes.length}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#00cfff"
          emissive="#00cfff"
          emissiveIntensity={3}
          transparent
          opacity={0.9}
        />
        {nodes.map((node, i) => (
          <Instance
            key={i}
            position={node.position}
            scale={node.scale}
          />
        ))}
      </Instances>

      {/* Connection lines */}
      {connections.map(([a, b], i) => {
        const mid = new THREE.Vector3().lerpVectors(a, b, 0.5)
        const dir = new THREE.Vector3().subVectors(b, a)
        const len = dir.length()
        const pos = mid
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.normalize()
        )
        return (
          <mesh key={i} position={pos} quaternion={quat}>
            <cylinderGeometry args={[0.003, 0.003, len, 3]} />
            <meshStandardMaterial
              color="#00cfff"
              emissive="#00cfff"
              emissiveIntensity={1.5}
              transparent
              opacity={0.18}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Floating debris cubes ───────────────────────────────────────────────────
function FloatingCubes() {
  const groupRef = useRef<THREE.Group>(null)

  const cubes = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 2,
    ),
    rotation: new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    ),
    scale: Math.random() * 0.12 + 0.04,
    speed: Math.random() * 0.4 + 0.1,
    color: i % 3 === 0 ? '#00cfff' : i % 3 === 1 ? '#7c3aed' : '#0044ff',
  })), [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x += 0.003 * cubes[i].speed
        child.rotation.y += 0.005 * cubes[i].speed
        child.position.y = cubes[i].position.y + Math.sin(t * cubes[i].speed + i) * 0.3
      })
    }
  })

  return (
    <group ref={groupRef}>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.position} rotation={c.rotation} scale={c.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={1.2}
            transparent
            opacity={0.45}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Ground plane with reflection ────────────────────────────────────────────
function GroundGlow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#050510"
        metalness={0.9}
        roughness={0.15}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

// ── Lights ──────────────────────────────────────────────────────────────────
function SceneLights() {
  const purpleRef = useRef<THREE.PointLight>(null)
  const cyanRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (purpleRef.current) {
      purpleRef.current.position.x = Math.sin(t * 0.4) * 4
      purpleRef.current.position.z = Math.cos(t * 0.4) * 3
    }
    if (cyanRef.current) {
      cyanRef.current.position.x = -Math.sin(t * 0.3) * 4
      cyanRef.current.position.z = -Math.cos(t * 0.3) * 3
    }
  })

  return (
    <>
      <ambientLight intensity={0.12} color="#111133" />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#ffffff" castShadow />
      <pointLight ref={purpleRef} position={[-3, 2, 2]} intensity={12} color="#7c3aed" distance={10} />
      <pointLight ref={cyanRef} position={[3, 1, -2]} intensity={10} color="#00cfff" distance={10} />
      <pointLight position={[0, -1.5, 3]} intensity={5} color="#0044ff" distance={8} />
    </>
  )
}

// ── Post processing ─────────────────────────────────────────────────────────
function PostFX() {
  return (
    <EffectComposer multisampling={8}>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={1.6}
        mipmapBlur
        radius={0.8}
      />
      <DepthOfField
        focusDistance={0}
        focalLength={0.025}
        bokehScale={2.5}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0004, 0.0004)}
      />
      <Vignette eskil={false} offset={0.18} darkness={0.7} />
    </EffectComposer>
  )
}

// ── Main exported scene ─────────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 6] }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: 'transparent' }}
    >
      <fog attach="fog" args={['#050510', 8, 22]} />
      <CinematicCamera />
      <SceneLights />
      <Environment preset="night" />
      <EnergySphere />
      <NeuralNodes />
      <FloatingCubes />
      <GroundGlow />
      <PostFX />
    </Canvas>
  )
}
