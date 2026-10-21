import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

import type { Car } from '@/data/cars'

/*
  Stylised, parametric car bodies.

  Every car is lofted from superellipse cross-sections along its length, using
  the real length, width, height and wheelbase from the car data. Each body
  archetype (mid-engined, front-engined GT, rear-engined 911, SUV) supplies a
  side profile and a glasshouse. Wheel arches are formed by lifting the lower
  edge of each section around the axles, and fenders rise over the wheels the
  way they do on the real cars.

  Conventions: the car faces +x, y is up, the origin is on the ground under the
  middle of the car, and +z is the right-hand (driver's, UK) side.
*/

export type Archetype = 'mid' | 'hyper' | 'gt' | 'rear' | 'suv'

type Profile = {
  /** Upper body line: [t, height as a fraction of total height], t = 0 at the nose, 1 at the tail. */
  top: [number, number][]
  /** Glasshouse stations as t: windscreen base, roof start, roof end, rear base. */
  glass: [number, number, number, number]
  /** Share of the overhangs that sits ahead of the front axle. */
  frontOverhang: number
  /** Superellipse exponent: higher is boxier. */
  squareness: number
  clearance: number
  wheelRadius: number
  /** Roof width as a share of body width. */
  roofWidth: number
}

const PROFILES: Record<Archetype, Profile> = {
  mid: {
    top: [[0, 0.27], [0.03, 0.36], [0.12, 0.42], [0.27, 0.47], [0.5, 0.6], [0.72, 0.66], [0.93, 0.64], [1, 0.5]],
    glass: [0.27, 0.45, 0.58, 0.84],
    frontOverhang: 0.56,
    squareness: 3.4,
    clearance: 0.11,
    wheelRadius: 0.345,
    roofWidth: 0.6,
  },
  hyper: {
    top: [[0, 0.3], [0.03, 0.4], [0.14, 0.46], [0.29, 0.5], [0.5, 0.62], [0.74, 0.7], [0.94, 0.68], [1, 0.55]],
    glass: [0.29, 0.44, 0.56, 0.76],
    frontOverhang: 0.52,
    squareness: 3.2,
    clearance: 0.11,
    wheelRadius: 0.36,
    roofWidth: 0.58,
  },
  gt: {
    top: [[0, 0.34], [0.03, 0.44], [0.16, 0.5], [0.4, 0.56], [0.66, 0.62], [0.9, 0.64], [1, 0.54]],
    glass: [0.39, 0.55, 0.67, 0.93],
    frontOverhang: 0.45,
    squareness: 3.6,
    clearance: 0.12,
    wheelRadius: 0.36,
    roofWidth: 0.64,
  },
  rear: {
    top: [[0, 0.34], [0.04, 0.42], [0.2, 0.48], [0.3, 0.53], [0.6, 0.6], [0.86, 0.62], [0.97, 0.58], [1, 0.48]],
    glass: [0.3, 0.45, 0.58, 0.96],
    frontOverhang: 0.47,
    squareness: 3.2,
    clearance: 0.11,
    wheelRadius: 0.35,
    roofWidth: 0.62,
  },
  suv: {
    top: [[0, 0.5], [0.015, 0.58], [0.06, 0.6], [0.3, 0.62], [0.97, 0.63], [1, 0.58]],
    glass: [0.3, 0.34, 0.95, 0.975],
    frontOverhang: 0.44,
    squareness: 9,
    clearance: 0.24,
    wheelRadius: 0.42,
    roofWidth: 0.86,
  },
}

/** Per-car touches that make each one recognisable. */
type Trim = {
  archetype: Archetype
  caliper: string
  rimSpokes: number
  rimFinish: 'silver' | 'dark' | 'gold'
  wing?: 'swan-neck' | 'ducktail' | 'lip'
  grille?: 'pantheon' | 'mesh' | 'horseshoe' | 'slats' | 'none'
  headlights: 'slim' | 'round' | 'vertical'
  sideIntake?: boolean
  tallNose?: number
  exhaust: { count: number; centre?: boolean }
}

