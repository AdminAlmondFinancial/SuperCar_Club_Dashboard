import { CameraControls, ContactShadows, Environment, Html, Lightformer, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import type { Car, Hotspot } from '@/data/cars'
import { cn } from '@/lib/utils'

import { buildCar, layoutFor, type CarLayout } from './procedural/car-geometry'
import { buildEngine } from './procedural/engine-geometry'

export type ViewMode = 'exterior' | 'interior' | 'engine'

/** Cars with a detailed, openly licensed scan instead of the stylised body. */
const MODELS: Record<string, string> = {
  'ferrari-458-italia': '/models/ferrari-458.glb',
}

// ---------------------------------------------------------------------------

function useGhost(root: THREE.Object3D | null, ghost: boolean, keep: (o: THREE.Object3D) => boolean) {
  useEffect(() => {
    if (!root) return
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const list = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.Material[]
      for (const mat of list) {
        const ud = mat.userData as { baseOpacity?: number; baseTransparent?: boolean; baseDepthWrite?: boolean }
        if (ud.baseOpacity === undefined) {
          ud.baseOpacity = mat.opacity
          ud.baseTransparent = mat.transparent
          ud.baseDepthWrite = mat.depthWrite
        }
        let skip = false
        for (let p: THREE.Object3D | null = o; p; p = p.parent) if (keep(p)) skip = true
        const on = ghost && !skip
        mat.transparent = on ? true : !!ud.baseTransparent
        mat.opacity = on ? Math.min(ud.baseOpacity, 0.07) : ud.baseOpacity
        mat.depthWrite = on ? false : !!ud.baseDepthWrite
        mat.needsUpdate = true
      }
    })
  }, [root, ghost, keep])
}

function ProceduralCar({ car, colour, mode }: { car: Car; colour: string; mode: ViewMode }) {
  const built = useMemo(() => buildCar(car, colour), [car]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    built.mats.paint.color.set(colour)
  }, [built, colour])
  useEffect(() => {
    // Interior view is a cutaway: the shell is sliced at the waistline so you look down into the cockpit.
    const cut = mode === 'interior' ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), built.lay.topAt(built.lay.eye.x) - 0.04)] : []
    for (const m of [built.mats.paint, built.mats.glass]) {
      m.clippingPlanes = cut
      m.side = cut.length ? THREE.DoubleSide : THREE.FrontSide
      m.needsUpdate = true
    }
  }, [built, mode])
  useGhost(built.root, mode === 'engine', isWheel)
  return <primitive object={built.root} />
}

const isWheel = (o: THREE.Object3D) => o.name === 'wheels' || o.name.startsWith('wheel_')

function ScannedCar({ url, colour, lay, mode }: { url: string; colour: string; lay: CarLayout; mode: ViewMode }) {
  const gltf = useGLTF(url, '/draco/')
  const { scene, paint } = useMemo(() => {
    const scene = gltf.scene.clone(true)
    let paint: THREE.MeshPhysicalMaterial | null = null
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      const m = mesh.material as THREE.MeshStandardMaterial
      if (m.name === 'Body_Color') {
        paint ??= new THREE.MeshPhysicalMaterial({ color: colour, metalness: 0.6, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 })
        mesh.material = paint
      } else if (m.name === 'Glass_Gray') {
        mesh.material = new THREE.MeshPhysicalMaterial({ color: '#0b0f10', metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false })
      } else {
        mesh.material = m.clone()
      }
    })
    // Fit the scan to the car's real length, sit it on the ground and face it along +x.
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const wrap = new THREE.Group()
    wrap.add(scene)
    if (size.z > size.x) wrap.rotation.y = -Math.PI / 2
    const s = lay.L / Math.max(size.x, size.z)
    scene.scale.setScalar(s)
    const centre = box.getCenter(new THREE.Vector3()).multiplyScalar(s)
    scene.position.set(-centre.x, -box.min.y * s, -centre.z)
    return { scene: wrap, paint: paint as THREE.MeshPhysicalMaterial | null }
  }, [gltf, lay]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    paint?.color.set(colour)
  }, [paint, colour])
  useGhost(scene, mode === 'engine', isScanWheel)
  return <primitive object={scene} />
}

const isScanWheel = (o: THREE.Object3D) => /^wheel_|^rim_/.test(o.name)

function Engine({ car, lay, visible, onBox }: { car: Car; lay: CarLayout; visible: boolean; onBox: (b: THREE.Box3) => void }) {
  const { group, spec } = useMemo(() => buildEngine(car), [car])
  const ref = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    if (!ref.current) return
    ref.current.updateWorldMatrix(true, true)
    onBox(new THREE.Box3().setFromObject(ref.current))
  }, [onBox, spec])
  const pos =
    spec.kind === 'EV'
      ? new THREE.Vector3((lay.frontAxle + lay.rearAxle) / 2, lay.profile.clearance + 0.02, 0)
      : lay.enginePos.clone().setY(lay.profile.clearance + 0.06)
  return (
    <group ref={ref} position={pos} visible={visible}>
      <primitive object={group} />
    </group>
  )
}

