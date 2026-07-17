'use client'

import { useRef, useEffect, useMemo, MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AICore from './AICore'
import CosmicBG from './CosmicBG'

gsap.registerPlugin(ScrollTrigger)

// ── Smooth mouse ref (updated globally) ─────────────────────────────────────
function useGlobalMouse() {
  const raw    = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      raw.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      raw.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    smooth.current.x += (raw.current.x - smooth.current.x) * 0.045
    smooth.current.y += (raw.current.y - smooth.current.y) * 0.045
  })

  return smooth
}

// ── Cursor-driven light (cursor = art direction, not object rotation) ────────
function CursorLight({
  mouseRef,
}: {
  mouseRef: MutableRefObject<{ x: number; y: number }>
}) {
  const lightA = useRef<THREE.PointLight>(null)
  const lightB = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    // Primary light follows cursor — changes mood dynamically
    if (lightA.current) {
      lightA.current.position.set(mx * 5, my * 3.5, 3.5)
      // Color shifts from violet → cyan based on cursor position
      const hue = ((mx + 1) * 0.5) * 60 + 210 // 210–270° (blue/violet range)
      lightA.current.color.setHSL(hue / 360, 0.9, 0.55)
      lightA.current.intensity = 16 + my * 4
    }

    // Secondary slow-orbit accent
    if (lightB.current) {
      lightB.current.position.set(
        Math.sin(t * 0.22) * 6,
        Math.cos(t * 0.18) * 3,
        Math.sin(t * 0.3) * 4
      )
      lightB.current.color.setHSL(0.6 + Math.sin(t * 0.1) * 0.04, 0.85, 0.5)
      lightB.current.intensity = 10 + Math.sin(t * 0.7) * 3
    }
  })

  return (
    <>
      <ambientLight intensity={0.06} color="#080820" />
      <pointLight ref={lightA} position={[0, 0, 3.5]} intensity={16} distance={15} decay={2} />
      <pointLight ref={lightB} position={[4, 2, -3]} intensity={10} distance={18} decay={2} />
      {/* Dim warm back-light for depth separation */}
      <pointLight position={[0, -4, -4]} intensity={4} color="#1a0a40" distance={12} decay={2} />
    </>
  )
}

// ── Cinematic camera — GSAP scroll path + mouse parallax ────────────────────
function CinematicCamera({
  mouseRef,
}: {
  mouseRef: MutableRefObject<{ x: number; y: number }>
}) {
  const { camera } = useThree()
  const scrollT    = useRef(0)

  // CatmullRom spline: camera travels this path as user scrolls
  const spline = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0,   0,   5.2),   // hero
        new THREE.Vector3(0.8, 0.3, 5.0),   // section 1 — slight right drift
        new THREE.Vector3(-0.6,-0.2, 5.5),  // section 2 — back & left
        new THREE.Vector3(0.3, 0.5, 4.8),   // section 3 — lifted
        new THREE.Vector3(0,   0,   4.5),   // final — slow pull-in
      ]),
    []
  )

  useEffect(() => {
    camera.position.set(0, 0, 5.2)

    // Fade-in entry: camera drifts from z=9 to z=5.2 on load
    gsap.fromTo(
      camera.position,
      { z: 9 },
      { z: 5.2, duration: 3.2, ease: 'power3.out' }
    )

    // Scroll drives t along the spline
    ScrollTrigger.create({
      trigger: document.body,
      start:   'top top',
      end:     'bottom bottom',
      onUpdate: (self) => {
        scrollT.current = self.progress
      },
    })
    return () => ScrollTrigger.getAll().forEach((st) => st.kill())
  }, [camera])

  const camPos = useMemo(() => new THREE.Vector3(), [])
  const lookAt = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame(() => {
    // Spline position at current scroll
    spline.getPoint(scrollT.current, camPos)

    // Mouse parallax layered on top
    camPos.x += mouseRef.current.x * 0.5
    camPos.y += mouseRef.current.y * 0.3

    // Lerp camera — silky inertia, no snapping
    camera.position.lerp(camPos, 0.025)
    camera.lookAt(lookAt)
  })

  return null
}

// ── Internals — everything inside Canvas ────────────────────────────────────
function SceneInternals({
  mouseRef,
  isMobile,
}: {
  mouseRef: MutableRefObject<{ x: number; y: number }>
  isMobile: boolean
}) {
  const smoothMouse = useGlobalMouse()

  return (
    <>
      <CosmicBG />
      <CinematicCamera mouseRef={smoothMouse} />
      <CursorLight mouseRef={smoothMouse} />
      <AICore mouseRef={smoothMouse} isMobile={isMobile} />
      <EffectComposer multisampling={isMobile ? 0 : 8}>
        <Bloom
          luminanceThreshold={0.12}
          luminanceSmoothing={0.85}
          intensity={isMobile ? 0.8 : 1.4}
          mipmapBlur
          radius={0.75}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005)}
        />
        <Vignette eskil={false} offset={0.12} darkness={0.85} />
      </EffectComposer>
    </>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────
interface CinematicSceneProps {
  isMobile: boolean
}

export default function CinematicScene({ isMobile }: CinematicSceneProps) {
  // Global mouse ref — lives outside Canvas so page.tsx can also read it
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <Canvas
      dpr={isMobile ? [1, 1] : [1, 1.5]}
      camera={{ fov: 52, near: 0.1, far: 60, position: [0, 0, 9] }}
      gl={{
        antialias: !isMobile,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      style={{ background: '#030412' }}
    >
      <SceneInternals mouseRef={mouseRef} isMobile={isMobile} />
    </Canvas>
  )
}
