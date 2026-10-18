import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * The font dropdown. Each option shows an "Aa" specimen set in the font
 * itself, next to its name, so the choice reads as a typeface rather than a
 * label. The bundled fonts are declared via @font-face in the manifest, so
 * the specimen renders exactly as the strip will.
 */
export function FontPicker({
  value,
  options,
  onChange,
}: {
  value: string;
  /** [css font stack, display name] pairs. */
  options: Array<[string, string]>;
  onChange: (v: string) => void;
}) {
  return (
    <SelectRoot value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full py-1.5 data-[size=default]:h-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([css, label]) => (
          <SelectItem key={css} value={css} className="py-1.5">
            <FontOption css={css} label={label} />
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

function FontOption({ css, label }: { css: string; label: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        style={{ fontFamily: css }}
        className="swatch-edge flex h-7 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-[15px] leading-none font-bold text-foreground"
      >
        Aa
      </span>
      <span className="text-sm">{label}</span>
    </span>
  );
}
