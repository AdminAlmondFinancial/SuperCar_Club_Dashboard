# SuperCar Club dashboard

The members' dashboard for the SuperCar Club: a home page with the season's drives and meets, service reminders and the cars in other members' garages; a garage where each member keeps up to two cars; and an interactive 3D view of the outside of ten real cars, with labelled features, paint colours and facts.

It is a React app (Vite, TypeScript, Tailwind CSS and shadcn-style components) served by a Cloudflare Worker, which also handles sign-in with Google and Microsoft and protects the admin page with Cloudflare Access.

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:5173. Without the Worker running there is no real sign-in, so the sign-in page offers **Preview the dashboard without signing in**. In preview your garage is saved in your browser.

To run it with the Worker (real sign-in, garages saved in Cloudflare KV), follow [DEPLOY.md](DEPLOY.md), then `npm run cf:dev`.

## Deploy

See [DEPLOY.md](DEPLOY.md) for the full step-by-step guide. In short: `npx wrangler login`, create the KV namespace, add the OAuth secrets, then `npm run deploy`.

## Where things live

| Path | What it is |
| --- | --- |
| `src/pages/` | One file per page: sign-in, home, garage, car, events, members |
| `src/components/ui/` | Base components (button, card, input, badge) and the `hero-scrub` scroll animation |
| `src/components/viewer/` | The 3D viewer and the generator for the stylised car models |
| `src/components/memorabilia/` | Line-art decorations (rev counter, chequered flag, steering wheel and more) |
| `src/data/` | The ten cars with specs and facts, plus sample events and members |
| `src/lib/` | Sign-in state and the member's garage |
| `src/index.css` | Colours, type and shared surfaces |
| `worker/` | The Cloudflare Worker: OAuth, sessions, garage API, Access-protected admin page |
| `public/renders/` | Still images of each car, rendered from its 3D model |
| `public/models/` | The Ferrari 458 model and its Draco decoder in `public/draco/` |

`/studio/<car-id>?still` shows a car on a transparent stage; it is used to render the stills in `public/renders`.

## About the 3D cars

The Ferrari 458 Spider uses a detailed model by vicent091036 on Sketchfab, as distributed with the three.js examples; check its licence before commercial use. The other nine cars are stylised models generated in code from each car's published length, width, height and wheelbase, with touches specific to each car (wings, grilles, intakes, wheel designs and caliper colours).

## About the car data

Specs, prices and service intervals are approximate and should be checked against the manufacturer before they are relied on. Service intervals in particular vary by market.

## The home page hero

The scroll animation uses the image frames from the `hero-scrub` component's demo, loaded from `raw.githubusercontent.com/duthiljean/ferrari-hero-demo`. They belong to that repository and are not included here. `public/hero/` holds our own 120-frame turntable of the Ferrari 458 Spider, rendered from the 3D viewer; build with `VITE_HERO_LOCAL=1` to use it instead. `VITE_HASH_ROUTER=1` switches to hash routes for static hosting without the Worker. For a host that cannot serve `.glb` files, build with `VITE_EMBED_MODELS=1` and then run `node scripts/embed-models.mjs`, which writes each model as a script in `dist/models/`.
