# SuperCar Club dashboard

The members' dashboard for the SuperCar Club: a home page with the season's drives and meets, service reminders and the cars in other members' garages; a member dashboard; a garage where each member keeps up to two cars and can share them with the Club Collection; and a dark showroom for each of ten cars with a hosted Sketchfab 3D viewer.

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
| `src/pages/` | One file per page: sign-in, home, dashboard, garage (My Garage and Club Collection), car showroom, events, members, account |
| `src/components/layout/` | The sticky header, mobile bottom navigation and menu |
| `src/components/site/` | Shared pieces: type and photo primitives, the Sketchfab viewer, RSVP button, footer |
| `src/data/` | The ten cars, their Sketchfab models, sample events, members and editorial stories |
| `src/lib/` | Sign-in state, the member's garage and event replies |
| `src/index.css` | Colours (Gallery White, Obsidian and greys), Newsreader and Geist type, motion |
| `worker/` | The Cloudflare Worker: OAuth, sessions, garage API, Access-protected admin page |
| `public/images/cars/` | A studio still of each car, light (catalogue) and dark (showroom), 800 and 1600 px wide |
| `public/images/editorial/` | The cover photograph and the mountain-drive photograph |

## The 3D showroom

Each car opens in a hosted Sketchfab viewer, which loads only when the member presses **Explore in 3D**. The models, creators and licences are listed in `src/data/showroom.ts` and credited under every viewer. All ten were opened in a browser and reached Sketchfab's "viewer ready" state in October 2026. The studio stills are cut from each model's own Sketchfab preview, so they carry the same credit. Several models are Sketchfab Store or non-commercial (CC BY-NC-SA) models: check each licence before the site is used commercially.

Some hosts cannot show another site in a frame. Build with `VITE_SKETCHFAB_MODE=link` and **Explore in 3D** opens the model on Sketchfab in a new tab instead.

## Sample content

Events, the member directory, club updates and the home page stories are sample content and are labelled as such on the pages. Replies to events are saved in the browser until there is an events service. The garage is real: it is saved to Cloudflare KV for signed-in members, and in the browser in preview. Members can choose to share each car with the Club Collection.

## About the car data

Specs, prices and service intervals are approximate and should be checked against the manufacturer before they are relied on. Service intervals in particular vary by market.

## Static builds

`VITE_HASH_ROUTER=1` switches to hash routes for static hosting without the Worker, and `--base ./` lets the build run from a sub-folder.
