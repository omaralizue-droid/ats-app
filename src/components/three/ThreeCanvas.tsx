'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ThreeCanvasProps {
  className?: string
  particleCount?: number
  variant?: 'dense' | 'sparse'
}

export default function ThreeCanvas({
  className = '',
  particleCount = 120,
  variant = 'dense',
}: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Scene, Camera, Renderer ─────────────────────────────────────────────
    const W = mount.clientWidth
    const H = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = variant === 'dense' ? 55 : 70

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Particles ───────────────────────────────────────────────────────────
    const count = particleCount
    const positions = new Float32Array(count * 3)
    const velocities: THREE.Vector3[] = []
    const spread = variant === 'dense' ? 50 : 70

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * spread * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.018,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.010,
        )
      )
    }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Custom neon cyan particle texture
    const canvas2d = document.createElement('canvas')
    canvas2d.width = 64
    canvas2d.height = 64
    const ctx = canvas2d.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(0,240,255,1)')
    gradient.addColorStop(0.3, 'rgba(0,240,255,0.6)')
    gradient.addColorStop(1, 'rgba(0,240,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const particleTexture = new THREE.CanvasTexture(canvas2d)

    const pMat = new THREE.PointsMaterial({
      size: 1.0,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false,
      color: new THREE.Color('#00F0FF'),
      opacity: 0.85,
    })

    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    // ── Connection lines ────────────────────────────────────────────────────
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#00F0FF'),
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const CONNECT_DIST = variant === 'dense' ? 14 : 18
    let lineSegments: THREE.LineSegments | null = null

    function rebuildLines() {
      const pos = pGeo.attributes.position.array as Float32Array
      const linePositions: number[] = []

      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = pos[i * 3]     - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < CONNECT_DIST) {
            linePositions.push(
              pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
              pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2],
            )
          }
        }
      }

      if (lineSegments) {
        scene.remove(lineSegments)
        lineSegments.geometry.dispose()
      }

      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(linePositions, 3)
      )
      lineSegments = new THREE.LineSegments(lineGeo, lineMat)
      scene.add(lineSegments)
    }

    rebuildLines()

    // ── Mouse parallax ──────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Animation loop ──────────────────────────────────────────────────────
    let frameId: number
    let lineRebuildTimer = 0

    function animate() {
      frameId = requestAnimationFrame(animate)
      const pos = pGeo.attributes.position.array as Float32Array

      for (let i = 0; i < count; i++) {
        pos[i * 3]     += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y
        pos[i * 3 + 2] += velocities[i].z

        const bound = spread
        if (Math.abs(pos[i * 3])     > bound) velocities[i].x *= -1
        if (Math.abs(pos[i * 3 + 1]) > bound / 2) velocities[i].y *= -1
        if (Math.abs(pos[i * 3 + 2]) > bound) velocities[i].z *= -1
      }

      pGeo.attributes.position.needsUpdate = true

      lineRebuildTimer++
      if (lineRebuildTimer % 4 === 0) {
        rebuildLines()
      }

      // Gentle camera parallax
      camera.position.x += (mouse.x * 6 - camera.position.x) * 0.03
      camera.position.y += (-mouse.y * 3 - camera.position.y) * 0.03
      camera.lookAt(scene.position)

      scene.rotation.y += 0.0008

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize ──────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
      pGeo.dispose()
      pMat.dispose()
      lineMat.dispose()
      particleTexture.dispose()
    }
  }, [particleCount, variant])

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}
