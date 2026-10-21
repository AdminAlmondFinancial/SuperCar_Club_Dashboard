# Deploying the SuperCar Club dashboard

This guide puts the dashboard on the internet using Cloudflare Workers. It takes about 45 minutes the first time. You do not need to be a developer, but you will copy and paste a few commands.

The site is one Cloudflare Worker. It serves the pages, handles "Sign in with Google" and "Sign in with Microsoft", remembers each member's garage, and protects a private members list at `/admin`.

## What you need

- A free Cloudflare account (https://dash.cloudflare.com/sign-up).
- Node.js 20 or newer (https://nodejs.org, choose the LTS download).
- A Google account (to create the Google sign-in) and a Microsoft work or personal account (for the Microsoft sign-in). You can launch with only one of them.
- This project folder, open in a terminal.

## 1. Install and build

```bash
npm install
npm run build
```

`npm run build` makes the finished website in the `dist` folder. Run it again whenever the design changes.

## 2. Log in to Cloudflare

```bash
npx wrangler login
```

A browser window opens. Approve the request.

## 3. Create the storage

Members and garages are saved in Cloudflare KV, a simple key-value store.

```bash
npx wrangler kv namespace create CLUB_KV
```

The command prints a block containing `"id": "abcd1234..."`. Open `wrangler.jsonc` and paste that id over the existing `id` under `kv_namespaces`. (The club's own account already has `the-super-car-club-CLUB_KV`, and its id is in the file.)

## 4. Choose your address

Your site will live at `https://the-super-car-club.<your-subdomain>.workers.dev`. Your subdomain is shown in the Cloudflare dashboard under Workers & Pages. If you have your own domain, use that instead.

Open `wrangler.jsonc` and set `APP_URL` to the full address with no slash at the end. The sign-in buttons need this to be exact.

Then deploy once so the address exists (sign-in will not work yet, which is fine):

```bash
npm run deploy
```

## 5. Create the Google sign-in

1. Go to https://console.cloud.google.com and create a project (any name, for example "SuperCar Club").
2. Open APIs & Services, then OAuth consent screen. Choose External, fill in the app name and your email, and save. Add the scopes `openid`, `email` and `profile` if asked.
3. Open Credentials, then Create credentials, then OAuth client ID. Application type: Web application.
4. Under Authorised redirect URIs add exactly:
   `https://<your-worker>.workers.dev/api/auth/google/callback`
   (use your real address from step 4).
5. Click Create. Copy the Client ID and Client secret.
6. While the consent screen is in "Testing" only the test users you list can sign in. Click Publish app when you are ready for everyone.

## 6. Create the Microsoft sign-in

1. Go to https://entra.microsoft.com, then Identity, Applications, App registrations, New registration.
2. Name it "SuperCar Club". For Supported account types, choose "Accounts in any organizational directory and personal Microsoft accounts" so everyone can sign in. (Choose a single directory instead if only your own organisation should sign in, and see the tenant note below.)
3. Under Redirect URI choose Web and enter exactly:
   `https://<your-worker>.workers.dev/api/auth/microsoft/callback`
4. Click Register. Copy the Application (client) ID from the overview page.
5. Open Certificates & secrets, then New client secret. Copy the secret Value straight away; it is only shown once.

Tenant note: `MICROSOFT_TENANT` in `wrangler.jsonc` is `common` by default, which matches the "any account" choice above. For a single organisation, replace it with your Directory (tenant) ID.

## 7. Save the secrets

Secrets are private values. They are stored in Cloudflare and never written into the project files. Run each command and paste the value when asked:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put MICROSOFT_CLIENT_ID
npx wrangler secret put MICROSOFT_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
```

For `SESSION_SECRET` use a long random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Keep it safe. Changing it later signs every member out.

If you only set up one provider, the other button sends members back to the sign-in page with a "not configured" message.

## 8. Protect the admin page with Cloudflare Access

The members list at `/admin` is only shown to people Cloudflare Access has let in.

1. In the Cloudflare dashboard open Zero Trust. The first time, pick a team name; this becomes your team domain, `<team>.cloudflareaccess.com`.
2. Go to Access, then Applications, then Add an application, then Self-hosted.
3. Give it a name such as "SuperCar Club admin". Add a public hostname: your Worker's hostname (for example `the-super-car-club.<your-subdomain>.workers.dev`) with the path `admin`. Add a second entry with path `admin/*`.
4. Add a policy: Action Allow, and include the email addresses of the people who may see the member list.
5. Save. Open the application again and copy the Application Audience (AUD) tag.
6. Save the two values as secrets:

```bash
npx wrangler secret put ACCESS_TEAM_DOMAIN   # for example yourteam.cloudflareaccess.com
npx wrangler secret put ACCESS_AUD           # the long AUD tag
```

If either value is missing, or the Access check fails, `/admin` shows "Forbidden". That is deliberate.

## 9. Deploy

```bash
npm run deploy
```

Open your address. Try signing in with Google and Microsoft, add a car to the garage, then visit `/admin` to see the member listed.

## Trying it on your own computer

```bash
npm run build
npx wrangler dev
```

This serves the whole site, API included, at http://localhost:8787. Create a file called `.dev.vars` in the project folder (it is private and must not be committed) with the same names as the secrets:

```
APP_URL=http://localhost:8787
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SESSION_SECRET=any-long-random-text
```

For local sign-in, also add `http://localhost:8787/api/auth/google/callback` (and the Microsoft equivalent) as extra redirect URIs. `/admin` will show "Forbidden" locally because Cloudflare Access is not present there.

For design work you can use `npm run dev` instead, which is faster but has no Worker behind it.

## Preview mode

When the site cannot reach the Worker (for example with `npm run dev`, or when the built files are hosted on a plain web server), it switches itself to preview mode. The sign-in page then offers "Preview the dashboard without signing in". Preview data lives only in that browser. Once the Worker is deployed, real sign-in is used automatically.

## If something goes wrong

- Sign-in fails with `redirect_uri_mismatch`: the redirect URI in Google or Microsoft does not exactly match `APP_URL` plus `/api/auth/<provider>/callback`. Check for typos and trailing slashes.
- Signed in but immediately signed out: `SESSION_SECRET` is missing. Set it and deploy again.
- `/admin` says Forbidden: check `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD`, and that you are allowed by the Access policy.
- To read live logs: `npx wrangler tail`.