const TRIMS: Record<string, Trim> = {
  'ferrari-amalfi': { archetype: 'gt', caliper: '#d9b300', rimSpokes: 5, rimFinish: 'silver', headlights: 'slim', grille: 'none', wing: 'lip', exhaust: { count: 4 } },
  'ferrari-458-italia': { archetype: 'mid', caliper: '#d9b300', rimSpokes: 5, rimFinish: 'silver', headlights: 'slim', sideIntake: true, exhaust: { count: 3, centre: true } },
  'porsche-911-gt3-rs': { archetype: 'rear', caliper: '#c8102e', rimSpokes: 10, rimFinish: 'dark', headlights: 'round', wing: 'swan-neck', exhaust: { count: 2, centre: true } },
  'lamborghini-revuelto': { archetype: 'hyper', caliper: '#e0a100', rimSpokes: 6, rimFinish: 'dark', headlights: 'slim', sideIntake: true, wing: 'lip', exhaust: { count: 2, centre: true } },
  'mclaren-750s': { archetype: 'mid', caliper: '#ff7a00', rimSpokes: 10, rimFinish: 'dark', headlights: 'slim', sideIntake: true, wing: 'lip', exhaust: { count: 2, centre: true } },
  'aston-martin-vanquish': { archetype: 'gt', caliper: '#1d1d1d', rimSpokes: 10, rimFinish: 'dark', headlights: 'slim', grille: 'slats', wing: 'ducktail', exhaust: { count: 4 } },
  'mercedes-amg-g63': { archetype: 'suv', caliper: '#c8102e', rimSpokes: 6, rimFinish: 'dark', headlights: 'round', grille: 'slats', exhaust: { count: 4 } },
  'rolls-royce-spectre': { archetype: 'gt', caliper: '#8a8f94', rimSpokes: 7, rimFinish: 'silver', headlights: 'slim', grille: 'pantheon', tallNose: 0.12, exhaust: { count: 0 } },
  'bentley-continental-gt-speed': { archetype: 'gt', caliper: '#c8102e', rimSpokes: 10, rimFinish: 'silver', headlights: 'round', grille: 'mesh', tallNose: 0.05, exhaust: { count: 2 } },
  'bugatti-chiron-super-sport': { archetype: 'hyper', caliper: '#1f3b8c', rimSpokes: 5, rimFinish: 'silver', headlights: 'slim', grille: 'horseshoe', sideIntake: true, exhaust: { count: 4, centre: true } },
}

export function trimFor(car: Car): Trim {
  return (
    TRIMS[car.id] ?? {
      archetype: car.body === 'suv' ? 'suv' : car.enginePosition === 'mid' ? 'mid' : car.enginePosition === 'rear' ? 'rear' : 'gt',
      caliper: '#444',
      rimSpokes: 5,
      rimFinish: 'silver',
      headlights: 'slim',
      exhaust: { count: 2 },
    }
  )
}

// ---------------------------------------------------------------------------
// Layout: real dimensions to scene units (metres)

