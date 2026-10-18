/** Bundled typefaces (in public/fonts), registered for canvas text. */

export const FONT_FAMILIES = [
  "Montserrat",
  "Merriweather",
  "DM Sans",
  "Lato",
  "DM Mono",
] as const;

const FILES: Record<string, Array<{ file: string; weight: string }>> = {
  Montserrat: [
    { file: "Montserrat-400.ttf", weight: "400" },
    { file: "Montserrat-700.ttf", weight: "700" },
  ],
  Merriweather: [
    { file: "Merriweather-400.ttf", weight: "400" },
    { file: "Merriweather-700.ttf", weight: "700" },
  ],
  "DM Sans": [
    { file: "DMSans-400.ttf", weight: "400" },
    { file: "DMSans-700.ttf", weight: "700" },
  ],
  Lato: [
    { file: "Lato-400.ttf", weight: "400" },
    { file: "Lato-700.ttf", weight: "700" },
  ],
  "DM Mono": [
    { file: "DMMono-400.ttf", weight: "400" },
    { file: "DMMono-500.ttf", weight: "500" },
  ],
};

let loaded: Promise<void> | null = null;

/** Register the bundled fonts exactly once; resolves when they're usable. */
export function ensureFonts(): Promise<void> {
  if (!loaded) {
    loaded = (async () => {
      const jobs: Array<Promise<unknown>> = [];
      for (const [family, faces] of Object.entries(FILES)) {
        for (const { file, weight } of faces) {
          const face = new FontFace(family, `url(/fonts/${file})`, { weight });
          jobs.push(
            face
              .load()
              .then((f) => document.fonts.add(f))
              .catch(() => undefined),
          );
        }
      }
      await Promise.all(jobs);
    })();
  }
  return loaded;
}
