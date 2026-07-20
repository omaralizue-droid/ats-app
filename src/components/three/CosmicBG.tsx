'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bgVertexShader, bgFragmentShader } from './shaders'

export default function CosmicBG() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  // Full-screen quad — 2×2 in NDC space
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(2, 2)
    return g
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMobile:     { value: 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useFrame(({ clock }) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    matRef.current.uniforms.uResolution.value.set(size.width, size.height)
  })

  return (
    <mesh
      geometry={geometry}
      // renderOrder -1 so it paints before all other objects
      renderOrder={-1}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
