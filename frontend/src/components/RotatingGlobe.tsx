import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const createAzureMapTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const fallbackTexture = new THREE.Texture()
    fallbackTexture.colorSpace = THREE.SRGBColorSpace
    return fallbackTexture
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#0c4d8a')
  gradient.addColorStop(0.25, '#0d6bbd')
  gradient.addColorStop(0.55, '#1d9bf0')
  gradient.addColorStop(0.8, '#65d2ff')
  gradient.addColorStop(1, '#0c2f5d')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const continentShapes = [
    { x: 280, y: 250, w: 240, h: 136, rotation: -0.42 },
    { x: 520, y: 330, w: 180, h: 110, rotation: 0.3 },
    { x: 720, y: 250, w: 210, h: 120, rotation: -0.18 },
    { x: 1010, y: 290, w: 240, h: 140, rotation: 0.12 },
    { x: 1220, y: 240, w: 220, h: 120, rotation: -0.35 },
    { x: 1460, y: 340, w: 200, h: 110, rotation: 0.2 },
    { x: 1690, y: 280, w: 180, h: 110, rotation: -0.3 },
    { x: 900, y: 620, w: 280, h: 140, rotation: 0.1 },
    { x: 1310, y: 640, w: 240, h: 140, rotation: -0.2 },
  ]

  continentShapes.forEach(({ x, y, w, h, rotation }) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.beginPath()
    ctx.moveTo(-w * 0.5, h * 0.12)
    ctx.bezierCurveTo(-w * 0.42, -h * 0.5, w * 0.2, -h * 0.5, w * 0.5, -h * 0.08)
    ctx.bezierCurveTo(w * 0.46, h * 0.38, w * 0.12, h * 0.52, -w * 0.18, h * 0.46)
    ctx.bezierCurveTo(-w * 0.42, h * 0.32, -w * 0.52, h * 0.22, -w * 0.5, h * 0.12)
    ctx.closePath()
    const fill = ctx.createLinearGradient(0, -h, 0, h)
    fill.addColorStop(0, '#e0f7ff')
    fill.addColorStop(0.35, '#89d5ff')
    fill.addColorStop(0.7, '#1e9bdf')
    fill.addColorStop(1, '#005ba6')
    ctx.fillStyle = fill
    ctx.fill()
    ctx.lineWidth = 8
    ctx.strokeStyle = 'rgba(7, 60, 110, 0.55)'
    ctx.stroke()
    ctx.restore()
  })

  const glow = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.45, 160, canvas.width * 0.5, canvas.height * 0.45, 1200)
  glow.addColorStop(0, 'rgba(212, 245, 255, 0.7)')
  glow.addColorStop(0.45, 'rgba(87, 166, 255, 0.38)')
  glow.addColorStop(1, 'rgba(10, 50, 90, 0.12)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export default function RotatingGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.z = 5.15

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const earthGroup = new THREE.Group()
    earthGroup.scale.setScalar(0.64)
    scene.add(earthGroup)

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x9ad8ff,
      emissive: new THREE.Color(0x2f7fd6),
      emissiveIntensity: 0.52,
      specular: new THREE.Color(0xeaf9ff),
      shininess: 34,
    })
    const earthGeometry = new THREE.SphereGeometry(1.62, 128, 128)
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.scale.setScalar(0.8)
    earthGroup.add(earth)

    const markerGeometry = new THREE.SphereGeometry(0.027, 16, 16)
    const markerMaterial = new THREE.MeshPhongMaterial({
      color: 0x7dd3fc,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      shininess: 90,
    })
    const markerLocations = [
      { latitude: 18, longitude: 35 },
      { latitude: -12, longitude: 88 },
      { latitude: 38, longitude: 145 },
    ]
    const markerRadius = 1.645
    markerLocations.forEach(({ latitude, longitude }) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      const phi = THREE.MathUtils.degToRad(90 - latitude)
      const theta = THREE.MathUtils.degToRad(longitude)
      marker.position.setFromSphericalCoords(markerRadius, phi, theta)
      earthGroup.add(marker)
    })

    const atmosphereGeometry = new THREE.SphereGeometry(1.308, 96, 96)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDirection = normalize(-viewPosition.xyz);
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        void main() {
          float facing = abs(dot(normalize(vNormal), normalize(vViewDirection)));
          float fresnel = 1.0 - clamp(facing, 0.0, 1.0);
          float rim = pow(fresnel, 2.2);
          float highlight = pow(fresnel, 8.0) * 0.3;
          float opacity = clamp(smoothstep(0.08, 0.95, rim) * 0.9 + highlight, 0.0, 1.0);
          vec3 glow = vec3(0.5, 0.82, 1.0);
          gl_FragColor = vec4(glow, opacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    earthGroup.add(atmosphere)

    const orbitGroup = new THREE.Group()
    orbitGroup.scale.setScalar(0.56)
    scene.add(orbitGroup)

    const orbitCurve = new THREE.EllipseCurve(0, 0, 1.752, 1.752, 0, Math.PI * 2)
    const orbitPoints = orbitCurve.getPoints(256)
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints)
    const orbitDefinitions = [
      { color: 0xc8dfff, opacity: 0.45, tiltX: 68, tiltY: 0, tiltZ: -12, speed: 0.018 },
      { color: 0xb7d6ff, opacity: 0.4, tiltX: 28, tiltY: 52, tiltZ: 35, speed: -0.014 },
      { color: 0xf2c863, opacity: 0.58, tiltX: 108, tiltY: -38, tiltZ: 0, speed: 0.011 },
    ]
    const orbitalRings = orbitDefinitions.map(({ color, opacity, tiltX, tiltY, tiltZ, speed }) => {
      const ringGroup = new THREE.Group()
      ringGroup.rotation.set(
        THREE.MathUtils.degToRad(tiltX),
        THREE.MathUtils.degToRad(tiltY),
        THREE.MathUtils.degToRad(tiltZ),
      )
      const ringMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthTest: true,
        depthWrite: false,
      })
      ringGroup.add(new THREE.LineLoop(orbitGeometry, ringMaterial))
      orbitGroup.add(ringGroup)
      return { group: ringGroup, material: ringMaterial, speed }
    })

    const ambientLight = new THREE.AmbientLight(0x344862, 0.42)
    scene.add(ambientLight)

    const sunlight = new THREE.DirectionalLight(0xfff2dc, 2.4)
    sunlight.position.set(-3.8, 1.6, 5)
    scene.add(sunlight)

    const starPositions = new Float32Array(900 * 3)
    for (let index = 0; index < starPositions.length; index += 3) {
      starPositions[index] = (Math.random() - 0.5) * 24
      starPositions[index + 1] = (Math.random() - 0.5) * 16
      starPositions[index + 2] = -2 - Math.random() * 12
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({ color: 0xa8b9d2, size: 0.012, transparent: true, opacity: 0.48 })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    let disposed = false
    const azureMapTexture = createAzureMapTexture()
    azureMapTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
    earthMaterial.map = azureMapTexture
    earthMaterial.needsUpdate = true

    const resize = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const dragState = {
      active: false,
      lastX: 0,
      lastY: 0,
      rotationY: -0.32,
      rotationX: 0,
    }
    const autoRotationSpeed = (Math.PI * 2) / 20
    const verticalAngle = THREE.MathUtils.degToRad(25)
    const verticalSpeed = (Math.PI * 2) / 32
    let currentRotationSpeed = autoRotationSpeed

    const pointerDown = (event: PointerEvent) => {
      dragState.active = true
      currentRotationSpeed = 0
      dragState.lastX = event.clientX
      dragState.lastY = event.clientY
      container.setPointerCapture(event.pointerId)
    }

    const pointerMove = (event: PointerEvent) => {
      if (!dragState.active) return

      const deltaX = event.clientX - dragState.lastX
      const deltaY = event.clientY - dragState.lastY
      dragState.lastX = event.clientX
      dragState.lastY = event.clientY

      dragState.rotationY += deltaX * 0.008
      dragState.rotationX = THREE.MathUtils.clamp(
        dragState.rotationX + deltaY * 0.006,
        -verticalAngle,
        verticalAngle,
      )
    }

    const pointerUp = (event: PointerEvent) => {
      dragState.active = false
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId)
      }
    }

    container.addEventListener('pointerdown', pointerDown)
    container.addEventListener('pointermove', pointerMove)
    container.addEventListener('pointerup', pointerUp)
    container.addEventListener('pointercancel', pointerUp)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    resize()

    let previousTime = 0
    let frameId = 0
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const animate = (time: number) => {
      const delta = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time

      if (dragState.active || prefersReducedMotion) {
        currentRotationSpeed = 0
      } else {
        currentRotationSpeed = THREE.MathUtils.damp(currentRotationSpeed, autoRotationSpeed, 2.5, delta)
        dragState.rotationY += delta * currentRotationSpeed
        const automaticPitch = Math.sin((time / 1000) * verticalSpeed) * verticalAngle
        dragState.rotationX = THREE.MathUtils.damp(dragState.rotationX, automaticPitch, 2.5, delta)
      }

      earthGroup.quaternion.setFromEuler(
        new THREE.Euler(dragState.rotationX, dragState.rotationY, 0, 'YXZ'),
      )
      orbitalRings.forEach(({ group, speed }) => {
        group.rotateZ(delta * speed)
      })

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      container.removeEventListener('pointerdown', pointerDown)
      container.removeEventListener('pointermove', pointerMove)
      container.removeEventListener('pointerup', pointerUp)
      container.removeEventListener('pointercancel', pointerUp)
      resizeObserver.disconnect()
      renderer.dispose()
      earthGeometry.dispose()
      earthMaterial.dispose()
      markerGeometry.dispose()
      markerMaterial.dispose()
      azureMapTexture.dispose()
      atmosphereGeometry.dispose()
      atmosphereMaterial.dispose()
      orbitGeometry.dispose()
      orbitalRings.forEach(({ material }) => material.dispose())
      starGeometry.dispose()
      starMaterial.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="globe-shell" aria-label="3D Earth globe" />
}
