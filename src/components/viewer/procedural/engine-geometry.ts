import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

import type { Car } from '@/data/cars'

/*
  Stylised engines, built from the layout in the car data: V8, V12, flat-six,
  W16 and twin-motor electric. Turbochargers and hybrid motors are added when
  the engine description says so. The crank runs along x, the engine sits on
  its sump at y = 0 and is centred on x and z.
*/

export type EngineKind = 'V' | 'flat' | 'W' | 'EV'

export function engineSpec(car: Car) {
  const e = car.engine.toLowerCase()
  const kind: EngineKind = e.includes('electric') || car.cylinders === 0 ? 'EV' : e.includes('flat') ? 'flat' : e.includes('w16') ? 'W' : 'V'
  const turbos = e.includes('quad-turbo') || kind === 'W' ? 4 : e.includes('turbo') ? 2 : 0
  const hybrid = e.includes('hybrid')
  const coverColour =
    car.make === 'Ferrari' ? '#b3131b' : car.make === 'Lamborghini' ? '#c9a227' : car.make === 'McLaren' ? '#16181a' : car.make === 'Bugatti' ? '#1f3b8c' : '#2a2d30'
  return { kind, cylinders: car.cylinders, turbos, hybrid, coverColour }
}

function mats(cover: string) {
  return {
    alloy: new THREE.MeshStandardMaterial({ color: '#b8bdc2', metalness: 1, roughness: 0.32 }),
    cast: new THREE.MeshStandardMaterial({ color: '#3a3d40', metalness: 0.7, roughness: 0.55 }),
    cover: new THREE.MeshPhysicalMaterial({ color: cover, metalness: 0.4, roughness: 0.45, clearcoat: 0.6 }),
    carbon: new THREE.MeshPhysicalMaterial({ color: '#151617', metalness: 0.3, roughness: 0.35, clearcoat: 1 }),
    heat: new THREE.MeshStandardMaterial({ color: '#8b6a4f', metalness: 1, roughness: 0.4 }),
    coil: new THREE.MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.6 }),
    copper: new THREE.MeshStandardMaterial({ color: '#b87333', metalness: 1, roughness: 0.3 }),
    teal: new THREE.MeshStandardMaterial({ color: '#2a7c6e', metalness: 0.6, roughness: 0.35, emissive: '#3a9b8a', emissiveIntensity: 0.25 }),
    battery: new THREE.MeshStandardMaterial({ color: '#1b1f22', metalness: 0.5, roughness: 0.5 }),
    orange: new THREE.MeshStandardMaterial({ color: '#ff6a00', roughness: 0.5 }),
  }
}

type Mats = ReturnType<typeof mats>

function turbo(m: Mats) {
  const g = new THREE.Group()
  const snail = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.035, 14, 28, Math.PI * 1.7), m.heat)
  g.add(snail)
  const comp = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.07, 28), m.alloy)
  comp.rotation.x = Math.PI / 2
  comp.position.z = 0.06
  g.add(comp)
  const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 20, 1, true), m.alloy)
  inlet.rotation.x = Math.PI / 2
  inlet.position.z = 0.12
  g.add(inlet)
  return g
}

function bank(m: Mats, count: number, pitch: number, label: string) {
  const g = new THREE.Group()
  const len = count * pitch + 0.08
  const head = new THREE.Mesh(new RoundedBoxGeometry(len, 0.13, 0.2, 3, 0.03), m.alloy)
  head.position.y = 0.065
  g.add(head)
  const cover = new THREE.Mesh(new RoundedBoxGeometry(len - 0.02, 0.06, 0.17, 3, 0.025), m.cover)
  cover.position.y = 0.16
  g.add(cover)
  // Ribs on the cam cover
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(len - 0.08, 0.008, 0.008), m.cast)
    rib.position.set(0, 0.193, -0.06 + i * 0.04)
    g.add(rib)
  }
  for (let i = 0; i < count; i++) {
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12), m.coil)
    coil.position.set(-len / 2 + 0.04 + pitch / 2 + i * pitch, 0.21, 0)
    g.add(coil)
  }
  g.name = label
  return g
}

