import { asset } from '@/lib/asset'

/**
 * Hosted Sketchfab models for the ten cars in the register. Each one was opened in a browser and
 * reached Sketchfab's "viewer ready" state before it was listed here (October 2026).
 * The stills in public/images/cars are cut from each model's own Sketchfab preview and set on a
 * studio background, so they are the creator's work too and carry the same credit.
 */
export type SketchfabModel = {
  uid: string
  title: string
  author: string
  username: string
  /** Licence as Sketchfab lists it. Store models have no Creative Commons licence. */
  license: string
  licenseUrl?: string
}

export const sketchfab: Record<string, SketchfabModel> = {
  'ferrari-amalfi': {
    uid: '5d45d570c914440ea37339cd5aad70fa',
    title: 'Ferrari Amalfi',
    author: 'Patricars',
    username: 'patricars',
    license: 'Sketchfab Store model',
  },
  'ferrari-458-italia': {
    uid: 'd12eab5e5c6d421da468e1c348a860a6',
    title: '2013 Ferrari 458 Spider',
    author: 'Ddiaz Design',
    username: 'ddiaz-design',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  'porsche-911-gt3-rs': {
    uid: 'f17a982d5d8a4d97baef4b00b51a4e9a',
    title: '2023 Porsche 911 GT3 RS 2.7 Carrera Tribute 992',
    author: 'Ddiaz Design',
    username: 'ddiaz-design',
    license: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  'lamborghini-revuelto': {
    uid: 'c8c3b98df5aa419b97073a476340e1c3',
    title: 'Lamborghini Revuelto',
    author: 'Patricars',
    username: 'patricars',
    license: 'Sketchfab Store model',
  },
  'mclaren-750s': {
    uid: '5c7448447d9643ee9b2f9b8bf46c860f',
    title: 'McLaren 750S',
    author: 'Patricars',
    username: 'patricars',
    license: 'Sketchfab Store model',
  },
  'aston-martin-vanquish': {
    uid: '5bac68efda6e4de8931618e9402455c3',
    title: 'Aston Martin Vanquish',
    author: 'Anatolian Studios',
    username: 'AnatolianStudios',
    license: 'Sketchfab Store model',
  },
  'mercedes-amg-g63': {
    uid: '236e0736b4e14d80b95de53183023a26',
    title: 'Mercedes-Benz G63 AMG (G-Wagon)',
    author: 'GORDEYKOMARK',
    username: 'gordeykomark',
    license: 'Sketchfab Standard licence',
    licenseUrl: 'https://sketchfab.com/licenses',
  },
  'rolls-royce-spectre': {
    uid: '99fcb692e396433b96ead8b0b0ebc71f',
    title: '2026 Rolls-Royce Spectre',
    author: 'tonielpro520',
    username: 'tonielpro520',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  'bentley-continental-gt-speed': {
    uid: 'b76934e1cde542e6b2325740758b70a5',
    title: 'Bentley Continental GT Speed',
    author: 'Patricars',
    username: 'patricars',
    license: 'Sketchfab Store model',
  },
  'bugatti-chiron-super-sport': {
    uid: '6a7520f6853f433eb200ed10fef96f94',
    title: '2022 Bugatti Chiron Super Sport',
    author: 'Ddiaz Design',
    username: 'ddiaz-design',
    license: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
}

export const modelPageUrl = (m: SketchfabModel) => `https://sketchfab.com/3d-models/${m.uid}`
export const authorUrl = (m: SketchfabModel) => `https://sketchfab.com/${m.username}`
export const embedUrl = (m: SketchfabModel) =>
  `https://sketchfab.com/models/${m.uid}/embed?autostart=1&preload=1&ui_theme=dark&ui_hint=2&ui_infos=0&ui_watermark_link=0&dnt=1`

export type Tone = 'light' | 'dark'

/** Studio still of a car: light for the catalogue, dark for the showroom. */
export function carImage(carId: string, tone: Tone = 'light') {
  const base = `images/cars/${carId}-${tone}`
  return {
    src: asset(`${base}-1600.webp`),
    srcSet: `${asset(`${base}-800.webp`)} 800w, ${asset(`${base}-1600.webp`)} 1600w`,
    width: 1600,
    height: 1000,
  }
}
