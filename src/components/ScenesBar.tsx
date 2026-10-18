import { ImagePlusIcon, PlusIcon, Trash2Icon, UploadIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { DeviceCaptures, DesignScene } from "../manifest";
import { Button } from "./ui/button";

/**
 * Manual scene management: the studio works without argent captures, so
 * scenes are added here and each gets its screenshot via upload (click or
 * drag-drop). A scene with no capture yet shows an upload affordance; one
 * with a capture shows replace/delete.
 */
export function ScenesBar({
  scenes,
  captures,
  onUpload,
  onAddScene,
  onDeleteScene,
}: {
  scenes: DesignScene[];
  captures: DeviceCaptures | undefined;
  onUpload: (sceneId: string, file: File) => Promise<void>;
  onAddScene: (id: string, headline: string) => Promise<void>;
  onDeleteScene: (sceneId: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {/* Mobile (< sm): one swipeable row of chips. Desktop: wrapped rows. */}
      <div className="mb-4 flex snap-x items-center gap-2 overflow-x-auto pt-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pt-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {scenes.map((scene) => (
          <SceneChip
            key={scene.id}
            scene={scene}
            hasCapture={captures?.screenshots.some((s) => s.sceneId === scene.id) ?? false}
            busy={busy === scene.id}
            disabled={busy !== null}
            onUpload={(file) => run(scene.id, () => onUpload(scene.id, file))}
            onDelete={() => run(`del:${scene.id}`, () => onDeleteScene(scene.id))}
          />
        ))}
        {/* Desktop keeps the add control inline in the row. */}
        <div className="hidden shrink-0 sm:contents">
          {adding ? (
            <AddSceneForm
              onCancel={() => setAdding(false)}
              onSubmit={(id, headline) => run("add", () => onAddScene(id, headline).then(() => setAdding(false)))}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => {
                setError(null);
                setAdding(true);
              }}
            >
              <PlusIcon /> Add scene
            </Button>
          )}
        </div>
        {error ? <p className="shrink-0 text-xs font-medium text-destructive">{error}</p> : null}
      </div>
      {/* Mobile: floating Add scene action pinned to the bottom. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
        <div className="pointer-events-auto">
          {adding ? (
            <AddSceneForm
              onCancel={() => setAdding(false)}
              onSubmit={(id, headline) => run("add", () => onAddScene(id, headline).then(() => setAdding(false)))}
            />
          ) : (
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                setError(null);
                setAdding(true);
              }}
              className="h-11 rounded-full px-5 text-sm shadow-xl"
            >
              <PlusIcon /> Add scene
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function SceneChip({
  scene,
  hasCapture,
  busy,
  disabled,
  onUpload,
  onDelete,
}: {
  scene: DesignScene;
  hasCapture: boolean;
  busy: boolean;
  disabled: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full border py-1 pr-1 pl-3 text-xs transition-colors ${
        dragging
          ? "border-primary bg-primary/10"
          : hasCapture
            ? "border-border bg-background"
            : "border-dashed border-muted-foreground/40 bg-muted/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onUpload(file);
      }}
      title={hasCapture ? `Screenshot uploaded for "${scene.id}"` : `No screenshot yet for "${scene.id}" — drop a PNG here`}
    >
      <span className="max-w-32 truncate font-medium">{scene.id}</span>
      <input
        ref={input}
        type="file"
        accept="image/png"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload(file);
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled || busy}
        aria-label={hasCapture ? `Replace screenshot for ${scene.id}` : `Upload screenshot for ${scene.id}`}
        title={hasCapture ? "Replace screenshot" : "Upload screenshot"}
        onClick={() => input.current?.click()}
      >
        {hasCapture ? <UploadIcon /> : <ImagePlusIcon />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled || busy}
        aria-label={`Delete scene ${scene.id}`}
        title="Delete scene"
        onClick={onDelete}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

function AddSceneForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (id: string, headline: string) => void }) {
  const [id, setId] = useState("");
  const [headline, setHeadline] = useState("");
  return (
    <form
      className="flex items-center gap-1.5 rounded-full border border-border bg-background py-1 pr-1 pl-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (id.trim()) onSubmit(id.trim(), headline.trim());
      }}
    >
      <input
        autoFocus
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="scene-id"
        aria-label="Scene id"
        className="w-24 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
      />
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Headline (optional)"
        aria-label="Headline"
        className="w-32 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" variant="ghost" size="icon-xs" aria-label="Add scene" disabled={!id.trim()}>
        <PlusIcon />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" aria-label="Cancel" onClick={onCancel}>
        <XIcon />
      </Button>
    </form>
  );
}