function header(m: Mats, from: THREE.Vector3, to: THREE.Vector3) {
  const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, -0.05, 0))
  const curve = new THREE.CatmullRomCurve3([from, mid, to])
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.016, 8, false), m.heat)
}

function combustion(spec: ReturnType<typeof engineSpec>, m: Mats) {
  const g = new THREE.Group()
  const banks = spec.kind === 'W' ? 4 : 2
  const perBank = Math.max(3, Math.round(spec.cylinders / banks))
  const pitch = spec.kind === 'W' ? 0.11 : 0.1
  const len = perBank * pitch + 0.08
  const vAngle = spec.kind === 'flat' ? Math.PI : spec.cylinders >= 12 ? (65 * Math.PI) / 180 : Math.PI / 2

  // Crankcase and sump
  const blockH = spec.kind === 'flat' ? 0.2 : 0.24
  const block = new THREE.Mesh(new RoundedBoxGeometry(len + 0.06, blockH, 0.26, 3, 0.03), m.cast)
  block.position.y = 0.06 + blockH / 2
  g.add(block)
  const sump = new THREE.Mesh(new RoundedBoxGeometry(len, 0.08, 0.22, 2, 0.02), m.cast)
  sump.position.y = 0.04
  g.add(sump)

  const deck = 0.06 + blockH
  const pivot = new THREE.Vector3(0, deck - 0.04, 0)
  const sides = spec.kind === 'W' ? [-1, -0.45, 0.45, 1] : [-1, 1]
  sides.forEach((s, i) => {
    const b = bank(m, perBank, pitch, `bank${i}`)
    const angle = (vAngle / 2) * s
    b.position.copy(pivot)
    b.rotation.x = angle
    // Push each bank out along its own axis.
    const outward = spec.kind === 'flat' ? 0.14 : 0.07
    b.translateY(outward)
    g.add(b)

    // Exhaust headers from each cylinder down and back to a collector.
    for (let c = 0; c < perBank; c++) {
      const port = new THREE.Vector3(-len / 2 + 0.04 + pitch / 2 + c * pitch, 0.06, Math.sign(s || 1) * 0.11)
      port.applyEuler(new THREE.Euler(angle, 0, 0)).add(b.position)
      const collector = new THREE.Vector3(-len / 2 - 0.05, 0.12, Math.sign(s || 1) * (spec.kind === 'flat' ? 0.38 : 0.26))
      g.add(header(m, port, collector))
    }
  })

  // Intake plenum in the vee (or on top for the flat engine).
  if (spec.kind !== 'flat') {
    const plenum = new THREE.Mesh(new RoundedBoxGeometry(len * 0.82, 0.08, 0.16, 3, 0.035), spec.turbos ? m.carbon : m.cover)
    plenum.position.set(0, deck + 0.18, 0)
    g.add(plenum)
    for (let i = 0; i < perBank; i++) {
      for (const s of [-1, 1]) {
        const runner = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.12, 12), m.alloy)
        runner.position.set(-len / 2 + 0.04 + pitch / 2 + i * pitch, deck + 0.12, s * 0.07)
        runner.rotation.x = s * 0.6
        g.add(runner)
      }
    }
  } else {
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 32), m.cover)
    fan.position.set(0, deck + 0.16, 0)
    g.add(fan)
    const airbox = new THREE.Mesh(new RoundedBoxGeometry(len * 0.7, 0.06, 0.3, 3, 0.03), m.carbon)
    airbox.position.set(0, deck + 0.08, 0)
    g.add(airbox)
  }

  // Turbochargers outboard of the banks.
  for (let i = 0; i < spec.turbos; i++) {
    const t = turbo(m)
    const s = i % 2 === 0 ? 1 : -1
    const row = Math.floor(i / 2)
    t.position.set(-len / 2 + 0.06 + row * 0.22, 0.2, s * (spec.kind === 'flat' ? 0.42 : 0.34))
    t.rotation.y = s > 0 ? 0 : Math.PI
    g.add(t)
  }

  // Front timing cover and pulleys.
  const timing = new THREE.Mesh(new RoundedBoxGeometry(0.05, blockH + 0.14, 0.3, 2, 0.02), m.cast)
  timing.position.set(len / 2 + 0.05, 0.06 + (blockH + 0.14) / 2, 0)
  g.add(timing)
  for (const [y, z, r] of [[0.12, 0, 0.07], [0.3, 0.08, 0.04], [0.28, -0.09, 0.045]] as const) {
    const pulley = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.03, 24), m.alloy)
    pulley.rotation.z = Math.PI / 2
    pulley.position.set(len / 2 + 0.09, y, z)
    g.add(pulley)
  }

  // Gearbox behind the bellhousing.
  const gearbox = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.36, 24), m.alloy)
  gearbox.rotation.z = Math.PI / 2
  gearbox.position.set(-len / 2 - 0.22, 0.15, 0)
  g.add(gearbox)

  if (spec.hybrid) {
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 32), m.teal)
    motor.rotation.z = Math.PI / 2
    motor.position.set(-len / 2 - 0.02, 0.16, 0)
    g.add(motor)
    const cable = header(m, new THREE.Vector3(-len / 2 - 0.02, 0.28, 0.08), new THREE.Vector3(-len / 2 - 0.4, 0.04, 0.2))
    cable.material = m.orange
    g.add(cable)
  }
  return g
}

