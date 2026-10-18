import { createElement } from "react";
import { createRoot } from "react-dom/client";
import JSZip from "jszip";
import type Konva from "konva";
import { DEVICES, type DeviceKey } from "../engine/specs";
import { SceneCanvas } from "../components/SceneCanvas";
import type { Design, Scene } from "../store";
import { ensureFonts } from "./fonts";

export type SceneView = {
  scene: Scene;
  layoutKey: string;
  secondShot?: string;
};

/** Render one scene offscreen at the device's full screenshot resolution. */
export async function renderScenePNG(
  view: SceneView,
  deviceKey: DeviceKey,
  design: Design,
): Promise<Blob> {
  await ensureFonts();
  const spec = DEVICES[deviceKey];
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-99999px;top:0;pointer-events:none;";
  document.body.appendChild(container);

  try {
    const stage = await new Promise<Konva.Stage>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Render timed out")), 30000);
      const root = createRoot(container);
      const done = (s: Konva.Stage) => {
        clearTimeout(timer);
        // Let Konva flush the layer draw before capturing.
        requestAnimationFrame(() => resolve(s));
      };
      root.render(
        createElement(SceneCanvas, {
          scene: view.scene,
          secondShot: view.secondShot,
          layoutKey: view.layoutKey,
          deviceKey,
          design: { ...design, device: deviceKey },
          displayWidth: spec.screenshot.width,
          interactive: false,
          onReady: (s) => {
            done(s);
            setTimeout(() => root.unmount(), 1000);
          },
        }),
      );
    });
    const url = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
    const res = await fetch(url);
    return await res.blob();
  } finally {
    container.remove();
  }
}

function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 4000);
}

/** Export scenes for the current device: one PNG each, or a zip when many. */
export async function exportScenes(
  views: SceneView[],
  deviceKey: DeviceKey,
  design: Design,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const withShots = views.filter((v) => v.scene.shots[deviceKey]);
  if (withShots.length === 0) throw new Error("Upload a screenshot first");
  if (withShots.length === 1) {
    const blob = await renderScenePNG(withShots[0]!, deviceKey, design);
    onProgress?.(1, 1);
    download(blob, `creestion-${deviceKey}-${withShots[0]!.scene.id}.png`);
    return;
  }
  const zip = new JSZip();
  let i = 0;
  for (const view of withShots) {
    const blob = await renderScenePNG(view, deviceKey, design);
    zip.file(`${deviceKey}/${view.scene.id}.png`, blob);
    i += 1;
    onProgress?.(i, withShots.length);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  download(zipBlob, `creestion-${deviceKey}.zip`);
}
