import { useCallback, useEffect, useMemo, useState } from "react";
import { DEVICES, type DeviceKey } from "./engine/specs";
import type { LayerOffsets } from "./engine/layouts";
import { GRADIENTS } from "./lib/backgrounds";

export type { DeviceKey };

export type Scene = {
  id: string;
  headline: string;
  subhead: string;
  /** Uploaded screenshots per device key (object URLs, session-only). */
  shots: Record<string, string>;
  /** Per-scene layout override; undefined follows the template/default. */
  layout?: string;
};

export type Design = {
  device: DeviceKey;
  background: string;
  template: string;
  layout: string;
  fontFamily: string;
  frames: Record<string, string>;
  screenOnly: boolean;
  positions: Record<string, LayerOffsets>;
  order: string[];
};

export const DEVICE_KEYS = Object.keys(DEVICES) as DeviceKey[];

const DEFAULT_DESIGN: Design = {
  device: "iphone-6.9",
  background: GRADIENTS[0]!.css,
  template: "magazine",
  layout: "classic",
  fontFamily: "Montserrat",
  frames: { "iphone-6.9": "17-pro-blue", "ipad-13": "ipad-pro-13-silver" },
  screenOnly: false,
  positions: {},
  order: [],
};

const STORAGE_KEY = "creestion-web:v1";

/** Demo scenes shown on first run, like goldie's sample strip: each ships
 * with a bundled mockup screenshot and editable copy. */
export const DEMO_SCENES: Array<{
  id: string;
  headline: string;
  subhead: string;
  shot: string;
}> = [
  {
    id: "smart-experience",
    headline: "Smart Mobile Experience",
    subhead: "Discover a new way to stay productive",
    shot: "/demo/shot-1.png",
  },
  {
    id: "realtime-analytics",
    headline: "Real-time Analytics",
    subhead: "Track your progress with interactive graphs",
    shot: "/demo/shot-2.png",
  },
  {
    id: "seamless-collaboration",
    headline: "Seamless Collaboration",
    subhead: "Stay connected with your team anywhere",
    shot: "/demo/shot-3.png",
  },
  {
    id: "ultra-fast-secure",
    headline: "Ultra Fast & Secure",
    subhead: "Built with state of the art technology",
    shot: "/demo/shot-4.png",
  },
  {
    id: "made-for-everyone",
    headline: "Made for Everyone",
    subhead: "Simple, fast and delightful",
    shot: "/demo/shot-5.png",
  },
];

function demoScenes(): Scene[] {
  return DEMO_SCENES.map((d) => ({
    id: d.id,
    headline: d.headline,
    subhead: d.subhead,
    shots: { "iphone-6.9": d.shot },
  }));
}

type Persisted = {
  scenes: Array<{
    id: string;
    headline: string;
    subhead: string;
    layout?: string;
    /** Bundled (non-blob) screenshot URLs survive reloads. */
    shots?: Record<string, string>;
  }>;
  design: Design;
};

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Persisted;
    if (!Array.isArray(p.scenes) || typeof p.design !== "object") return null;
    return p;
  } catch {
    return null;
  }
}

export function slugify(id: string): string {
  return id
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useCreestion() {
  const [scenes, setScenes] = useState<Scene[]>(() => {
    const p = loadPersisted();
    // First run (nothing saved yet): seed the demo strip.
    if (!p) return demoScenes();
    return p.scenes.map((s) => ({ ...s, shots: s.shots ?? {} }));
  });
  const [design, setDesign] = useState<Design>(() => loadPersisted()?.design ?? DEFAULT_DESIGN);

  useEffect(() => {
    try {
      const p: Persisted = {
        scenes: scenes.map(({ id, headline, subhead, layout, shots }) => {
          // Uploaded screenshots are blob: URLs (session-only); bundled
          // demo shots are plain paths and survive reloads.
          const kept: Record<string, string> = {};
          for (const [device, url] of Object.entries(shots)) {
            if (!url.startsWith("blob:")) kept[device] = url;
          }
          return { id, headline, subhead, layout, shots: kept };
        }),
        design,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* quota exceeded: screenshots stay session-only, design may not persist */
    }
  }, [scenes, design]);

  const patchDesign = useCallback((patch: Partial<Design>) => {
    setDesign((d) => ({ ...d, ...patch }));
  }, []);

  const addScene = useCallback((id: string, headline: string) => {
    const sid = slugify(id);
    if (!sid) throw new Error("A scene needs an id");
    setScenes((ss) => {
      if (ss.some((s) => s.id === sid)) throw new Error(`Scene "${sid}" already exists`);
      return [...ss, { id: sid, headline, subhead: "", shots: {} }];
    });
    return sid;
  }, []);

  const deleteScene = useCallback((id: string) => {
    setScenes((ss) => {
      const doomed = ss.find((s) => s.id === id);
      if (doomed) for (const url of Object.values(doomed.shots)) URL.revokeObjectURL(url);
      return ss.filter((s) => s.id !== id);
    });
    setDesign((d) => {
      const positions = { ...d.positions };
      delete positions[id];
      return { ...d, positions, order: d.order.filter((o) => o !== id) };
    });
  }, []);

  const setShot = useCallback((sceneId: string, device: string, file: File) => {
    const url = URL.createObjectURL(file);
    setScenes((ss) =>
      ss.map((s) => {
        if (s.id !== sceneId) return s;
        const old = s.shots[device];
        if (old) URL.revokeObjectURL(old);
        return { ...s, shots: { ...s.shots, [device]: url } };
      }),
    );
  }, []);

  const setCopy = useCallback((sceneId: string, field: "headline" | "subhead", text: string) => {
    setScenes((ss) => ss.map((s) => (s.id === sceneId ? { ...s, [field]: text } : s)));
  }, []);

  const setSceneLayout = useCallback((sceneId: string, layout: string | undefined) => {
    setScenes((ss) => ss.map((s) => (s.id === sceneId ? { ...s, layout } : s)));
  }, []);

  const setPositions = useCallback((sceneId: string, offsets: LayerOffsets | null) => {
    setDesign((d) => {
      const positions = { ...d.positions };
      if (offsets) positions[sceneId] = offsets;
      else delete positions[sceneId];
      return { ...d, positions };
    });
  }, []);

  /** Restore the bundled demo scenes (replaces the current scene list). */
  const loadDemo = useCallback(() => {
    setScenes((ss) => {
      for (const s of ss) for (const url of Object.values(s.shots)) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
      return demoScenes();
    });
    setDesign((d) => ({ ...d, positions: {}, order: [] }));
  }, []);

  const orderedScenes = useMemo(() => {
    if (design.order.length === 0) return scenes;
    const rank = new Map(design.order.map((id, i) => [id, i]));
    return [...scenes].sort((a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9));
  }, [scenes, design.order]);

  return {
    scenes,
    orderedScenes,
    design,
    patchDesign,
    addScene,
    deleteScene,
    setShot,
    setCopy,
    setSceneLayout,
    setPositions,
    loadDemo,
  };
}

export type Creestion = ReturnType<typeof useCreestion>;
