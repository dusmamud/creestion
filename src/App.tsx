import { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { SceneCanvas, layoutKeyFor } from "./components/SceneCanvas";
import { ScenesBar } from "./components/ScenesBar";
import { Sidebar } from "./components/Sidebar";
import { Button } from "./components/ui/button";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { DEVICES } from "./engine/specs";
import { LAYOUT_KEYS } from "./engine/layouts";
import { ensureFonts } from "./lib/fonts";
import { exportScenes } from "./lib/export";
import { useCreestion, type DeviceKey, type Scene } from "./store";

type SceneView = {
  scene: Scene;
  layoutKey: string;
  secondShot?: string;
};

export function App() {
  const store = useCreestion();
  const { orderedScenes, design } = store;
  const [dark, setDark] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const spec = DEVICES[design.device as DeviceKey];

  /** Per-scene view: layout key from the template sequence + the next
   * scene's shot for two-screen layouts. */
  const sceneViews = orderedScenes.map((scene, i) => ({
    scene,
    layoutKey: layoutKeyFor(i, scene, design),
    secondShot:
      orderedScenes.length > 1
        ? orderedScenes[(i + 1) % orderedScenes.length]!.shots[design.device]
        : undefined,
  }));

  const doExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportScenes(sceneViews, design.device, design);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : String(e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen gap-4 bg-muted/40 p-4">
      <Sidebar store={store} dark={dark} onDark={() => setDark(!dark)} onExport={doExport} exporting={exporting} />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-auto rounded-2xl border bg-background p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {spec.label} · {spec.screenshot.width}×{spec.screenshot.height}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={() => setDark(!dark)} aria-label="Toggle appearance">
            {dark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>

        <ScenesBar store={store} />

        {sceneViews.length === 0 ? (
          <div className="grid flex-1 place-items-center text-center">
            <div className="max-w-sm">
              <h3 className="text-sm font-semibold">No scenes yet</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Add a scene above, or restore the bundled demo scenes to explore the editor.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={store.loadDemo}>
                <RotateCcwIcon /> Load demo scenes
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-5">
            {sceneViews.map(({ scene, layoutKey, secondShot }, i) => (
              <div key={scene.id} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setOpenIdx(i)}
                  className="overflow-hidden rounded-xl ring-1 ring-black/10 transition hover:ring-2 hover:ring-primary/60 dark:ring-white/10"
                  aria-label={`Open ${scene.id} full-size`}
                >
                  <SceneCanvas
                    scene={scene}
                    secondShot={secondShot}
                    layoutKey={layoutKey}
                    deviceKey={design.device}
                    design={design}
                    displayWidth={240}
                  />
                </button>
                <p className="max-w-60 truncate text-center text-[11px] text-muted-foreground">
                  {scene.headline || scene.id}
                </p>
              </div>
            ))}
          </div>
        )}

        {exportError ? <p className="mt-3 text-xs font-medium text-destructive">{exportError}</p> : null}
      </main>

      {openIdx !== null && sceneViews[openIdx] && (
        <Lightbox
          views={sceneViews}
          index={openIdx}
          onIndex={setOpenIdx}
          onClose={() => setOpenIdx(null)}
          store={store}
          exporting={exporting}
          onExport={doExport}
        />
      )}
    </div>
  );
}

/** Fit a width for the given aspect into the viewport next to the panel. */
function useFitWidth(aspect: number): number {
  const compute = () =>
    Math.max(
      200,
      Math.min(
        window.innerWidth - 64 - 288, // dialog padding + side panel + gap
        (window.innerHeight - 160) * aspect, // dialog padding + captions
      ),
    );
  const [w, setW] = useState(compute);
  useEffect(() => {
    const onResize = () => setW(compute());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);
  return w;
}

function Lightbox({
  views,
  index,
  onIndex,
  onClose,
  store,
  exporting,
  onExport,
}: {
  views: SceneView[];
  index: number;
  onIndex: (i: number | null) => void;
  onClose: () => void;
  store: ReturnType<typeof useCreestion>;
  exporting: boolean;
  onExport: () => void;
}) {
  const view = views[index]!;
  const { scene } = view;
  const { design } = store;
  const spec = DEVICES[design.device as DeviceKey];
  const aspect = spec.screenshot.width / spec.screenshot.height;
  const width = useFitWidth(aspect);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.isContentEditable || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT")) return;
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onIndex(index > 0 ? index - 1 : null);
      else if (e.key === "ArrowRight") onIndex(index < views.length - 1 ? index + 1 : null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, views.length, onClose, onIndex]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot editor"
      className="fixed inset-0 z-50 flex items-center justify-center gap-6 bg-black/80 p-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
        style={{ width, aspectRatio: `${spec.screenshot.width} / ${spec.screenshot.height}` }}
      >
        <SceneCanvas
          scene={scene}
          secondShot={view.secondShot}
          layoutKey={view.layoutKey}
          deviceKey={design.device}
          design={design}
          displayWidth={width}
          interactive
          onPositions={store.setPositions}
          onCopy={store.setCopy}
        />
      </div>

      <div className="flex max-h-full w-64 shrink-0 flex-col gap-3 overflow-y-auto rounded-2xl bg-background p-4 text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-semibold">{scene.id}</h3>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {index + 1} / {views.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Double-click the headline or subhead on the canvas to edit it inline.
          Drag the text or the phone to move them.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) store.setShot(scene.id, design.device, f);
            e.target.value = "";
          }}
        />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <UploadIcon /> {scene.shots[design.device] ? "Replace screenshot" : "Upload screenshot"}
        </Button>

        <label className="flex flex-col gap-1 text-xs font-medium">
          Headline
          <input
            value={scene.headline}
            onChange={(e) => store.setCopy(scene.id, "headline", e.target.value)}
            placeholder="Headline"
            className="rounded-md border border-input bg-background px-2 py-1.5 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Subhead
          <input
            value={scene.subhead}
            onChange={(e) => store.setCopy(scene.id, "subhead", e.target.value)}
            placeholder="Subhead"
            className="rounded-md border border-input bg-background px-2 py-1.5 font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium">
          Layout
          <SelectRoot
            value={scene.layout ?? ""}
            onValueChange={(v) => store.setSceneLayout(scene.id, v || undefined)}
          >
            <SelectTrigger className="w-full font-normal">
              <SelectValue placeholder={`Default (${view.layoutKey})`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default ({view.layoutKey})</SelectItem>
              {LAYOUT_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </label>

        <Button variant="outline" size="sm" onClick={() => store.setPositions(scene.id, null)}>
          <RotateCcwIcon /> Reset positions
        </Button>
        <Button size="sm" onClick={onExport} disabled={exporting}>
          <DownloadIcon /> {exporting ? "Exporting…" : "Export PNG"}
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label="Close"
        className="absolute top-4 right-4 rounded-full"
        onClick={onClose}
      >
        <XIcon />
      </Button>
      {views.length > 1 && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Previous scene"
            disabled={index === 0}
            className="absolute left-4 rounded-full"
            onClick={() => onIndex(index - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Next scene"
            disabled={index === views.length - 1}
            className="absolute right-4 rounded-full"
            onClick={() => onIndex(index + 1)}
          >
            <ChevronRightIcon />
          </Button>
        </>
      )}
    </div>
  );
}
