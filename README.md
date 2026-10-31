# The Nonty Experience (monorepo)

| Path | What it is | Where it runs |
|---|---|---|
| `apps/web` | The public site (static `index.html`, `assets/`, `CNAME`) | **GitHub Pages** (unchanged) |
| `apps/api` | Hono API as Vercel functions, `/api/public/*` (site) and `/api/admin/*` (CRM) | **Vercel** |
| `apps/admin` | Admin CRM (Vite + React). Built into `apps/api/dist`, so it is served by the same Vercel project | **Vercel** |
| `packages/db` | Drizzle schema, Neon client, migrations, seed | – |
| `packages/shared` | Zod schemas, constants, password hashing | – |

Data lives in **Neon Postgres**; gallery photos live in **Cloudflare R2** (the browser uploads directly via presigned URLs).

```
visitor ──> GitHub Pages (apps/web) ──fetch──> Vercel /api/public/*  ──> Neon
owner   ──> Vercel (admin SPA) ───────────────> Vercel /api/admin/*   ──> Neon + R2
```

## 1. Convert the existing repo

```bash
git checkout -b monorepo
bash scripts/migrate-to-monorepo.sh   # after copying just that file in
```
The script `git mv`s `index.html`, `assets/`, `CNAME` into `apps/web/` (history preserved) and moves the old README to `docs/design-spec.md`. **Then** copy the rest of this scaffold into the repo root.

**GitHub Pages must be switched once:** Settings → Pages → *Build and deployment* → Source: **GitHub Actions**. The included `.github/workflows/pages.yml` publishes `apps/web` (the `CNAME` inside it keeps your custom domain). Only changes under `apps/web/**` trigger a redeploy.

## 2. Services to create

**Neon**: create a project. Copy the *pooled* string into `DATABASE_URL` and the *direct* string into `DATABASE_URL_UNPOOLED`. Pick the region closest to your users, then set the same region in `apps/api/vercel.json` → `regions` (currently `fra1`).

**Cloudflare R2**: create a bucket → enable public access (custom domain recommended, e.g. `media.yourdomain`) → *Manage R2 API tokens* → token with **Object Read & Write** limited to that bucket. Add this CORS policy to the bucket so the admin can upload from the browser:
```json
[{ "AllowedOrigins": ["https://YOUR-ADMIN-DOMAIN", "http://localhost:5173"],
   "AllowedMethods": ["PUT", "GET", "HEAD"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
```

## 3. Local development

```bash
cp .env.example .env        # fill it in
pnpm install
pnpm db:generate && pnpm db:migrate
pnpm db:seed                # creates your owner login + the brochure services
pnpm dev                    # API :8787, admin :5173 (proxies /api)
pnpm web                    # public site on :3000 (set NONTY_API_URL to http://localhost:8787/api)
```

## 4. Deploy the API + admin on Vercel

1. New Project → import this repo → **Root Directory: `apps/api`** → leave *Include source files outside of the Root Directory* **on**. Framework preset: *Other* (build/output come from `apps/api/vercel.json`).
2. Add every variable from `.env.example` (except the `SEED_*` ones) in Project → Settings → Environment Variables.
3. `ALLOWED_ORIGINS` must list the public site's exact origin(s), e.g. `https://yourdomain.co.za`.
4. Open `https://<project>.vercel.app/` → sign in with the seeded login.

## 5. Connect the public site

The public site is already wired to the API. The only thing to set is the API base URL near the end of `apps/web/index.html`:
```html
<script>window.NONTY_API_URL = "https://<project>.vercel.app/api";</script>
```
Until you replace the `YOUR-PROJECT` placeholder the page keeps running standalone and enquiries go out over WhatsApp as before. Once set, the page:
- renders services and prices from `GET /public/services` (everything you manage under **Services**),
- renders the portfolio from `GET /public/gallery` (photos you tick **Show on website** in **Gallery**),
- posts the contact form (with honeypot + validation) to `POST /public/enquiries`, falling back to the pre-filled WhatsApp message if the API is unreachable.

Add the site's origin to the API's `ALLOWED_ORIGINS` or the browser will block these requests (CORS).

## Security notes
- Admin session = signed, `HttpOnly`, `SameSite=Lax` cookie; admin and API share one origin; every state-changing request is origin-checked. 5 wrong passwords lock the account for 15 minutes.
- Public enquiries: strict validation, honeypot field, max 5 per hour per hashed IP, optional Cloudflare Turnstile (`TURNSTILE_SECRET` + send `turnstileToken`).
- Uploaded photos are **hidden until you tick “Show on website”**. R2 credentials never reach the browser.
- You now store visitors' personal information (names, phones). Under POPIA the site needs a short privacy notice near the form.
- Rotate `JWT_SECRET` to sign everyone out. Add more staff by inserting rows into `users` (no UI for this yet).
