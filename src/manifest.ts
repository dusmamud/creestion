/**
 * Client-side manifest for Creestion Web.
 *
 * The original studio loads its StoreManifest from out/store.json and talks
 * to the creestion CLI over /api/* for uploads, scene edits and the design
 * file. Here the same manifest is built in the browser from the bundled
 * engine modules (src/cli/*), and every mutation lands in localStorage (or
 * in-memory object URLs for uploaded screenshots) instead of on disk.
 *
 * The types below mirror the StoreManifest the CLI writes; the UI components
 * above this file are unchanged from the studio.
 */
import type { LayerOffsets } from "./cli/layouts";
import { ANDROID_FRAME } from "./cli/frame";
import { LAYOUTS, TEMPLATES } from "./cli/layouts";
import { DEVICES, type DeviceKey } from "./cli/specs";

export type Theme = {
  background: string;
  headlineColor: string;
  subheadColor: string;
  fontFamily: string;
  /** Fraction of the frame height reserved for copy above the device. */
  copyHeightRatio: number;
  /** Fraction of the frame width the device bezel occupies. */
  deviceWidthRatio: number;
};

/** Mirrors Decoration in src/config.ts; image `src` values are urls under public/. */
export type Decoration =
  | {
      kind: "badge";
      text: Record<string, string>;
      position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      background?: string;
      color?: string;
    }
  | { kind: "image"; src: string; x: number; y: number; width: number; rotate?: number };

export type LayoutEntry = { key: string; label: string; description: string; span: number };
export type TemplateEntry = { key: string; label: string; description: string; sequence: string[] };

/** Mirrors FrameGeometry in src/frame.ts: a bezel image's box and the screen cutout inside it. */
export type FrameGeometry = {
  width: number;
  height: number;
  screen: { x: number; y: number; width: number; height: number };
  screenRadius: number;
};

/** Mirrors DeviceType in src/specs.ts: the sidebar's device-type tabs. */
export type DeviceType = "iphone" | "ipad" | "android";

export type DeviceEntry = {
  key: string;
  label: string;
  platform: "ios" | "android";
  type: DeviceType;
  /** Copy size relative to the reference column's type; see DeviceSpec in src/specs.ts. */
  copyScale: number;
  simulatorName: string | null;
  screenshot: { width: number; height: number };
  preview: { width: number; height: number } | null;
  /** Bezel art fixed to this device (android), null when the frame picker applies. */
  frame: { url: string; geom: FrameGeometry } | null;
};

export type DesignScene = {
  id: string;
  headline: Record<string, string>;
  subhead?: Record<string, string>;
  layout?: string;
  secondScene?: string;
  decorations?: Decoration[];
};

export type BundledFont = {
  key: string;
  family: string;
  fallback: string;
  faces: Array<{ weight: number; url: string }>;
};

export type DeviceCaptures = {
  screenshots: Array<{ sceneId: string; url: string }>;
  clips: Array<{ segmentId: string; url: string; durationSeconds: number }> | null;
  /** Each locale's own captures when the config sets localizedCaptures. */
  byLocale?: Record<string, Omit<DeviceCaptures, "byLocale">>;
};

export type Design = {
  theme: Theme;
  /** The bundled variant each device renders with; null when the config points at custom bezel art. */
  frames: Record<string, string | null>;
  /** Every bundled variant and the device it is drawn for. */
  frameVariants: Array<{ key: string; device: string }>;
  customFrameUrl: string | null;
  /** Bundled typefaces with the @font-face sources to declare. */
  fonts: BundledFont[];
  layouts: LayoutEntry[];
  templates: TemplateEntry[];
  /** The theme's template: a built-in key, null for none, or the config's custom sequence. */
  template: string | string[] | null;
  /** The theme's default layout key. */
  layout: string;
  screenOnly: boolean;
  decorations: Decoration[];
  scenes: DesignScene[];
  preview: {
    sceneId: string;
    segments: Array<{ id: string }>;
  } | null;
  /** Raw capture urls per device key; a device is absent until a screenshot is uploaded. */
  captures: Record<string, DeviceCaptures>;
};

