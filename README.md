# Nyimbo Za Kristo

Dual-language SDA hymnal (Swahili NZK + English GCCSATX) with lyrics-first reading, YouTube accompaniment, and PWA offline support.

## Local development

```bash
npm ci
npm run dev
```

## Tests & build

```bash
npm test
npm run build
npm run preview   # serve dist/ locally
```

## Deploy to Render (web)

The web app is a **Vite static PWA** published from `dist/`. Configuration lives in [`render.yaml`](render.yaml).

### First-time setup

1. Push this repo to GitHub (`GeorgeAkai/NyimboZaKristo`).
2. Open the Blueprint link (replace repo if needed):

   [Create Blueprint on Render](https://dashboard.render.com/blueprint/new?repo=https://github.com/GeorgeAkai/NyimboZaKristo)

3. Review the static site service `nyimbozakristo` and click **Apply**.
4. After deploy, open the `*.onrender.com` URL and smoke-test:
   - Home → both hymnals → hymn detail (lyrics, video, choir selector)
   - Settings (fonts, theme)
   - Install prompt / offline lyrics (PWA)

### Manual static site (without Blueprint)

| Setting | Value |
|---------|--------|
| **Build command** | `npm ci && npm run build` |
| **Publish directory** | `dist` |
| **Node version** | `20.19.0` (see `.node-version`) |

Add a **rewrite** rule: `/*` → `/index.html` (SPA / PWA).

### Optional: offline English instrumentals

Before deploy, run locally (requires network):

```bash
npm run build:offline-instrumentals
# download MP3s into public/instrumentals/ per manifest
npm run build
```

Commit `public/offline-manifest.json` and bundled MP3s if you want offline instrumentals on web.

## Android (Play Store)

```bash
npm run android:sync
npm run android:play
```
