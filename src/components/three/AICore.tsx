'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { coreVertexShader, coreFragmentShader } from './shaders'

interface AICoreProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
  isMobile: boolean
}

export default function AICore({ mouseRef, isMobile }: AICoreProps) {
  const meshRef  = useRef<THREE.Mesh>(null)
  const matRef   = useRef<THREE.ShaderMaterial>(null)

  // High-poly icosahedron — the base geometry that gets displaced in shader
  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(1, isMobile ? 3 : 4),
    [isMobile]
  )

  // Shader material with uniforms — created once, mutated in useFrame
  const uniforms = useMemo(
    () => ({
      uTime:   { value: 0 },
      uMouse:  { value: new THREE.Vector2(0, 0) },
      uMobile: { value: isMobile ? 1.0 : 0.0 },
    }),
    [isMobile]
  )

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uTime.value   = clock.getElapsedTime()
    u.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)

    // Very slow self-rotation — organic, never mechanical
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0006
      meshRef.current.rotation.x  = Math.sin(clock.getElapsedTime() * 0.18) * 0.06
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={coreVertexShader}
        fragmentShader={coreFragmentShader}
        transparent
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  )
}