export type CarLayout = {
  L: number
  W: number
  H: number
  wheelbase: number
  frontAxle: number
  rearAxle: number
  wheelRadius: number
  trackHalf: number
  profile: Profile
  trim: Trim
  /** Body top height at a given x. */
  topAt: (x: number) => number
  /** Body half width at a given x. */
  halfWidthAt: (x: number) => number
  /** Glasshouse stations in x. */
  glassX: { ws: number; rs: number; re: number; rb: number }
  /** Seated eye point for the interior camera. */
  eye: THREE.Vector3
  enginePos: THREE.Vector3
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Monotone cubic interpolation through [t, v] points. */
function curve(points: [number, number][]) {
  return (t: number) => {
    if (t <= points[0][0]) return points[0][1]
    for (let i = 1; i < points.length; i++) {
      const [t1, v1] = points[i]
      const [t0, v0] = points[i - 1]
      if (t <= t1) {
        const k = smoothstep(0, 1, (t - t0) / (t1 - t0))
        return v0 + (v1 - v0) * k
      }
    }
    return points[points.length - 1][1]
  }
}

export function layoutFor(car: Car): CarLayout {
  const trim = trimFor(car)
  const profile = PROFILES[trim.archetype]
  const L = car.dims.lengthMm / 1000
  // Published widths sometimes include mirrors; keep bodies believable.
  const W = Math.min(car.dims.widthMm / 1000, 2.04)
  const H = car.dims.heightMm / 1000
  const wheelbase = car.dims.wheelbaseMm / 1000
  const overhangs = L - wheelbase
  const frontAxle = L / 2 - overhangs * profile.frontOverhang
  const rearAxle = frontAxle - wheelbase
  const wheelRadius = profile.wheelRadius
  const toT = (x: number) => (L / 2 - x) / L
  const toX = (t: number) => L / 2 - t * L

  const top = curve(profile.top.map(([t, v], i) => [t, i < 2 && trim.tallNose ? v + trim.tallNose : v]))
  const archTop = wheelRadius + 0.05

  const topAt = (x: number) => {
    let y = top(toT(x)) * H
    // Fenders swell over each wheel.
    for (const ax of [frontAxle, rearAxle]) {
      const d = Math.abs(x - ax)
      const reach = wheelRadius * 2
      const bulge = archTop + 0.06 + (trim.archetype === 'suv' ? 0.06 : 0)
      if (d < reach && bulge > y) {
        const k = Math.cos((d / reach) * Math.PI * 0.5)
        y += (bulge - y) * k * k
      }
    }
    return y
  }

  const halfWidthAt = (x: number) => {
    const t = toT(x)
    const nose = trim.archetype === 'suv' ? 0.94 : 0.7
    const tail = trim.archetype === 'suv' ? 0.95 : 0.82
    let w = (W / 2) * (nose + (1 - nose) * smoothstep(0, 0.14, t))
    w *= 1 - (1 - tail) * smoothstep(0.86, 1, t)
    // Hips over the rear wheels on mid- and rear-engined cars.
    if (trim.archetype !== 'suv' && trim.archetype !== 'gt') {
      const d = Math.abs(x - rearAxle)
      if (d < 0.7) w *= 1 + 0.02 * Math.cos((d / 0.7) * Math.PI * 0.5)
    }
    return Math.min(w, W / 2)
  }

  const [ws, rs, re, rb] = profile.glass.map(toX)
  const eyeX = ws - (ws - rs) * 0.1 - 0.62
  const seatBase = profile.clearance + 0.14
  const eye = new THREE.Vector3(eyeX, Math.min(seatBase + 0.66, H - 0.12), W * 0.2)

  const enginePos =
    car.enginePosition === 'mid'
      ? new THREE.Vector3(rearAxle + 0.72, profile.clearance + 0.36, 0)
      : car.enginePosition === 'rear'
        ? new THREE.Vector3(rearAxle - 0.42, profile.clearance + 0.34, 0)
        : new THREE.Vector3(frontAxle - 0.42, profile.clearance + 0.38 + (trim.archetype === 'suv' ? 0.18 : 0), 0)

  return {
    L,
    W,
    H,
    wheelbase,
    frontAxle,
    rearAxle,
    wheelRadius,
    trackHalf: W / 2 - 0.16,
    profile,
    trim,
    topAt,
    halfWidthAt,
    glassX: { ws, rs, re, rb },
    eye,
    enginePos,
  }
}

// ---------------------------------------------------------------------------
// Loft

type Station = { x: number; yb: number; yt: number; hwBottom: number; hwTop: number }

/** Builds a closed tube through superellipse sections, capped at both ends. */
function loft(stations: Station[], n: number, segments = 56) {
  const positions: number[] = []
  const indices: number[] = []
  const ring = segments
  for (const s of stations) {
    const ym = (s.yb + s.yt) / 2
    const hh = (s.yt - s.yb) / 2
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2
      const c = Math.cos(a)
      const sn = Math.sin(a)
      const ex = 2 / n
      const px = Math.sign(c) * Math.pow(Math.abs(c), ex)
      const py = Math.sign(sn) * Math.pow(Math.abs(sn), ex)
      // Blend the half width from bottom to top for tumblehome.
      const k = (py + 1) / 2
      const hw = s.hwBottom + (s.hwTop - s.hwBottom) * k
      positions.push(s.x, ym + hh * py, hw * px)
    }
  }
  for (let j = 0; j < stations.length - 1; j++) {
    for (let i = 0; i < ring; i++) {
      const a = j * ring + i
      const b = j * ring + ((i + 1) % ring)
      const c = (j + 1) * ring + i
      const d = (j + 1) * ring + ((i + 1) % ring)
      indices.push(a, b, c, b, d, c)
    }
  }
  // End caps
  const capCentre = (j: number) => {
    const s = stations[j]
    positions.push(s.x, (s.yb + s.yt) / 2, 0)
    return positions.length / 3 - 1
  }
  const f = capCentre(0)
  const r = capCentre(stations.length - 1)
  const last = (stations.length - 1) * ring
  for (let i = 0; i < ring; i++) {
    indices.push(f, (i + 1) % ring, i)
    indices.push(r, last + i, last + ((i + 1) % ring))
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// ---------------------------------------------------------------------------
// Materials

export type CarMaterials = {
  paint: THREE.MeshPhysicalMaterial
  glass: THREE.MeshPhysicalMaterial
  trim: THREE.MeshStandardMaterial
  chrome: THREE.MeshStandardMaterial
  rubber: THREE.MeshStandardMaterial
  rim: THREE.MeshStandardMaterial
  disc: THREE.MeshStandardMaterial
  caliper: THREE.MeshStandardMaterial
  headlight: THREE.MeshStandardMaterial
  taillight: THREE.MeshStandardMaterial
  leather: THREE.MeshStandardMaterial
  leatherAccent: THREE.MeshStandardMaterial
  carpet: THREE.MeshStandardMaterial
  screen: THREE.MeshStandardMaterial
}

export function createMaterials(paintHex: string, trim: Trim): CarMaterials {
  const rimColour = trim.rimFinish === 'dark' ? '#2b2e31' : trim.rimFinish === 'gold' ? '#b8995e' : '#c9cdd1'
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color: paintHex,
      metalness: 0.55,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#56676d',
      metalness: 0.45,
      roughness: 0.04,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 2.2,
    }),
    trim: new THREE.MeshStandardMaterial({ color: '#0b0c0d', roughness: 0.55, metalness: 0.3 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.08, metalness: 1 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.9 }),
    rim: new THREE.MeshStandardMaterial({ color: rimColour, roughness: 0.22, metalness: 1 }),
    disc: new THREE.MeshStandardMaterial({ color: '#5a5d60', roughness: 0.45, metalness: 0.9 }),
    caliper: new THREE.MeshStandardMaterial({ color: trim.caliper, roughness: 0.35, metalness: 0.2 }),
    headlight: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#e8f4ff', emissiveIntensity: 2.4 }),
    taillight: new THREE.MeshStandardMaterial({ color: '#400', emissive: '#ff2a1a', emissiveIntensity: 2.2 }),
    leather: new THREE.MeshStandardMaterial({ color: '#1c1a18', roughness: 0.7 }),
    leatherAccent: new THREE.MeshStandardMaterial({ color: '#8c5a3c', roughness: 0.65 }),
    carpet: new THREE.MeshStandardMaterial({ color: '#0e0e0e', roughness: 1 }),
    screen: new THREE.MeshStandardMaterial({ color: '#05100e', emissive: '#3a9b8a', emissiveIntensity: 0.55, roughness: 0.2 }),
  }
}

