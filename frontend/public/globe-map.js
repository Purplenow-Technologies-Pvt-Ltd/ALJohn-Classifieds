(function () {
  var SELECTOR = '.globe-shell[aria-label="3D Earth globe"]'
  if (document.querySelector('[data-gold-map="true"]') || document.querySelector(SELECTOR + ' canvas')) {
    return
  }
  var SPHERE_RATIO = 0.502
  var TILT = (-18 * Math.PI) / 180
  var SPIN_SECONDS = 24

  function toPolygons(geojson) {
    var polygons = []
    geojson.features.forEach(function (feature) {
      var g = feature.geometry
      if (g.type === 'Polygon') polygons.push(g.coordinates)
      else if (g.type === 'MultiPolygon') g.coordinates.forEach(function (p) { polygons.push(p) })
    })
    return polygons
  }

  function start(host, polygons) {
    var canvas = document.createElement('canvas')
    canvas.setAttribute('data-gold-map', 'true')
    canvas.style.cssText = 'position:absolute;top:50%;left:50%;z-index:2;pointer-events:none;transform:translate(-50%,-50%)'
    host.appendChild(canvas)
    var ctx = canvas.getContext('2d')
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    var size = 0
    var dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      size = Math.max(Math.round(host.clientWidth * SPHERE_RATIO), 1)
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
    }
    resize()
    new ResizeObserver(resize).observe(host)

    var sinT = Math.sin(TILT)
    var cosT = Math.cos(TILT)

    function project(lon, lat, rot) {
      var lam = ((lon * Math.PI) / 180) + rot
      var phi = (lat * Math.PI) / 180
      var cp = Math.cos(phi)
      var x = cp * Math.sin(lam)
      var y = Math.sin(phi)
      var z = cp * Math.cos(lam)
      var y2 = y * cosT - z * sinT
      var z2 = y * sinT + z * cosT
      return { x: x, y: y2, z: z2 }
    }

    var startTime = null

    function draw(time) {
      if (startTime === null) startTime = time
      var elapsed = time - startTime
      var rot = reduced ? 0 : -((elapsed / 1000) / SPIN_SECONDS) * Math.PI * 2
      var r = (size * dpr) / 2
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.beginPath()
      ctx.arc(r, r, r, 0, Math.PI * 2)
      ctx.clip()

      ctx.fillStyle = '#e3b84f'
      ctx.strokeStyle = 'rgba(255, 231, 160, 0.9)'
      ctx.lineWidth = Math.max(dpr * 0.7, 1)
      ctx.lineJoin = 'round'

      polygons.forEach(function (rings) {
        ctx.beginPath()
        var anyFront = false
        rings.forEach(function (ring) {
          ring.forEach(function (pt, i) {
            var p = project(pt[0], pt[1], rot)
            if (p.z > 0) anyFront = true
            var x = p.x
            var y = p.y
            if (p.z < 0) {
              var len = Math.hypot(x, y) || 1
              x /= len
              y /= len
            }
            var px = r + x * r
            var py = r - y * r
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          })
          ctx.closePath()
        })
        if (anyFront) {
          ctx.fill('evenodd')
          ctx.stroke()
        }
      })

      var shade = ctx.createRadialGradient(r * 0.62, r * 0.55, r * 0.1, r, r, r)
      shade.addColorStop(0, 'rgba(255, 244, 200, 0.35)')
      shade.addColorStop(0.6, 'rgba(0, 0, 0, 0)')
      shade.addColorStop(1, 'rgba(60, 30, 0, 0.5)')
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = shade
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()

      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
  }

  function waitForHost(callback) {
    var found = document.querySelector(SELECTOR)
    if (found) return callback(found)
    var observer = new MutationObserver(function () {
      var el = document.querySelector(SELECTOR)
      if (el) {
        observer.disconnect()
        callback(el)
      }
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }

  fetch('/land.json')
    .then(function (res) { return res.json() })
    .then(function (geojson) {
      var polygons = toPolygons(geojson)
      waitForHost(function (host) { start(host, polygons) })
    })
})()
