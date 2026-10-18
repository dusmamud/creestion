/** Background presets (ported from the studio's DesignPanel) and a CSS
 * gradient parser that turns them into Konva fills. */

export const GRADIENTS: Array<{ name: string; css: string }> = [
  { name: "Arctic", css: "linear-gradient(160deg, #E8F1FF 0%, #F7FAFF 55%, #FFFFFF 100%)" },
  { name: "Peach", css: "linear-gradient(160deg, #FFE8D6 0%, #FFF7F0 55%, #FFFFFF 100%)" },
  { name: "Mint", css: "linear-gradient(160deg, #D9F9EF 0%, #F2FDF9 55%, #FFFFFF 100%)" },
  { name: "Lavender", css: "linear-gradient(160deg, #E9E4FF 0%, #F7F5FF 55%, #FFFFFF 100%)" },
  { name: "Sand", css: "linear-gradient(160deg, #F7ECDD 0%, #FCF7F0 55%, #FFFFFF 100%)" },
  { name: "Blush", css: "linear-gradient(160deg, #FFE0E9 0%, #FFF5F8 55%, #FFFFFF 100%)" },
  { name: "Lemon", css: "linear-gradient(160deg, #FFF3C4 0%, #FFFBEB 55%, #FFFFFF 100%)" },
  { name: "Silver", css: "linear-gradient(160deg, #E2E8F0 0%, #F1F5F9 55%, #FFFFFF 100%)" },
  { name: "Ocean", css: "linear-gradient(160deg, #0EA5E9 0%, #2563EB 100%)" },
  { name: "Ember", css: "linear-gradient(160deg, #F97316 0%, #DC2626 100%)" },
  { name: "Forest", css: "linear-gradient(160deg, #059669 0%, #065F46 100%)" },
  { name: "Midnight", css: "linear-gradient(160deg, #1E293B 0%, #0F172A 100%)" },
  { name: "Grape", css: "linear-gradient(160deg, #8B5CF6 0%, #4C1D95 100%)" },
  { name: "Berry", css: "linear-gradient(160deg, #EC4899 0%, #831843 100%)" },
  { name: "Aurora", css: "linear-gradient(160deg, #0D9488 0%, #1E3A8A 100%)" },
  { name: "Graphite", css: "linear-gradient(160deg, #3F3F46 0%, #18181B 100%)" },
  { name: "Sky", css: "linear-gradient(160deg, #BAE6FD 0%, #E0F2FE 55%, #FFFFFF 100%)" },
  { name: "Rose", css: "linear-gradient(160deg, #FDA4AF 0%, #FFE4E6 60%, #FFFFFF 100%)" },
  { name: "Sunset", css: "linear-gradient(160deg, #F59E0B 0%, #EF4444 55%, #7C3AED 100%)" },
  { name: "Coral", css: "linear-gradient(160deg, #FB7185 0%, #F97316 100%)" },
  { name: "Teal", css: "linear-gradient(160deg, #2DD4BF 0%, #0F766E 100%)" },
  { name: "Cobalt", css: "linear-gradient(160deg, #3B82F6 0%, #1E1B4B 100%)" },
];

export const SOLIDS: Array<{ name: string; css: string }> = [
  { name: "White", css: "#FFFFFF" },
  { name: "Black", css: "#000000" },
  { name: "Slate", css: "#F1F5F9" },
  { name: "Zinc", css: "#F4F4F5" },
  { name: "Sky", css: "#E0F2FE" },
  { name: "Mint", css: "#D1FAE5" },
  { name: "Lemon", css: "#FEF3C7" },
  { name: "Peach", css: "#FFEDD5" },
  { name: "Rose", css: "#FFE4E6" },
  { name: "Lavender", css: "#EDE9FE" },
  { name: "Navy", css: "#1E293B" },
  { name: "Charcoal", css: "#18181B" },
];

export type BackgroundFill =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; angle: number; stops: Array<{ offset: number; color: string }> }
  | { kind: "transparent" };

/** Parse a CSS background (linear-gradient with hex stops, a hex solid, or transparent). */
export function parseBackground(css: string): BackgroundFill {
  const t = css.trim().toLowerCase();
  if (t === "transparent") return { kind: "transparent" };
  const g = t.match(/^linear-gradient\(\s*([\d.]+)deg\s*,\s*(.+)\)$/);
  if (g) {
    const stops: Array<{ offset: number; color: string }> = [];
    for (const part of g[2]!.split(",")) {
      const m = part.trim().match(/^(#[0-9a-f]{6}|#[0-9a-f]{3})\s+([\d.]+)%$/);
      if (m) stops.push({ color: m[1]!, offset: Number(m[2]) / 100 });
    }
    if (stops.length >= 2) return { kind: "gradient", angle: Number(g[1]), stops };
  }
  const solid = t.match(/^(#[0-9a-f]{6}|#[0-9a-f]{3})$/);
  if (solid) return { kind: "solid", color: solid[1]! };
  return { kind: "solid", color: "#FFFFFF" };
}

/** Konva fill props for a rect of the given size. */
export function konvaFill(
  fill: BackgroundFill,
  w: number,
  h: number,
): Record<string, unknown> {
  if (fill.kind === "solid") return { fill: fill.color };
  if (fill.kind === "transparent") return { fill: "rgba(0,0,0,0)" };
  // CSS angle: 0deg points up, clockwise. Konva wants absolute endpoints.
  const rad = (fill.angle * Math.PI) / 180;
  const dx = Math.sin(rad) / 2;
  const dy = -Math.cos(rad) / 2;
  const stops: Array<number | string> = [];
  for (const s of fill.stops) stops.push(s.offset, s.color);
  return {
    fillLinearGradientStartPoint: { x: (0.5 - dx) * w, y: (0.5 - dy) * h },
    fillLinearGradientEndPoint: { x: (0.5 + dx) * w, y: (0.5 + dy) * h },
    fillLinearGradientColorStops: stops,
  };
}

/** Whether a background reads dark (for picking copy colors). */
export function isDarkBackground(css: string): boolean | null {
  const hexes = css.match(/#[0-9a-fA-F]{6}/g);
  if (!hexes || hexes.length === 0) return null;
  const lum = (hex: string) => {
    const c = (o: number) => {
      const v = Number.parseInt(hex.slice(o, o + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * c(1) + 0.7152 * c(3) + 0.0722 * c(5);
  };
  const mean = hexes.reduce((s, hx) => s + lum(hx), 0) / hexes.length;
  return mean < 0.5;
}
