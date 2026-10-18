import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOM_TEMPLATE } from "../App";
import type { Design } from "../manifest";
import { TemplateGlyphs } from "./LayoutGlyph";

const EMPTY = "__none__";

/**
 * The template dropdown. Each option is a picture of the strip it produces:
 * one glyph per tile, drawn from the real layout geometry. "None" repeats
 * the single layout picked below it; "Custom" draws the config's sequence.
 */
export function TemplatePicker({
  design,
  value,
  layout,
  onChange,
}: {
  design: Design;
  value: string;
  /** The theme layout, shown when no template is chosen. */
  layout: string;
  onChange: (v: string) => void;
}) {
  const options: Array<{ key: string; label: string; sequence: string[] }> = [
    { key: "", label: "Basic", sequence: Array(5).fill(layout) },
    ...design.templates
      .filter((t) => t.sequence.length > 0)
      .map((t) => ({ key: t.key, label: t.label, sequence: t.sequence })),
    ...(Array.isArray(design.template)
      ? [{ key: CUSTOM_TEMPLATE, label: "Custom", sequence: design.template }]
      : []),
  ];
  return (
    <SelectRoot value={value || EMPTY} onValueChange={(v) => onChange(v === EMPTY ? "" : v)}>
      <SelectTrigger className="w-full py-2 data-[size=default]:h-auto *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-[320px]">
        {options.map((o) => (
          <SelectItem key={o.key} value={o.key || EMPTY} className="py-2.5 *:[span]:last:w-full">
            <span className="flex w-full flex-col gap-2">
              <TemplateGlyphs sequence={o.sequence} />
              <span className="text-xs font-medium">{o.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
