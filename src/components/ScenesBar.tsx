import { ImagePlusIcon, PlusIcon, Trash2Icon, UploadIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { slugify, type Creestion, type Scene } from "../store";

/**
 * Manual scene management: scenes are added here and each gets its
 * screenshot via upload (click or drag-drop). A scene with no screenshot
 * yet shows an upload affordance; one with a screenshot shows replace/delete.
 */
export function ScenesBar({ store }: { store: Creestion }) {
  const { orderedScenes, design, addScene, deleteScene, setShot } = store;
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {orderedScenes.map((scene) => (
        <SceneChip
          key={scene.id}
          scene={scene}
          hasShot={Boolean(scene.shots[design.device])}
          onUpload={(file) => setShot(scene.id, design.device, file)}
          onDelete={() => deleteScene(scene.id)}
        />
      ))}
      {adding ? (
        <AddSceneForm
          onCancel={() => setAdding(false)}
          onSubmit={(id, headline) => {
            try {
              addScene(id, headline);
              setAdding(false);
              setError(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            }
          }}
        />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon /> Add scene
        </Button>
      )}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function SceneChip({
  scene,
  hasShot,
  onUpload,
  onDelete,
}: {
  scene: Scene;
  hasShot: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) onUpload(file);
  };

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[12px] ${
        dragging ? "border-primary bg-primary/5" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        accept(e.dataTransfer.files);
      }}
    >
      <span className="max-w-28 truncate font-medium">{scene.id}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          accept(e.target.files);
          e.target.value = "";
        }}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        title={hasShot ? "Replace screenshot" : "Upload screenshot"}
        aria-label={hasShot ? `Replace screenshot for ${scene.id}` : `Upload screenshot for ${scene.id}`}
        onClick={() => inputRef.current?.click()}
      >
        {hasShot ? <UploadIcon /> : <ImagePlusIcon />}
      </Button>
      <Button variant="ghost" size="icon-sm" title="Delete scene" aria-label={`Delete ${scene.id}`} onClick={onDelete}>
        <Trash2Icon />
      </Button>
    </div>
  );
}

function AddSceneForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (id: string, headline: string) => void;
}) {
  const [id, setId] = useState("");
  const [headline, setHeadline] = useState("");
  return (
    <form
      className="flex items-center gap-1.5 rounded-lg border border-dashed px-2 py-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        const sid = slugify(id);
        if (sid) onSubmit(sid, headline || sid);
      }}
    >
      <input
        autoFocus
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="scene-id"
        className="w-24 rounded border border-input bg-background px-1.5 py-1 text-[12px]"
      />
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Headline (optional)"
        className="w-32 rounded border border-input bg-background px-1.5 py-1 text-[12px]"
      />
      <Button type="submit" size="sm" variant="default">
        Add
      </Button>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onCancel} aria-label="Cancel">
        <XIcon />
      </Button>
    </form>
  );
}
