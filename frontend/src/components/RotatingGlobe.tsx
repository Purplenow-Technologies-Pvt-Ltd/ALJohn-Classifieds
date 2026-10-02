import { useEffect, useRef } from 'react'
import * as THREE from 'three'

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
      color: 0xbfe0ff,
      emissive: new THREE.Color(0x6ca7d9),
      emissiveIntensity: 0.28,
      specular: new THREE.Color(0xeaf6ff),
      shininess: 30,
    })
    const earthGeometry = new THREE.SphereGeometry(1.62, 128, 128)
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.scale.setScalar(0.8)
    earthGroup.add(earth)

    const markerGeometry = new THREE.SphereGeometry(0.027, 16, 16)
    const markerMaterial = new THREE.MeshPhongMaterial({
      color: 0xf7c75c,
      emissive: 0x8b5a00,
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
          vec3 glow = vec3(0.82, 0.93, 1.0);
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
    let earthTexture: THREE.Texture | undefined
    // NASA Blue Marble: Next Generation, Base Topography; credit NASA Earth Observatory.
    new THREE.TextureLoader().load(
      '/textures/earth-blue-marble-nasa.jpg',
      (texture) => {
        if (disposed) {
          texture.dispose()
          return
        }
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
        earthTexture = texture
        earthMaterial.map = texture
        earthMaterial.needsUpdate = true
      },
    )

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
      earthTexture?.dispose()
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