// ---------------------------------------------------------------------------

function floorTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
  g.addColorStop(0, 'rgba(58,155,138,0.28)')
  g.addColorStop(0.35, 'rgba(12,38,32,0.3)')
  g.addColorStop(0.7, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Studio({ floor = true }: { floor?: boolean }) {
  const tex = useMemo(floorTexture, [])
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.6} color="#ffffff" scale={[10, 2, 1]} position={[0, 5, 0]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} color="#ffffff" scale={[10, 1, 1]} position={[0, 5, -3]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} color="#ffffff" scale={[10, 1, 1]} position={[0, 5, 3]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.1} color="#d9f2ec" scale={[3, 5, 1]} position={[-7, 2, 0]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={3} color="#fff3dd" scale={[4, 8, 1]} position={[7, 2, 0]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.2} color="#3a9b8a" scale={4} position={[0, 3, 8]} />
        <Lightformer form="rect" intensity={4} color="#cfe9e3" scale={[14, 2.5, 1]} position={[0, 1.5, -9]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" scale={[2, 6, 1]} position={[-9, 1.5, 5]} rotation-y={Math.PI / 3} />
        <Lightformer form="rect" intensity={1.1} color="#ffffff" scale={[8, 1.5, 1]} position={[0, 1.2, 9]} />
      </Environment>
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 3]} intensity={0.7} />
      {floor && (
        <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
          <circleGeometry args={[9, 64]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} />
        </mesh>
      )}
      <ContactShadows position={[0, 0.001, 0]} opacity={0.85} scale={12} blur={2.4} far={2.2} resolution={512} color="#000000" />
    </>
  )
}

// ---------------------------------------------------------------------------

type HotspotPin = Hotspot & { at: THREE.Vector3 }

function placeHotspots(car: Car, lay: CarLayout, mode: ViewMode, engineBox: THREE.Box3 | null): HotspotPin[] {
  const list = car.hotspots[mode]
  if (mode === 'engine' && engineBox) {
    const c = engineBox.getCenter(new THREE.Vector3())
    const s = engineBox.getSize(new THREE.Vector3())
    const spots = [
      new THREE.Vector3(c.x + s.x * 0.3, engineBox.max.y + 0.02, c.z),
      new THREE.Vector3(c.x - s.x * 0.2, engineBox.max.y - 0.04, c.z + s.z * 0.45),
      new THREE.Vector3(c.x - s.x * 0.45, c.y, c.z - s.z * 0.4),
      new THREE.Vector3(c.x + s.x * 0.45, c.y - s.y * 0.2, c.z - s.z * 0.2),
    ]
    return list.map((h, i) => ({ ...h, at: spots[i % spots.length] }))
  }
  return list.map((h) => {
    const [nx, ny, nz] = h.pos
    const at = new THREE.Vector3((nx * lay.L) / 2, ny * lay.H, (nz * lay.W) / 2)
    if (mode === 'interior') {
      at.x = THREE.MathUtils.clamp(at.x, lay.eye.x + 0.2, lay.glassX.ws - 0.1)
      at.y = THREE.MathUtils.clamp(at.y, lay.profile.clearance + 0.2, lay.H - 0.15)
      at.z = THREE.MathUtils.clamp(at.z, -lay.W * 0.35, lay.W * 0.35)
    } else {
      at.y = Math.max(at.y, 0.15)
      // Keep exterior pins on the skin rather than buried inside it.
      at.z = Math.sign(at.z) * Math.max(Math.abs(at.z), Math.abs(nz) > 0.5 ? lay.halfWidthAt(at.x) + 0.02 : 0)
      if (Math.abs(nx) > 0.9) at.x = Math.sign(nx) * (lay.L / 2 + 0.03)
    }
    return { ...h, at }
  })
}

/** Nudges pins apart so their labels never sit on top of each other. */
function spread(pins: HotspotPin[]) {
  const placed: THREE.Vector3[] = []
  return pins.map((p) => {
    const at = p.at.clone()
    while (placed.some((q) => q.distanceTo(at) < 0.16)) at.y += 0.13
    placed.push(at)
    return { ...p, at }
  })
}