export type StoreManifest = {
  generatedAt: string;
  app: {
    name: string;
    subtitle: Record<string, string>;
    developer: string;
    category: string;
    rating: number;
    ratingCount: string;
    ageRating: string;
    price: string;
    description: Record<string, string>;
  };
  devices: DeviceEntry[];
  locales: string[];
  design: Design;
};

/** A load failure with the CLI command that fixes it, for the empty state. */
export class ManifestError extends Error {
  constructor(
    message: string,
    readonly command: string,
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// Static data: the scaffold defaults the CLI would write into out/store.json.
// ---------------------------------------------------------------------------

const LOCALE = "en-US";

/** Bundled typefaces in public/fonts/ (Google Fonts, OFL). */
const FONTS: Array<{ key: string; family: string; fallback: string; files: Record<number, string> }> = [
  { key: "merriweather", family: "Merriweather", fallback: "Georgia, serif", files: { 400: "Merriweather-400.ttf", 700: "Merriweather-700.ttf" } },
  { key: "dm-mono", family: "DM Mono", fallback: "ui-monospace, Menlo, monospace", files: { 400: "DMMono-400.ttf", 500: "DMMono-500.ttf" } },
  { key: "lato", family: "Lato", fallback: "system-ui, sans-serif", files: { 400: "Lato-400.ttf", 700: "Lato-700.ttf" } },
  { key: "dm-sans", family: "DM Sans", fallback: "system-ui, sans-serif", files: { 400: "DMSans-400.ttf", 700: "DMSans-700.ttf" } },
  { key: "montserrat", family: "Montserrat", fallback: "system-ui, sans-serif", files: { 400: "Montserrat-400.ttf", 700: "Montserrat-700.ttf" } },
  { key: "noto-sans-arabic", family: "Noto Sans Arabic", fallback: '"Geeza Pro", "Segoe UI", sans-serif', files: { 400: "NotoSansArabic-400.ttf", 700: "NotoSansArabic-700.ttf" } },
];

const FRAME_VARIANTS = [
  "17-pro-silver",
  "17-pro-blue",
  "17-pro-orange",
  "ipad-pro-13-silver",
  "ipad-pro-13-space-gray",
] as const;

const VARIANT_DEVICE: Record<string, string> = {
  "17-pro-silver": "iphone-6.9",
  "17-pro-blue": "iphone-6.9",
  "17-pro-orange": "iphone-6.9",
  "ipad-pro-13-silver": "ipad-13",
  "ipad-pro-13-space-gray": "ipad-13",
};

/** The scaffold theme from `creestion studio` (src/cli.ts). */
const DEFAULT_THEME: Theme = {
  background: "linear-gradient(160deg, #E8F1FF 0%, #F7FAFF 55%, #FFFFFF 100%)",
  headlineColor: "#0E1B2A",
  subheadColor: "#5A6A7D",
  fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
  copyHeightRatio: 0.24,
  deviceWidthRatio: 0.84,
};

/** Demo scenes with bundled mockup screenshots, like the studio's sample strip. */
const DEMO_SCENES: Array<{ id: string; headline: string; subhead: string; shot: string }> = [
  { id: "smart-experience", headline: "Smart Mobile Experience", subhead: "Discover a new way to stay productive", shot: "demo/ai-shot-1.png" },
  { id: "realtime-analytics", headline: "Real-time Analytics", subhead: "Track your progress with interactive graphs", shot: "demo/ai-shot-2.png" },
  { id: "seamless-collaboration", headline: "Seamless Collaboration", subhead: "Stay connected with your team anywhere", shot: "demo/ai-shot-3.png" },
  { id: "ultra-fast-secure", headline: "Ultra Fast & Secure", subhead: "Built with state of the art technology", shot: "demo/ai-shot-4.png" },
  { id: "made-for-everyone", headline: "Made for Everyone", subhead: "Simple, fast and delightful", shot: "demo/ai-shot-5.png" },
];

// ---------------------------------------------------------------------------
// Runtime overlay: user scenes + uploads, in localStorage (uploads stay in
// memory as object URLs — the browser revokes them on reload).
// ---------------------------------------------------------------------------

type Overlay = {
  addedScenes: Array<{ id: string; headline: string; subhead: string }>;
  deletedScenes: string[];
};

const OVERLAY_KEY = "creestion-web:overlay:v1";
const DESIGN_KEY = "creestion-web:design:v1";

/** Session uploads: deviceKey -> sceneId -> object URL. */
const sessionShots: Record<string, Record<string, string>> = {};

function loadOverlay(): Overlay {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Array.isArray(p.addedScenes) && Array.isArray(p.deletedScenes)) return p;
    }
  } catch {
    /* ignore */
  }
  return { addedScenes: [], deletedScenes: [] };
}

