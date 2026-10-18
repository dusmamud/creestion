import {
  DownloadIcon,
  LayoutGridIcon,
  type LucideIcon,
  MoonIcon,
  PlayIcon,
  SmartphoneIcon,
  SunIcon,
  TabletIcon,
} from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DEVICES } from "../engine/specs";
import { LAYOUT_KEYS, TEMPLATES } from "../engine/layouts";
import { FONT_FAMILIES } from "../lib/fonts";
import { GRADIENTS, SOLIDS } from "../lib/backgrounds";
import type { Creestion, DeviceKey } from "../store";

const DEVICE_ICONS: Array<{ key: DeviceKey; icon: LucideIcon; label: string }> = [
  { key: "iphone-6.9", icon: SmartphoneIcon, label: "iPhone" },
  { key: "ipad-13", icon: TabletIcon, label: "iPad" },
  { key: "pixel-10-pro", icon: PlayIcon, label: "Android" },
];

const FRAME_VARIANTS: Record<string, Array<{ value: string; label: string }>> = {
  "iphone-6.9": [
    { value: "17-pro-blue", label: "Deep Blue" },
    { value: "17-pro-silver", label: "Silver" },
    { value: "17-pro-orange", label: "Cosmic Orange" },
  ],
  "ipad-13": [
    { value: "ipad-pro-13-silver", label: "Silver" },
    { value: "ipad-pro-13-space-gray", label: "Space Gray" },
  ],
};

/**
 * The left rail: the creestion wordmark, device tabs, design controls, and
 * a sticky Export footer.
 */
export function Sidebar({
  store,
  dark,
  onDark,
  onExport,
  exporting,
}: {
  store: Creestion;
  dark: boolean;
  onDark: (v: boolean) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  const { design, patchDesign } = store;
  const spec = DEVICES[design.device];
  const variants = FRAME_VARIANTS[design.device];

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto rounded-2xl border bg-background p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">creestion</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Grid view" disabled>
            <LayoutGridIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onDark(!dark)} aria-label="Toggle appearance">
            {dark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>

      <Section label="Device">
        <RadioGroupPrimitive.Root
          value={design.device}
          onValueChange={(v) => patchDesign({ device: v as DeviceKey })}
          className="grid grid-cols-3 gap-1"
        >
          {DEVICE_ICONS.map(({ key, icon: Icon, label }) => (
            <RadioGroupPrimitive.Item
              key={key}
              value={key}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-medium",
                "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",
              )}
            >
              <Icon className="size-4" />
              {label}
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroupPrimitive.Root>
        <p className="text-[11px] text-muted-foreground">
          {spec.label} · {spec.screenshot.width}×{spec.screenshot.height}
        </p>
      </Section>

      <Section label="Background">
        <BackgroundPicker value={design.background} onChange={(v) => patchDesign({ background: v })} />
      </Section>

      <Section label="Font">
        <SelectRoot value={design.fontFamily} onValueChange={(v) => patchDesign({ fontFamily: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f} value={f}>
                <span style={{ fontFamily: f }}>{f}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Section>

      <Section label="Template">
        <SelectRoot value={design.template} onValueChange={(v) => patchDesign({ template: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <SelectItem key={key} value={key}>
                {t.label}
              </SelectItem>
            ))}
            <SelectItem value="">Custom (per-scene layout)</SelectItem>
          </SelectContent>
        </SelectRoot>
      </Section>

      <Section label="Layout">
        <SelectRoot value={design.layout} onValueChange={(v) => patchDesign({ layout: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LAYOUT_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Section>

      {variants && (
        <Section label="Frame">
          <RadioGroupPrimitive.Root
            value={design.frames[design.device] ?? variants[0]!.value}
            onValueChange={(v) =>
              patchDesign({ frames: { ...design.frames, [design.device]: v } })
            }
            className="flex flex-wrap gap-1"
          >
            {variants.map(({ value, label }) => (
              <RadioGroupPrimitive.Item
                key={value}
                value={value}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium",
                  "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",
                )}
              >
                {label}
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroupPrimitive.Root>
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={design.screenOnly}
              onChange={(e) => patchDesign({ screenOnly: e.target.checked })}
              className="size-4 accent-primary"
            />
            Screen only (no bezel)
          </label>
        </Section>
      )}

      <div className="mt-auto pt-2">
        <Button className="w-full" onClick={onExport} disabled={exporting}>
          <DownloadIcon /> {exporting ? "Exporting…" : "Export PNG"}
        </Button>
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</Label>
      {children}
    </section>
  );
}

function BackgroundPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {[...GRADIENTS, ...SOLIDS].map(({ name, css }) => (
        <button
          key={name + css}
          type="button"
          title={name}
          aria-label={name}
          onClick={() => onChange(css)}
          className={cn(
            "aspect-square rounded-lg border",
            value === css ? "ring-2 ring-primary ring-offset-2" : "hover:ring-1 hover:ring-primary/50",
          )}
          style={{ background: css }}
        />
      ))}
    </div>
  );
}