function Pins({ pins, active, onSelect }: { pins: HotspotPin[]; active: string | null; onSelect: (id: string | null) => void }) {
  return (
    <>
      {pins.map((p) => (
        <Html key={p.id} position={p.at} center zIndexRange={[20, 0]}>
          <button
            type="button"
            onClick={() => onSelect(active === p.id ? null : p.id)}
            aria-pressed={active === p.id}
            aria-label={p.label}
            className={cn(
              'group flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[12px] whitespace-nowrap backdrop-blur-md transition-colors duration-300',
              active === p.id ? 'border-teal bg-teal/90 text-ink' : 'border-white/15 bg-black/45 text-ivory hover:bg-black/70',
            )}
          >
            <span className={cn('relative flex size-5 items-center justify-center rounded-full', active === p.id ? 'bg-ink' : 'bg-ivory/15')}>
              <span className={cn('size-1.5 rounded-full', active === p.id ? 'bg-teal-bright' : 'bg-ivory')} />
              {active !== p.id && <span className="absolute inset-0 animate-ping rounded-full bg-ivory/20 motion-reduce:hidden" />}
            </span>
            {p.label}
          </button>
        </Html>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------

function Rig({ lay, mode, engineBox, still }: { lay: CarLayout; mode: ViewMode; engineBox: THREE.Box3 | null; still?: boolean }) {
  const ref = useRef<CameraControls>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const smooth = !still
    if (mode === 'exterior') {
      camera.fov = 32
      camera.updateProjectionMatrix()
      c.minDistance = lay.L * 0.8
      c.maxDistance = lay.L * 2.6
      c.minPolarAngle = 0.15
      c.maxPolarAngle = Math.PI / 2 - 0.04
      c.azimuthRotateSpeed = c.polarRotateSpeed = 1
      void c.setLookAt(lay.L * 0.95, lay.H * 1.05, lay.L * 1.25, 0, lay.H * 0.42, 0, smooth)
    } else if (mode === 'interior') {
      camera.fov = 40
      camera.updateProjectionMatrix()
      const e = lay.eye
      c.minDistance = 1.2
      c.maxDistance = 3.2
      c.minPolarAngle = 0.05
      c.maxPolarAngle = Math.PI / 2 - 0.25
      c.azimuthRotateSpeed = c.polarRotateSpeed = 1
      // Above and behind the driver's shoulder, looking down into the cockpit.
      void c.setLookAt(e.x - 1.15, e.y + 1.05, e.z + 0.55, e.x + 0.35, e.y - 0.4, 0, smooth)
    } else {
      camera.fov = 34
      camera.updateProjectionMatrix()
      const box = engineBox ?? new THREE.Box3(lay.enginePos.clone().subScalar(0.4), lay.enginePos.clone().addScalar(0.4))
      const centre = box.getCenter(new THREE.Vector3())
      const r = box.getSize(new THREE.Vector3()).length()
      c.minDistance = r * 0.9
      c.maxDistance = r * 4
      c.minPolarAngle = 0.1
      c.maxPolarAngle = Math.PI / 2 - 0.02
      c.azimuthRotateSpeed = c.polarRotateSpeed = 1
      void c.setLookAt(centre.x + r * 1.3, centre.y + r * 1.25, centre.z + r * 1.55, centre.x, centre.y, centre.z, smooth)
    }
  }, [mode, lay, engineBox, camera, still])
  return <CameraControls ref={ref} makeDefault smoothTime={0.6} draggingSmoothTime={0.12} />
}

export type CarViewerProps = {
  car: Car
  colour: string
  mode: ViewMode
  showHotspots?: boolean
  activeHotspot?: string | null
  onHotspot?: (id: string | null) => void
  /** Studio renders: no pins, no transitions, buffer kept for screenshots. */
  still?: boolean
  className?: string
}

export function CarViewer({ car, colour, mode, showHotspots = true, activeHotspot = null, onHotspot, still, className }: CarViewerProps) {
  const lay = useMemo(() => layoutFor(car), [car])
  const [engineBox, setEngineBox] = useState<THREE.Box3 | null>(null)
  const pins = useMemo(() => spread(placeHotspots(car, lay, mode, engineBox)), [car, lay, mode, engineBox])
  const modelUrl = MODELS[car.id]

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: !!still }}
      camera={{ position: [lay.L, lay.H, lay.L * 1.3], fov: 32, near: 0.005, far: 80 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.35
      }}
    >
      <Suspense fallback={null}>
        <Studio floor={!still} />
        {modelUrl ? <ScannedCar url={modelUrl} colour={colour} lay={lay} mode={mode} /> : <ProceduralCar car={car} colour={colour} mode={mode} />}
        <Engine car={car} lay={lay} visible={mode === 'engine'} onBox={setEngineBox} />
        {showHotspots && !still && <Pins pins={pins} active={activeHotspot} onSelect={(id) => onHotspot?.(id)} />}
      </Suspense>
      <Rig lay={lay} mode={mode} engineBox={engineBox} still={still} />
    </Canvas>
  )
}