function saveOverlay(o: Overlay): void {
  try {
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

function validSceneId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

// ---------------------------------------------------------------------------
// Manifest API: same signatures the studio's App expects.
// ---------------------------------------------------------------------------

export async function loadManifest(): Promise<StoreManifest> {
  const overlay = loadOverlay();
  const deleted = new Set(overlay.deletedScenes);

  const scenes: DesignScene[] = [
    ...DEMO_SCENES.filter((d) => !deleted.has(d.id)).map((d) => ({
      id: d.id,
      headline: { [LOCALE]: d.headline },
      subhead: { [LOCALE]: d.subhead },
    })),
    ...overlay.addedScenes.map((s) => ({
      id: s.id,
      headline: { [LOCALE]: s.headline },
      ...(s.subhead ? { subhead: { [LOCALE]: s.subhead } } : {}),
    })),
  ];

  const devices: DeviceEntry[] = (Object.keys(DEVICES) as DeviceKey[]).map((key) => {
    const d = DEVICES[key];
    return {
      key,
      label: d.label,
      platform: d.platform,
      type: d.type,
      copyScale: d.copyScale ?? 1,
      simulatorName: d.simulatorName ?? null,
      screenshot: d.screenshot,
      preview: d.preview ?? null,
      frame:
        d.platform === "android"
          ? { url: `frames/${ANDROID_FRAME.file}`, geom: { ...ANDROID_FRAME.geom } }
          : null,
    };
  });

  const captures: Record<string, DeviceCaptures> = {};
  const shots: Array<{ sceneId: string; url: string }> = [];
  for (const d of DEMO_SCENES) {
    if (deleted.has(d.id)) continue;
    const session = sessionShots["iphone-6.9"]?.[d.id];
    shots.push({ sceneId: d.id, url: session ?? d.shot });
  }
  for (const s of overlay.addedScenes) {
    const session = sessionShots["iphone-6.9"]?.[s.id];
    if (session) shots.push({ sceneId: s.id, url: session });
  }
  if (shots.length > 0) captures["iphone-6.9"] = { screenshots: shots, clips: null };

  return {
    generatedAt: new Date().toISOString(),
    app: {
      name: "Creestion Studio",
      subtitle: { [LOCALE]: "App Store screenshot editor" },
      developer: "Dus Mamud",
      category: "Productivity",
      rating: 5.0,
      ratingCount: "0 Ratings",
      ageRating: "4+",
      price: "Free",
      description: { [LOCALE]: "Create beautiful App Store screenshots in your browser." },
    },
    devices,
    locales: [LOCALE],
    design: {
      theme: { ...DEFAULT_THEME },
      frames: { "iphone-6.9": "17-pro-blue", "ipad-13": "ipad-pro-13-silver", "pixel-10-pro": null },
      frameVariants: FRAME_VARIANTS.map((key) => ({ key, device: VARIANT_DEVICE[key]! })),
      customFrameUrl: null,
      fonts: FONTS.map((f) => ({
        key: f.key,
        family: f.family,
        fallback: f.fallback,
        faces: Object.entries(f.files).map(([weight, file]) => ({
          weight: Number(weight),
          url: `fonts/${file}`,
        })),
      })),
      layouts: Object.values(LAYOUTS).map(({ key, label, description, span }) => ({
        key,
        label,
        description,
        span,
      })),
      templates: Object.values(TEMPLATES),
      template: "magazine",
      layout: "classic",
      screenOnly: false,
      decorations: [],
      scenes,
      preview: null,
      captures,
    },
  };
}

/** The design choices; localStorage replaces creestion.design.json. */
export type SavedDesign = {
  background?: string;
  /** One variant for the device it is drawn for; written by older studios. */
  frame?: string;
  /** A bezel variant per device key. */
  frames?: Record<string, string>;
  fontFamily?: string;
  /** Copy edited in the lightbox, per screenshot scene id, then locale. */
  copy?: Record<string, SceneCopy>;
  /** Screenshot scene ids in the order the tiles were dragged into. */
  order?: string[];
  /** A built-in template key, or "" for none. */
  template?: string;
  /** Default layout key for scenes the template does not cover. */
  layout?: string;
  screenOnly?: boolean;
  /** Layout overrides per screenshot scene id. */
  sceneLayouts?: Record<string, string>;
  /**
   * Manual nudge offsets per screenshot scene id, from drag editing in the
   * studio. Fractions of the tile's width/height.
   */
  positions?: Record<string, LayerOffsets>;
};

export type SceneCopy = {
  headline?: Record<string, string>;
  subhead?: Record<string, string>;
};

export async function loadDesign(): Promise<SavedDesign> {
  try {
    const raw = localStorage.getItem(DESIGN_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as SavedDesign) : {};
  } catch {
    return {};
  }
}

export async function saveDesign(design: SavedDesign): Promise<void> {
  try {
    localStorage.setItem(DESIGN_KEY, JSON.stringify(design));
  } catch {
    /* quota: the session still works */
  }
}

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

/** Upload a screenshot for a scene; stored as an object URL for the session. */
export async function uploadScreenshot(
  deviceKey: string,
  sceneId: string,
  file: File,
): Promise<void> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const isPng = PNG_MAGIC.every((b, i) => head[i] === b);
  if (!isPng && file.type !== "image/png") throw new Error("Only PNG screenshots are accepted.");
  const prev = sessionShots[deviceKey]?.[sceneId];
  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
  (sessionShots[deviceKey] ??= {})[sceneId] = URL.createObjectURL(file);
}

/** Add a manual scene; returns its id. */
export async function createScene(id: string, headline: string): Promise<string> {
  if (!validSceneId(id)) {
    throw new Error(
      `Invalid scene id "${id}": use lowercase letters, numbers and dashes (e.g. "hero-screen").`,
    );
  }
  const overlay = loadOverlay();
  const known = new Set([
    ...DEMO_SCENES.map((d) => d.id),
    ...overlay.addedScenes.map((s) => s.id),
  ]);
  if (known.has(id) && !overlay.deletedScenes.includes(id)) {
    throw new Error(`A scene called "${id}" already exists.`);
  }
  overlay.addedScenes = overlay.addedScenes.filter((s) => s.id !== id);
  overlay.addedScenes.push({ id, headline, subhead: "" });
  overlay.deletedScenes = overlay.deletedScenes.filter((d) => d !== id);
  saveOverlay(overlay);
  return id;
}

export async function removeScene(id: string): Promise<void> {
  const overlay = loadOverlay();
  overlay.addedScenes = overlay.addedScenes.filter((s) => s.id !== id);
  if (DEMO_SCENES.some((d) => d.id === id) && !overlay.deletedScenes.includes(id)) {
    overlay.deletedScenes.push(id);
  }
  for (const deviceShots of Object.values(sessionShots)) {
    const url = deviceShots[id];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    delete deviceShots[id];
  }
  saveOverlay(overlay);
}
