# Creestion Studio

A client-side App Store screenshot editor. Upload your app screenshots,
arrange them on beautiful templates, edit the copy, and export
pixel-perfect store assets — everything runs in the browser, your images
never leave your device.

## Features

- **Manual scenes** — add scenes, upload one screenshot per device (click or drag-drop)
- **Editor canvas** — drag the phone and the text anywhere; double-click the headline or subhead to edit it inline
- **Templates & layouts** — magazine-style templates, per-scene layout overrides, two-screen layouts
- **Design controls** — 34 backgrounds, 5 bundled fonts, iPhone / iPad / Android bezels, screen-only mode
- **Exact export** — renders offscreen at the store's required resolution (e.g. 1320×2868) and downloads PNGs, or a zip for multiple scenes
- **No backend** — design + scenes persist in `localStorage`; the build is fully static

## Tech stack

React 19 + Vite + Tailwind CSS + shadcn/ui, Konva (`react-konva`) for the
editor canvas, JSZip for multi-scene export. The composition engine
(`src/engine/`: layouts, frame geometry, device specs) is pure TypeScript
with no DOM dependencies.

## Run it

```sh
bun install
bun run dev      # http://localhost:4321
bun run build    # static output in dist/
```

`dist/` can be hosted on any static host (Cloudflare Pages, Netlify, Vercel…).

## Project layout

```
public/
  fonts/      # bundled typefaces (OFL 1.1 — see public/fonts/OFL.txt)
  frames/     # device bezel art (CC BY 4.0 — see public/frames/ATTRIBUTION.md)
src/
  engine/     # pure composition engine (layouts, frames, device specs)
  lib/        # backgrounds, export, font loading, utils
  components/ # SceneCanvas (Konva editor), ScenesBar, Sidebar, ui/
  store.ts    # app state + localStorage persistence
```

## License

MIT — see [LICENSE](LICENSE). The composition engine and studio UI are
derived from [goldie](https://github.com/software-mansion-labs/goldie)
(MIT © 2026 Kacper Kapuściak); Creestion modifications © 2026 Dus Mamud.
Bundled bezel images are CC BY 4.0 and fonts are OFL 1.1 (see LICENSE for
details).
