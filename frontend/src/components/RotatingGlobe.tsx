import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const createGoldMapTexture = () => {
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
  gradient.addColorStop(0, '#0757a6')
  gradient.addColorStop(0.5, '#087bd2')
  gradient.addColorStop(1, '#063878')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const continents: [number, number][][] = [
    [[-168, 70], [-151, 72], [-140, 69], [-132, 57], [-125, 51], [-124, 42], [-117, 33], [-111, 31], [-108, 24], [-98, 19], [-91, 18], [-86, 13], [-82, 9], [-78, 8], [-77, 18], [-82, 23], [-80, 29], [-75, 35], [-70, 44], [-61, 47], [-54, 52], [-59, 58], [-68, 61], [-72, 68], [-91, 73], [-108, 75], [-125, 73], [-143, 71], [-157, 72]],
    [[-81, 12], [-74, 10], [-66, 11], [-59, 7], [-51, 3], [-47, -7], [-40, -14], [-45, -23], [-51, -30], [-54, -38], [-62, -52], [-69, -56], [-74, -47], [-72, -34], [-77, -19], [-80, -5]],
    [[-53, 82], [-43, 83], [-34, 78], [-24, 73], [-31, 65], [-42, 60], [-51, 63], [-58, 70]],
    [[-11, 36], [-9, 44], [-5, 50], [2, 52], [5, 58], [13, 55], [18, 59], [27, 57], [32, 51], [39, 49], [42, 43], [34, 36], [27, 36], [22, 40], [15, 38], [10, 42], [3, 41], [-1, 37]],
    [[32, 72], [48, 71], [58, 67], [72, 70], [87, 72], [102, 70], [116, 74], [132, 70], [150, 61], [166, 60], [179, 65], [177, 52], [161, 48], [151, 43], [143, 38], [134, 34], [127, 30], [120, 23], [112, 21], [106, 10], [99, 7], [93, 13], [87, 21], [79, 27], [72, 22], [66, 25], [60, 29], [54, 27], [48, 30], [43, 36], [38, 41], [34, 48], [29, 55]],
    [[-17, 37], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 22], [43, 12], [51, 11], [49, 2], [42, -3], [39, -12], [33, -18], [29, -29], [20, -35], [16, -30], [12, -18], [9, -5], [2, 5], [-5, 4], [-12, 10], [-16, 18], [-17, 28]],
    [[35, 31], [45, 29], [55, 25], [58, 19], [51, 16], [49, 12], [43, 12], [39, 17]],
    [[68, 24], [77, 30], [87, 27], [92, 22], [88, 15], [82, 8], [78, 7], [73, 15]],
    [[96, 21], [105, 22], [111, 17], [119, 14], [123, 8], [117, 1], [110, -5], [105, -2], [102, 7]],
    [[130, 32], [136, 35], [142, 42], [145, 44], [143, 36], [138, 33]],
    [[113, -11], [130, -12], [143, -17], [153, -27], [150, -38], [140, -39], [130, -34], [119, -26], [114, -19]],
    [[47, -13], [50, -16], [49, -25], [46, -24]],
    [[-180, -72], [-150, -75], [-120, -73], [-90, -76], [-60, -72], [-30, -75], [0, -70], [30, -74], [60, -72], [90, -76], [120, -73], [150, -75], [180, -72], [180, -90], [-180, -90]],
  ]

  continents.forEach((points) => {
    ctx.beginPath()
    points.forEach(([longitude, latitude], index) => {
      const x = ((longitude + 180) / 360) * canvas.width
      const y = ((90 - latitude) / 180) * canvas.height
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    const fill = ctx.createLinearGradient(0, 100, 0, canvas.height * 0.8)
    fill.addColorStop(0, '#f7df91')
    fill.addColorStop(0.45, '#d8a93d')
    fill.addColorStop(1, '#9b6820')
    ctx.fillStyle = fill
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(255, 224, 145, 0.75)'
    ctx.stroke()
  })

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
      color: 0x4a90e2,
      emissive: new THREE.Color(0x0750b5),
      emissiveIntensity: 0.58,
      specular: new THREE.Color(0x9bcfff),
      shininess: 24,
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

    const ambientLight = new THREE.AmbientLight(0x174b83, 0.5)
    scene.add(ambientLight)

    const sunlight = new THREE.DirectionalLight(0xd6eaff, 1.3)
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
    const goldMapTexture = createGoldMapTexture()
    goldMapTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
    earthMaterial.map = goldMapTexture
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
      goldMapTexture.dispose()
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