// ---------------------------------------------------------------------------
// Parts

function body(lay: CarLayout, mats: CarMaterials) {
  const { L, profile, frontAxle, rearAxle, wheelRadius } = lay
  const stations: Station[] = []
  const N = 160
  const archR = wheelRadius + 0.045
  for (let i = 0; i <= N; i++) {
    // Pack stations tighter at the ends so noses and tails stay round.
    const u = i / N
    const t = 0.5 - 0.5 * Math.cos(u * Math.PI)
    const x = L / 2 - t * L
    const yt = lay.topAt(x)
    let yb = profile.clearance
    for (const ax of [frontAxle, rearAxle]) {
      const d = Math.abs(x - ax)
      if (d < archR) yb = Math.max(yb, wheelRadius + Math.sqrt(archR * archR - d * d) * 0.98)
    }
    yb = Math.min(yb, yt - 0.07)
    // Round off the nose and tail vertically.
    const endT = Math.min(t, 1 - t)
    const pinch = 1 - 0.55 * (1 - smoothstep(0, 0.035, endT))
    const mid = (yb + yt) / 2
    const hw = lay.halfWidthAt(x) * (0.35 + 0.65 * smoothstep(0, 0.03, endT))
    stations.push({
      x,
      yb: mid - (mid - yb) * pinch,
      yt: mid + (yt - mid) * pinch,
      hwBottom: hw * 0.96,
      hwTop: hw * (profile.squareness > 6 ? 0.97 : 0.88),
    })
  }
  const mesh = new THREE.Mesh(loft(stations, profile.squareness, 64), mats.paint)
  mesh.name = 'body'
  mesh.castShadow = true
  return mesh
}

