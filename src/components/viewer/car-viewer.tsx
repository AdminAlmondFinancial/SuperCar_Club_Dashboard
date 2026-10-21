import { CameraControls, ContactShadows, Environment, Html, Lightformer, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { Car, Hotspot } from '@/data/cars'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

import { buildCar, layoutFor, type CarLayout } from './procedural/car-geometry'

/** Cars with a detailed, openly licensed scan instead of the stylised body. */
type ScanModel = {
  url: string
  /** Body painted in the reference cobalt (#1f4fd1) and recoloured by keying that hue, instead of a named paint material. */
  keyed?: boolean
  /** Turn the scan half a revolution so its nose points along +x. */
  flip?: boolean
}

const MODELS: Record<string, ScanModel> = {
  'ferrari-458-italia': { url: asset('models/ferrari-458.glb') },
  'lamborghini-revuelto': { url: asset('models/lamborghini-revuelto.glb'), keyed: true },
}

/**
 * Swaps the reference cobalt in a scan's colour texture for the chosen paint, keeping the texture's shading,
 * and gives those texels a glossy clear coat.
 */
function keyedPaint(src: THREE.MeshStandardMaterial, colour: string) {
  const mat = new THREE.MeshPhysicalMaterial({
    map: src.map,
    normalMap: src.normalMap,
    roughnessMap: src.roughnessMap,
    metalnessMap: src.metalnessMap,
    roughness: 1,
    metalness: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  })
  const paint = { value: new THREE.Color(colour) }
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uPaint = paint
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform vec3 uPaint;\nfloat paintKey = 0.0;\nvoid main() {')
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          vec3 t = sampledDiffuseColor.rgb;
          float hi = max(t.r, t.g);
          // Strongly blue texels are body paint; the ratio test leaves grey glass and black trim alone.
          paintKey = smoothstep(0.04, 0.12, t.b - hi) * smoothstep(0.45, 0.7, (t.b - hi) / max(t.b, 1e-3));
          vec3 painted = uPaint * clamp(t.b / 0.637, 0.15, 1.4);
          diffuseColor.rgb = mix(diffuseColor.rgb, painted, paintKey);
        }`,
      )
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.32, paintKey);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.55, paintKey);')
      .replace('#include <clearcoat_fragment_maps>', '#include <clearcoat_fragment_maps>\nmaterial.clearcoat *= paintKey;')
  }
  return { mat, paint: paint.value }
}

// ---------------------------------------------------------------------------

function ProceduralCar({ car, colour }: { car: Car; colour: string }) {
  const built = useMemo(() => buildCar(car, colour), [car]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    built.mats.paint.color.set(colour)
  }, [built, colour])
  return <primitive object={built.root} />
}

function ScannedCar({ model, colour, lay }: { model: ScanModel; colour: string; lay: CarLayout }) {
  const gltf = useGLTF(model.url, asset('draco/'))
  const { scene, paint } = useMemo(() => {
    const scene = gltf.scene.clone(true)
    let paint: THREE.Color | null = null
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      const m = mesh.material as THREE.MeshStandardMaterial
      if (model.keyed) {
        const k = keyedPaint(m, colour)
        mesh.material = k.mat
        paint = k.paint
      } else if (m.name === 'Body_Color') {
        const mat = new THREE.MeshPhysicalMaterial({ color: colour, metalness: 0.6, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 })
        mesh.material = mat
        paint ??= mat.color
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
    if (model.flip) wrap.rotation.y += Math.PI
    const s = lay.L / Math.max(size.x, size.z)
    scene.scale.setScalar(s)
    const centre = box.getCenter(new THREE.Vector3()).multiplyScalar(s)
    scene.position.set(-centre.x, -box.min.y * s, -centre.z)
    return { scene: wrap, paint: paint as THREE.Color | null }
  }, [gltf, lay, model]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    paint?.set(colour)
  }, [paint, colour])
  return <primitive object={scene} />
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
        {/* Thin overhead strips draw clean highlight lines along the bonnet instead of washing it white */}
        <Lightformer form="rect" intensity={1.2} color="#ffffff" scale={[10, 0.35, 1]} position={[0, 5, 0]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" scale={[10, 0.25, 1]} position={[0, 5, -2.5]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" scale={[10, 0.25, 1]} position={[0, 5, 2.5]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.1} color="#d9f2ec" scale={[3, 5, 1]} position={[-7, 2, 0]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={3} color="#fff3dd" scale={[4, 8, 1]} position={[7, 2, 0]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.2} color="#3a9b8a" scale={4} position={[0, 3, 8]} />
        <Lightformer form="rect" intensity={1.6} color="#cfe9e3" scale={[14, 0.6, 1]} position={[0, 2.2, -9]} />
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

function placeHotspots(car: Car, lay: CarLayout): HotspotPin[] {
  return car.hotspots.map((h) => {
    const [nx, ny, nz] = h.pos
    const at = new THREE.Vector3((nx * lay.L) / 2, Math.max(ny * lay.H, 0.15), (nz * lay.W) / 2)
    // Keep pins on the skin rather than buried inside it.
    at.z = Math.sign(at.z) * Math.max(Math.abs(at.z), Math.abs(nz) > 0.5 ? lay.halfWidthAt(at.x) + 0.02 : 0)
    if (Math.abs(nx) > 0.9) at.x = Math.sign(nx) * (lay.L / 2 + 0.03)
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
              'group flex items-center gap-2 rounded-full border p-1 text-[12px] whitespace-nowrap backdrop-blur-md transition-colors duration-300',
              active === p.id ? 'border-teal bg-teal/90 pr-3 text-ink' : 'border-white/15 bg-black/45 text-ivory hover:bg-black/70 hover:pr-3 focus-visible:pr-3',
            )}
          >
            <span className={cn('relative flex size-5 items-center justify-center rounded-full', active === p.id ? 'bg-ink' : 'bg-ivory/15')}>
              <span className={cn('size-1.5 rounded-full', active === p.id ? 'bg-teal-bright' : 'bg-ivory')} />
              {active !== p.id && <span className="absolute inset-0 animate-ping rounded-full bg-ivory/20 motion-reduce:hidden" />}
            </span>
            {/* Labels stay hidden until hovered or chosen, so pins never pile up on small screens. */}
            <span className={cn(active === p.id ? 'inline' : 'hidden group-hover:inline group-focus-visible:inline')}>{p.label}</span>
          </button>
        </Html>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------

function Rig({ lay, still, azimuth }: { lay: CarLayout; still?: boolean; azimuth?: number }) {
  const ref = useRef<CameraControls>(null)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  useEffect(() => {
    const c = ref.current
    if (!c) return
    // Pull back on tall, narrow screens so the whole car still fits.
    const k = Math.max(1, Math.pow(1.4 / aspect, 0.8))
    c.minDistance = lay.L * 0.8
    c.maxDistance = lay.L * 2.6 * k
    c.minPolarAngle = 0.15
    c.maxPolarAngle = Math.PI / 2 - 0.04
    if (azimuth !== undefined) {
      // Studio turntable: orbit at a fixed height and distance.
      const r = lay.L * 1.57 * k
      void c.setLookAt(Math.cos(azimuth) * r, lay.H * 1.05 * k, Math.sin(azimuth) * r, 0, lay.H * 0.42, 0, false)
      return
    }
    void c.setLookAt(lay.L * 0.95 * k, lay.H * 1.05 * k, lay.L * 1.25 * k, 0, lay.H * 0.42, 0, !still)
  }, [lay, still, aspect, azimuth])
  return <CameraControls ref={ref} makeDefault smoothTime={0.6} draggingSmoothTime={0.12} />
}

export type CarViewerProps = {
  car: Car
  colour: string
  showHotspots?: boolean
  activeHotspot?: string | null
  onHotspot?: (id: string | null) => void
  /** Studio renders: no pins, no transitions, buffer kept for screenshots. */
  still?: boolean
  /** Studio turntable angle in radians. */
  azimuth?: number
  className?: string
}

export function CarViewer({ car, colour, showHotspots = true, activeHotspot = null, onHotspot, still, azimuth, className }: CarViewerProps) {
  const lay = useMemo(() => layoutFor(car), [car])
  const pins = useMemo(() => spread(placeHotspots(car, lay)), [car, lay])
  const model = MODELS[car.id]

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: !!still }}
      camera={{ position: [lay.L, lay.H, lay.L * 1.3], fov: 32, near: 0.05, far: 80 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.35
      }}
    >
      <Suspense fallback={null}>
        <Studio floor={!still} />
        {model ? <ScannedCar model={model} colour={colour} lay={lay} /> : <ProceduralCar car={car} colour={colour} />}
        {showHotspots && !still && <Pins pins={pins} active={activeHotspot} onSelect={(id) => onHotspot?.(id)} />}
      </Suspense>
      <Rig lay={lay} still={still} azimuth={azimuth} />
    </Canvas>
  )
}
