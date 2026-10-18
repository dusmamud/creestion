/**
 * Client-side export: renders each scene's ScreenshotScene (the exact
 * component the strip shows) offscreen at the device's full screenshot
 * resolution, rasterizes it with html-to-image, and zips the PNGs.
 *
 * The props are computed exactly the way Strip.tsx does, so the export is
 * what-you-see-is-what-you-get.
 */
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { FRAMES } from "../cli/frame";
import { isTemplateKey, resolveScenes, type LayoutKey } from "../cli/layouts";
import type {
  Design,
  DesignScene,
  DeviceCaptures,
  DeviceEntry,
  SceneCopy,
} from "../manifest";
import { ScreenshotScene } from "../components/Strip";

export type ExportDesign = {
  background: string;
  fontFamily: string;
  copy: Record<string, SceneCopy>;
  order: string[];
  template: string | string[];
  layout: string;
  screenOnly: boolean;
  sceneLayouts: Record<string, string>;
  positions: Record<string, { copy?: { x: number; y: number }; devices?: Array<{ x: number; y: number }> }>;
};

/** Mirror of the CLI's backgroundLuminance (see Strip.tsx). */
function backgroundLuminance(css: string): number | null {
  const hexes = css.match(/#[0-9a-fA-F]{6}/g);
  if (!hexes || hexes.length === 0) return null;
  const luminance = (hex: string) => {
    const channel = (offset: number) => {
      const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  };
  return hexes.reduce((sum, hex) => sum + luminance(hex), 0) / hexes.length;
}

function rankOf(order: string[], id: string): number {
  const i = order.indexOf(id);
  return i === -1 ? order.length : i;
}

/** Render one React tree offscreen and rasterize it to a PNG data URL. */
async function rasterize(
  node: React.ReactNode,
  width: number,
  height: number,
): Promise<string> {
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;overflow:hidden;z-index:-10000;pointer-events:none;`;
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    root.render(node as React.ReactElement);
    // Let React commit, images decode and webfonts arrive.
    await new Promise((r) => setTimeout(r, 50));
    await Promise.all(
      [...host.querySelectorAll("img")].map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => {
          img.onload = () => res(null);
          img.onerror = () => res(null);
        }),
      ),
    );
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 100));
    return await toPng(host, { width, height, pixelRatio: 1 });
  } finally {
    root.unmount();
    host.remove();
  }
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.split(",")[1]!);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function exportScenes(
  manifest: { design: Design },
  captures: DeviceCaptures,
  spec: DeviceEntry,
  locale: string,
  frameUrl: string | null,
  design: ExportDesign,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const { design: d } = manifest;
  const theme = d.theme;
  const frameGeometry = FRAMES[spec.key as keyof typeof FRAMES] ?? FRAMES["iphone-6.9"];

  const scenes =
    design.order.length > 0
      ? [...d.scenes].sort((a, b) => rankOf(design.order, a.id) - rankOf(design.order, b.id))
      : d.scenes;
  const resolved = resolveScenes(scenes, {
    template: Array.isArray(design.template)
      ? (design.template as LayoutKey[])
      : isTemplateKey(design.template)
        ? design.template
        : undefined,
    layout: design.layout,
    sceneLayouts: design.sceneLayouts,
  });
  const layoutOf = (scene: DesignScene) => resolved.find((r) => r.scene.id === scene.id)!;

  const bgLum = backgroundLuminance(design.background);
  const dark = bgLum !== null && bgLum < 0.5;
  const light = bgLum !== null && bgLum >= 0.5;
  const lightColor = (c: string) => (backgroundLuminance(c) ?? 0) > 0.5;
  const headlineColor = dark
    ? "#FFFFFF"
    : light && lightColor(theme.headlineColor)
      ? "#0E1B2A"
      : theme.headlineColor;
  const subheadColor = dark
    ? "#D9E1EA"
    : light && lightColor(theme.subheadColor)
      ? "#5A6A7D"
      : theme.subheadColor;

  const deviceFrameUrl = spec.frame?.url ?? frameUrl;
  const geom = spec.frame?.geom;

  const shots = scenes.flatMap((scene) => {
    const capture = captures.screenshots.find((s) => s.sceneId === scene.id);
    return capture ? [{ scene, capture }] : [];
  });

  const zip = new JSZip();
  let done = 0;
  for (const { scene, capture } of shots) {
    const { layout: layoutSpec, secondScene } = layoutOf(scene);
    const second = secondScene
      ? captures.screenshots.find((s) => s.sceneId === secondScene)
      : undefined;
    for (let slice = 0; slice < layoutSpec.span; slice++) {
      const width = spec.screenshot.width * layoutSpec.span;
      const height = spec.screenshot.height;
      const png = await rasterize(
        <ScreenshotScene
          spec={layoutSpec}
          slice={slice}
          tile={spec.screenshot}
          frame={frameGeometry}
          theme={theme}
          screenOnly={design.screenOnly}
          background={design.background}
          frameUrl={deviceFrameUrl}
          geom={geom}
          copyScale={spec.copyScale}
          fontFamily={design.fontFamily}
          headline={design.copy[scene.id]?.headline?.[locale] ?? scene.headline[locale] ?? ""}
          subhead={design.copy[scene.id]?.subhead?.[locale] ?? scene.subhead?.[locale]}
          headlineColor={headlineColor}
          subheadColor={subheadColor}
          captureUrl={capture.url}
          secondCaptureUrl={second?.url}
          secondSceneId={secondScene}
          decorations={[...d.decorations, ...(scene.decorations ?? [])]}
          locale={locale}
          offsets={design.positions[scene.id]}
        />,
        width,
        height,
      );
      const name = layoutSpec.span > 1 ? `${scene.id}-${slice + 1}.png` : `${scene.id}.png`;
      zip.file(`${spec.key}/${name}`, dataUrlToBytes(png));
      done += 1;
      onProgress?.(done, shots.length);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `creestion-${spec.key}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
}
