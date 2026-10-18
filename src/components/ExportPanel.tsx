import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Client-side export: re-renders the screenshots from the current design
 * with the exact strip components, zips the PNGs, and downloads the zip.
 * Streams progress while it runs. (The original studio POSTed to /api/export
 * and let the creestion CLI render; here everything happens in the browser.)
 */
export function ExportPanel({
  runExport,
}: {
  /** Render every scene at full resolution, zip and download. Throws on failure. */
  runExport: (onProgress: (done: number, total: number) => void) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the log text changes
  useEffect(() => {
    logRef.current?.scrollTo(0, logRef.current.scrollHeight);
  }, [log]);

  async function exportZip() {
    if (busy) return;
    setBusy(true);
    setLog("Starting…");
    try {
      await runExport((done, total) => setLog(`Rendering ${done} / ${total}…`));
      setLog(null);
    } catch (err) {
      setLog(`Export failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {log !== null && !busy ? (
        <p className="text-[12px] text-destructive">Export failed.</p>
      ) : null}

      {log !== null ? (
        <pre
          ref={logRef}
          className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-2 font-mono text-[10px] leading-relaxed text-muted-foreground"
        >
          {log || "Starting…"}
        </pre>
      ) : null}

      <Button size="lg" className="w-full" onClick={() => void exportZip()} disabled={busy}>
        {busy ? (
          <>
            <Loader2Icon className="animate-spin" />
            Exporting…
          </>
        ) : (
          <>
            <DownloadIcon />
            Export screenshots
          </>
        )}
      </Button>
    </div>
  );
}
