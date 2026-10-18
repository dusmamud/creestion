# Creestion Web

Creestion Studio in the browser — a client-side App Store screenshot editor.
The UI is the original studio, component for component; only the data layer
is client-side (no Node server, no CLI).

## What it is

- **Same studio UI**: sidebar (device tabs, backgrounds, fonts, templates,
  layouts, bezels), scene chips, tile strip, lightbox — ported verbatim from
  the studio source.
- **Two additions**: per-scene screenshot upload (click or drag-drop on the
  scene chips) and in-place headline/subhead editing (click the copy in the
  lightbox, Enter commits, Escape reverts).
- **Demo content**: 5 AI-generated app mockups with sample copy, so the app
  opens with a full strip like the studio's samples.
- **Client-side export**: renders the exact strip components offscreen at the
  device's full screenshot resolution and downloads a zip of PNGs
  (1320×2868 for iPhone 6.9).
- **Persistence**: design choices, scenes and copy in localStorage; uploaded
  screenshots stay for the session (object URLs).

## Run

```bash
bun install
bun run dev      # http://localhost:4321
bun run build    # static dist/ -> any static host (Cloudflare Pages)
```

## How it works

- `src/components/*` — the studio UI, unchanged.
- `src/cli/*` — the pure engine modules (layouts, frame geometry, specs).
- `src/manifest.ts` — builds the StoreManifest in-browser from the engine
  modules + demo scenes + your localStorage overlay; uploads become
  object URLs.
- `src/lib/export.tsx` — offscreen full-res render via the real
  `ScreenshotScene`, rasterized with html-to-image, zipped with jszip.

## License

MIT — see LICENSE. Bezel art is CC BY 4.0, fonts are OFL 1.1 (see
`public/frames/ATTRIBUTION.md` and `public/fonts/OFL.txt`).