function electric(m: Mats, wheelbase: number) {
  const g = new THREE.Group()
  // Floor battery between the axles, shown in its true place.
  const pack = new THREE.Mesh(new RoundedBoxGeometry(wheelbase - 0.5, 0.12, 1.3, 3, 0.03), m.battery)
  pack.position.set(0, 0.06, 0)
  g.add(pack)
  for (let i = 0; i < 8; i++) {
    for (const s of [-1, 1]) {
      const module = new THREE.Mesh(new RoundedBoxGeometry((wheelbase - 0.7) / 8 - 0.03, 0.02, 0.56, 2, 0.006), m.alloy)
      module.position.set(-(wheelbase - 0.7) / 2 + ((wheelbase - 0.7) / 8) * (i + 0.5), 0.13, s * 0.31)
      g.add(module)
    }
  }
  // One motor on each axle.
  for (const x of [wheelbase / 2 + 0.05, -wheelbase / 2 - 0.05]) {
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.32, 36), m.alloy)
    motor.rotation.x = Math.PI / 2
    motor.position.set(x, 0.3, 0)
    g.add(motor)
    for (let f = 0; f < 9; f++) {
      const fin = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.008, 6, 36), m.cast)
      fin.position.set(x, 0.3, -0.13 + f * 0.033)
      g.add(fin)
    }
    const inverter = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.1, 0.3, 2, 0.02), m.teal)
    inverter.position.set(x + (x > 0 ? -0.18 : 0.18), 0.42, 0)
    g.add(inverter)
    const cable = header(m, new THREE.Vector3(x + (x > 0 ? -0.2 : 0.2), 0.38, 0.12), new THREE.Vector3(x > 0 ? wheelbase / 2 - 0.4 : -wheelbase / 2 + 0.4, 0.12, 0.3))
    cable.material = m.orange
    g.add(cable)
  }
  return g
}

export function buildEngine(car: Car) {
  const spec = engineSpec(car)
  const m = mats(spec.coverColour)
  const group = spec.kind === 'EV' ? electric(m, car.dims.wheelbaseMm / 1000) : combustion(spec, m)
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  group.name = 'engine'
  return { group, spec }
}