function glasshouse(lay: CarLayout, mats: CarMaterials) {
  const { ws, rs, re, rb } = lay.glassX
  const g = new THREE.Group()
  const stations: Station[] = []
  const N = 60
  for (let i = 0; i <= N; i++) {
    const x = ws + (rb - ws) * (i / N)
    const belt = lay.topAt(x) - 0.02
    const rise = smoothstep(ws, rs, x)
    const fall = 1 - smoothstep(re, rb, x)
    const roofY = lay.H
    const yt = belt + (roofY - belt) * Math.min(rise, fall)
    const hw = lay.halfWidthAt(x)
    stations.push({
      x,
      yb: belt - 0.08,
      yt: Math.max(yt, belt + 0.02),
      hwBottom: hw * (lay.trim.archetype === 'suv' ? 0.9 : 0.8),
      hwTop: hw * lay.profile.roofWidth,
    })
  }
  const glassMesh = new THREE.Mesh(loft(stations, lay.trim.archetype === 'suv' ? 8 : 3, 48), mats.glass)
  glassMesh.name = 'glass'
  g.add(glassMesh)

  // Body-coloured roof panel and A/C pillars: a slightly larger loft clipped to the top.
  const roofStations = stations
    .filter((s) => s.x <= rs + 0.05 && s.x >= re - 0.05)
    .map((s) => ({ ...s, yb: s.yt - 0.03, yt: s.yt + 0.008, hwBottom: s.hwTop * 1.0, hwTop: s.hwTop * 0.92 }))
  if (roofStations.length > 2) {
    const roof = new THREE.Mesh(loft(roofStations, 4, 40), mats.paint)
    roof.name = 'roof'
    roof.castShadow = true
    g.add(roof)
  }
  return g
}

function rimShape(r: number, spokes: number) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, r, 0, Math.PI * 2, false)
  const inner = r * 0.82
  const hub = r * 0.26
  const gap = (Math.PI * 2) / spokes
  const spokeHalf = spokes >= 10 ? gap * 0.18 : gap * 0.2
  for (let i = 0; i < spokes; i++) {
    const a0 = i * gap + spokeHalf
    const a1 = (i + 1) * gap - spokeHalf
    const hole = new THREE.Path()
    hole.moveTo(Math.cos(a0) * hub * 1.25, Math.sin(a0) * hub * 1.25)
    hole.lineTo(Math.cos(a0 + gap * 0.04) * inner, Math.sin(a0 + gap * 0.04) * inner)
    hole.absarc(0, 0, inner, a0 + gap * 0.04, a1 - gap * 0.04, false)
    hole.lineTo(Math.cos(a1) * hub * 1.25, Math.sin(a1) * hub * 1.25)
    hole.absarc(0, 0, hub * 1.25, a1, a0, true)
    shape.holes.push(hole)
  }
  return shape
}

function wheel(lay: CarLayout, mats: CarMaterials, side: 1 | -1, rearWheel: boolean) {
  const r = lay.wheelRadius
  const width = rearWheel && lay.trim.archetype !== 'suv' ? 0.3 : 0.26
  const g = new THREE.Group()

  // Tyre: a lathe with rounded shoulders.
  const pts: THREE.Vector2[] = []
  const rim = r * 0.74
  const steps = 10
  pts.push(new THREE.Vector2(rim, -width / 2))
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * Math.PI
    pts.push(new THREE.Vector2(r - 0.03 + Math.cos(a) * 0.03, (width / 2 - 0.03) * Math.sin(a) + Math.sin(a) * 0.03))
  }
  pts.push(new THREE.Vector2(rim, width / 2))
  const tyre = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mats.rubber)
  tyre.rotation.x = Math.PI / 2
  tyre.castShadow = true
  g.add(tyre)

  // Rim face with cut-out spokes.
  const face = new THREE.Mesh(
    new THREE.ExtrudeGeometry(rimShape(rim, lay.trim.rimSpokes), { depth: 0.05, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 48 }),
    mats.rim,
  )
  face.position.z = side * (width / 2 - 0.07)
  if (side < 0) face.rotation.y = Math.PI
  g.add(face)

  // Barrel behind the spokes so the wheel reads as solid.
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rim * 0.99, rim * 0.99, width * 0.9, 40, 1, true), mats.disc)
  barrel.rotation.x = Math.PI / 2
  g.add(barrel)
  const backing = new THREE.Mesh(new THREE.CircleGeometry(rim, 40), mats.trim)
  backing.position.z = -side * (width / 2 - 0.02)
  if (side > 0) backing.rotation.y = Math.PI
  g.add(backing)

  // Brake disc and caliper.
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rim * 0.86, rim * 0.86, 0.03, 40), mats.disc)
  disc.rotation.x = Math.PI / 2
  disc.position.z = side * 0.01
  g.add(disc)
  const caliper = new THREE.Mesh(new RoundedBoxGeometry(0.1, rim * 0.62, 0.075, 2, 0.02), mats.caliper)
  const ca = rearWheel ? Math.PI * 0.75 : Math.PI * 0.25
  caliper.position.set(Math.cos(ca) * rim * 0.68, Math.sin(ca) * rim * 0.68, side * 0.045)
  caliper.rotation.z = ca - Math.PI / 2
  g.add(caliper)

  g.position.set(rearWheel ? lay.rearAxle : lay.frontAxle, r, side * (lay.trackHalf + (rearWheel ? 0.01 : 0)))
  g.name = `wheel_${rearWheel ? 'r' : 'f'}${side > 0 ? 'r' : 'l'}`
  return g
}

