// Writes dist/models/<name>.js next to each dist/models/<name>.glb, for hosts that cannot serve .glb files.
// Build with VITE_EMBED_MODELS=1 so the viewer loads these scripts instead of the .glb files.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('../dist/models/', import.meta.url)
for (const f of readdirSync(dir).filter((f) => f.endsWith('.glb'))) {
  const name = f.slice(0, -4)
  const b64 = readFileSync(new URL(f, dir)).toString('base64')
  writeFileSync(
    new URL(`${name}.js`, dir),
    `(function(){var s=atob('${b64}'),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);` +
      `(window.__GLB=window.__GLB||{})[${JSON.stringify(name)}]=URL.createObjectURL(new Blob([a],{type:'model/gltf-binary'}))})();\n`,
  )
  console.log(`models/${name}.js`)
}
