import {
  compose,
  isLayoutKey,
  LAYOUTS,
  type LayoutKey,
  type LayoutSpec,
} from "../cli/layouts";

/**
 * Miniature pictures of a template's strip, drawn from the same compose()
 * geometry the studio and the exporter use, so the picker shows the actual
 * compositions instead of describing them: copy as text bars, devices as
 * rounded rectangles at their real size, position and tilt. One SVG for the
 * whole strip scales with its container.
 */

/** A store tile in glyph units; the ratio matches a 1290x2796 screenshot. */
const TILE = { width: 46, height: 100 };
const GAP = 4;
const THEME = { copyHeightRatio: 0.24, deviceWidthRatio: 0.84 };

function Tile({ spec, x }: { spec: LayoutSpec; x: number }) {
  const c = compose(spec, TILE, THEME);
  const copyLines: Array<{ x: number; y: number; w: number; h: number }> = [];
  if (c.copy) {
    const lineH = TILE.height * 0.05;
    const gap = TILE.height * 0.025;
    const widths = [0.78, 0.52];
    const blockH = widths.length * lineH + (widths.length - 1) * gap;
    const top = c.copy.position === "top" ? c.copy.y : c.copy.y - blockH;
    widths.forEach((f, i) => {
      const w = c.copy!.maxWidth * f;
      const lx = c.copy!.align === "left" ? c.copy!.x : c.copy!.x - w / 2;
      copyLines.push({ x: lx, y: top + i * (lineH + gap), w, h: lineH });
    });
  }
  const clipId = `glyph-${spec.key}-${x}`;
  return (
    <g transform={`translate(${x} 0)`}>
      <clipPath id={clipId}>
        <rect width={c.width} height={c.height} rx={2} />
      </clipPath>
      <rect width={c.width} height={c.height} rx={2} className="fill-muted" />
      <g clipPath={`url(#${clipId})`}>
        {copyLines.map((l) => (
          <rect
            key={l.y}
            x={l.x}
            y={l.y}
            width={l.w}
            height={l.h}
            rx={l.h / 2}
            className="fill-muted-foreground/60"
          />
        ))}
        {c.devices.map((d) => (
          <rect
            key={`${d.capture}-${d.frame.left}`}
            x={d.frame.left}
            y={d.frame.top}
            width={d.frame.width}
            height={d.frame.height}
            rx={d.screen.radius * 0.9}
            transform={`rotate(${d.rotate} ${d.frame.left + d.frame.width / 2} ${d.frame.top + d.frame.height / 2})`}
            className={d.capture === "primary" ? "fill-foreground/80" : "fill-foreground/40"}
          />
        ))}
      </g>
      {spec.span > 1 ? (
        <line
          x1={TILE.width}
          y1={0}
          x2={TILE.width}
          y2={c.height}
          className="stroke-background"
          strokeWidth={1.5}
        />
      ) : null}
    </g>
  );
}

/** The strip a layout sequence produces, as one SVG that fills its container's width. */
export function TemplateGlyphs({
  sequence,
  className,
}: {
  sequence: string[];
  className?: string;
}) {
  const keys = sequence.filter(isLayoutKey) as LayoutKey[];
  let x = 0;
  const tiles = keys.map((k, i) => {
    const spec = LAYOUTS[k];
    const tile = { spec, x, id: `${k}-${i}` };
    x += TILE.width * spec.span + GAP;
    return tile;
  });
  const width = Math.max(x - GAP, TILE.width);
  return (
    <svg
      viewBox={`0 0 ${width} ${TILE.height}`}
      className={`size-auto w-full max-w-full ${className ?? ""}`}
      style={{ aspectRatio: `${width} / ${TILE.height}` }}
      aria-hidden
    >
      {tiles.map((t) => (
        <Tile key={t.id} spec={t.spec} x={t.x} />
      ))}
    </svg>
  );
}