function lights(lay: CarLayout, mats: CarMaterials) {
  const g = new THREE.Group()
  const noseX = lay.L / 2
  const frontTop = lay.topAt(noseX - 0.25)
  const tailTop = lay.topAt(-lay.L / 2 + 0.18)
  const t = lay.trim

  for (const side of [-1, 1]) {
    const z = side * lay.halfWidthAt(noseX - 0.25) * 0.68
    if (t.headlights === 'round') {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 28), mats.headlight)
      lamp.rotation.z = Math.PI / 2
      lamp.position.set(noseX - (t.archetype === 'suv' ? 0.03 : 0.2), frontTop - 0.09, z)
      if (t.archetype !== 'suv') lamp.rotation.y = side * -0.35
      g.add(lamp)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 32), mats.chrome)
      ring.rotation.y = Math.PI / 2 + (t.archetype !== 'suv' ? side * -0.35 : 0)
      ring.position.copy(lamp.position).add(new THREE.Vector3(0.012, 0, 0))
      g.add(ring)
    } else {
      const lamp = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.035, 0.3, 2, 0.012), mats.headlight)
      const lx = noseX - 0.3
      lamp.position.set(lx, lay.topAt(lx) - 0.03, side * lay.halfWidthAt(lx) * 0.62)
      lamp.rotation.y = side * 0.38
      lamp.rotation.z = -0.25
      g.add(lamp)
    }
  }

  // Tail lights: a full-width band, or two lamps on the boxier cars.
  if (t.archetype === 'suv') {
    for (const side of [-1, 1]) {
      const lamp = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.22, 0.1, 2, 0.01), mats.taillight)
      lamp.position.set(-lay.L / 2 + 0.02, tailTop - 0.12, side * (lay.W / 2 - 0.08))
      g.add(lamp)
    }
  } else {
    const band = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.03, lay.W * 0.78, 2, 0.01), mats.taillight)
    band.position.set(-lay.L / 2 + 0.06, tailTop - 0.06, 0)
    g.add(band)
  }
  return g
}

function details(lay: CarLayout, mats: CarMaterials) {
  const g = new THREE.Group()
  const t = lay.trim
  const noseX = lay.L / 2

  // Mirrors
  for (const side of [-1, 1]) {
    const x = lay.glassX.ws - 0.12
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.085, 0.12, 2, 0.03), mats.paint)
    m.position.set(x, lay.topAt(x) + 0.07, side * (lay.halfWidthAt(x) + 0.04))
    g.add(m)
  }

  // Front opening: grille or lower intake.
  const grilleY = lay.profile.clearance + 0.16
  if (t.grille === 'pantheon') {
    const frame = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.34, 0.62, 2, 0.02), mats.chrome)
    frame.position.set(noseX - 0.02, lay.topAt(noseX - 0.05) - 0.22, 0)
    g.add(frame)
    for (let i = -6; i <= 6; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.012), mats.chrome)
      bar.position.set(noseX - 0.0, frame.position.y, i * 0.044)
      g.add(bar)
    }
  } else if (t.grille === 'horseshoe') {
    const hs = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 10, 40, Math.PI * 1.25), mats.chrome)
    hs.rotation.y = Math.PI / 2
    hs.rotation.x = Math.PI * 0.625 + Math.PI
    hs.position.set(noseX - 0.04, grilleY + 0.1, 0)
    g.add(hs)
    const fill = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32), mats.trim)
    fill.rotation.y = Math.PI / 2
    fill.position.set(noseX - 0.05, grilleY + 0.1, 0)
    g.add(fill)
  } else if (t.grille === 'mesh' || t.grille === 'slats') {
    const w = t.archetype === 'suv' ? 0.7 : 0.8
    const grille = new THREE.Mesh(new RoundedBoxGeometry(0.04, t.archetype === 'suv' ? 0.3 : 0.2, w, 2, 0.02), mats.trim)
    grille.position.set(noseX - (t.archetype === 'suv' ? 0.0 : 0.04), t.archetype === 'suv' ? lay.topAt(noseX) - 0.22 : grilleY + 0.04, 0)
    g.add(grille)
    const bars = t.grille === 'slats' ? 5 : 0
    for (let i = 0; i < bars; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, w * 0.94), mats.chrome)
      bar.position.set(grille.position.x + 0.022, grille.position.y - 0.1 + i * 0.05, 0)
      g.add(bar)
    }
  } else {
    const intake = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.12, lay.W * 0.62, 2, 0.03), mats.trim)
    intake.position.set(noseX - 0.1, grilleY, 0)
    g.add(intake)
  }

  // Side intakes ahead of the rear wheels on mid-engined cars.
  if (t.sideIntake) {
    for (const side of [-1, 1]) {
      const x = lay.rearAxle + lay.wheelRadius + 0.32
      const intake = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.16, 0.05, 2, 0.04), mats.trim)
      intake.position.set(x, lay.profile.clearance + 0.32, side * (lay.halfWidthAt(x) * 0.98))
      intake.rotation.y = side * 0.05
      g.add(intake)
    }
  }

  // Rear wings
  if (t.wing === 'swan-neck') {
    const x = -lay.L / 2 + 0.3
    const wing = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.03, lay.W * 0.84, 2, 0.012), mats.trim)
    wing.position.set(x, lay.H + 0.06, 0)
    wing.rotation.z = 0.12
    g.add(wing)
    for (const side of [-1, 1]) {
      const plate = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.18, 0.012, 2, 0.005), mats.trim)
      plate.position.set(x, lay.H + 0.04, side * lay.W * 0.42)
      g.add(plate)
      const neck = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.42, 0.025, 2, 0.008), mats.trim)
      neck.position.set(x + 0.02, lay.H - 0.16, side * 0.28)
      neck.rotation.z = 0.3
      g.add(neck)
    }
  } else if (t.wing === 'ducktail' || t.wing === 'lip') {
    const x = -lay.L / 2 + 0.12
    const lip = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.025, lay.W * 0.78, 2, 0.01), t.wing === 'lip' ? mats.trim : mats.paint)
    lip.position.set(x, lay.topAt(x) + 0.01, 0)
    lip.rotation.z = 0.18
    g.add(lip)
  }

  // Rear diffuser and exhausts.
  const diffuser = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.1, lay.W * 0.7, 2, 0.03), mats.trim)
  diffuser.position.set(-lay.L / 2 + 0.12, lay.profile.clearance + 0.06, 0)
  g.add(diffuser)
  const { count, centre } = t.exhaust
  const tipGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 24, 1, true)
  const tipInner = new THREE.CircleGeometry(0.04, 24)
  for (let i = 0; i < count; i++) {
    const spread = centre ? 0.11 : lay.W * 0.3
    const pairOffset = centre ? 0 : (i % 2 === 0 ? -1 : 1) * 0.06
    const z = centre ? (i - (count - 1) / 2) * spread : (i < count / 2 ? -1 : 1) * spread + pairOffset
    const tip = new THREE.Mesh(tipGeo, mats.chrome)
    tip.rotation.z = Math.PI / 2
    tip.position.set(-lay.L / 2 + 0.03, lay.profile.clearance + (centre ? 0.2 : 0.08), z)
    g.add(tip)
    const soot = new THREE.Mesh(tipInner, mats.trim)
    soot.rotation.y = -Math.PI / 2
    soot.position.copy(tip.position).add(new THREE.Vector3(-0.04, 0, 0))
    g.add(soot)
  }

  // SUV extras: spare wheel on the tailgate and side steps.
  if (t.archetype === 'suv') {
    const spare = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 36), mats.paint)
    spare.rotation.z = Math.PI / 2
    spare.position.set(-lay.L / 2 - 0.1, lay.H * 0.55, 0)
    g.add(spare)
    for (const side of [-1, 1]) {
      const step = new THREE.Mesh(new RoundedBoxGeometry(lay.wheelbase - 0.9, 0.04, 0.16, 2, 0.015), mats.trim)
      step.position.set((lay.frontAxle + lay.rearAxle) / 2, lay.profile.clearance + 0.02, side * (lay.W / 2 - 0.02))
      g.add(step)
    }
  }
  return g
}

function cabin(lay: CarLayout, mats: CarMaterials) {
  const g = new THREE.Group()
  g.name = 'cabin'
  const floorY = lay.profile.clearance + 0.06
  const seatX = lay.eye.x - 0.12
  const dashX = lay.glassX.ws - 0.22

  const floor = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(dashX - seatX) + 0.9, 0.02, lay.W * 0.8), mats.carpet)
  floor.position.set((dashX + seatX) / 2 - 0.2, floorY, 0)
  g.add(floor)

  for (const side of [-1, 1]) {
    const z = side * lay.W * 0.2
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.12, 0.48, 3, 0.05), mats.leather)
    base.position.set(seatX, floorY + 0.12, z)
    g.add(base)
    const back = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.66, 0.48, 3, 0.05), mats.leather)
    back.position.set(seatX - 0.26, floorY + 0.46, z)
    back.rotation.z = -0.22
    g.add(back)
    // Contrast bolsters
    for (const b of [-1, 1]) {
      const bolster = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.62, 0.06, 2, 0.025), mats.leatherAccent)
      bolster.position.set(seatX - 0.22, floorY + 0.46, z + b * 0.22)
      bolster.rotation.z = -0.22
      g.add(bolster)
    }
  }

  // Dashboard and binnacle
  const dashTop = Math.min(lay.eye.y - 0.2, lay.topAt(dashX + 0.1) - 0.03)
  const dash = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.2, lay.halfWidthAt(dashX) * 1.5, 3, 0.07), mats.leather)
  dash.position.set(dashX - 0.1, dashTop - 0.1, 0)
  g.add(dash)
  const stitch = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.012, lay.halfWidthAt(dashX) * 1.4), mats.leatherAccent)
  stitch.position.set(dashX - 0.31, dashTop - 0.04, 0)
  g.add(stitch)

  const cluster = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.12, 0.3, 2, 0.01), mats.screen)
  cluster.position.set(dashX - 0.3, dashTop + 0.03, lay.eye.z)
  cluster.rotation.z = 0.25
  g.add(cluster)

  const centreScreen = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.16, 0.24, 2, 0.01), mats.screen)
  centreScreen.position.set(dashX - 0.34, dashTop - 0.1, 0)
  centreScreen.rotation.z = 0.35
  g.add(centreScreen)

  const console = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.2, 0.2, 3, 0.05), mats.leather)
  console.position.set(seatX + 0.32, floorY + 0.16, 0)
  g.add(console)

  // Steering wheel on the right (UK) side.
  const wheelGroup = new THREE.Group()
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 14, 48), mats.leather)
  wheelGroup.add(rim)
  const marker = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.024, 14, 6, 0.12), mats.leatherAccent)
  marker.rotation.z = Math.PI / 2 - 0.06
  wheelGroup.add(marker)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 24), mats.trim)
  hub.rotation.x = Math.PI / 2
  wheelGroup.add(hub)
  for (const a of [0, Math.PI, -Math.PI / 2]) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.028, 0.015), mats.trim)
    spoke.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0)
    spoke.rotation.z = a
    wheelGroup.add(spoke)
  }
  wheelGroup.position.set(lay.eye.x + 0.42, lay.eye.y - 0.27, lay.eye.z)
  wheelGroup.rotation.y = Math.PI / 2
  wheelGroup.rotation.x = 0
  wheelGroup.rotateX(-0.35)
  g.add(wheelGroup)
  return g
}

/** Builds the full stylised car. Returns the group plus the paint material so colour can change live. */
export function buildCar(car: Car, paintHex: string) {
  const lay = layoutFor(car)
  const mats = createMaterials(paintHex, lay.trim)
  const root = new THREE.Group()
  root.name = car.id

  const shell = new THREE.Group()
  shell.name = 'shell'
  shell.add(body(lay, mats), glasshouse(lay, mats), lights(lay, mats), details(lay, mats))
  root.add(shell)
  root.add(cabin(lay, mats))
  const wheels = new THREE.Group()
  wheels.name = 'wheels'
  wheels.add(wheel(lay, mats, 1, false), wheel(lay, mats, -1, false), wheel(lay, mats, 1, true), wheel(lay, mats, -1, true))
  root.add(wheels)

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return { root, lay, mats }
}
