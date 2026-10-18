import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import { compose, LAYOUTS, TYPE, isLayoutKey, isTemplateKey, templateSequence, type Composition, type LayerOffsets } from "../engine/layouts";
import { FRAMES } from "../engine/frame";
import { DEVICES, type DeviceKey } from "../engine/specs";
import { konvaFill, parseBackground } from "../lib/backgrounds";
import type { Design, Scene } from "../store";

export type { DeviceKey };

/** Resolve the layout key for a scene: per-scene override, then the
 * template's entry for its position, then the default layout. */
export function layoutKeyFor(index: number, scene: Scene, design: Design): string {
  if (scene.layout && isLayoutKey(scene.layout)) return scene.layout;
  const seq = templateSequence(isTemplateKey(design.template) ? design.template : undefined);
  if (seq.length) {
    const key = seq[index % seq.length];
    if (key && isLayoutKey(key)) return key;
  }
  return isLayoutKey(design.layout) ? design.layout : "classic";
}

type Props = {
  scene: Scene;
  /** Screenshot URL for the secondary device in two-screen layouts. */
  secondShot?: string;
  layoutKey: string;
  deviceKey: DeviceKey;
  design: Design;
  /** Display width in px; the stage scales the spec-px composition into it. */
  displayWidth: number;
  /** Enable dragging layers and double-click text editing. */
  interactive?: boolean;
  onPositions?: (sceneId: string, offsets: LayerOffsets | null) => void;
  onCopy?: (sceneId: string, field: "headline" | "subhead", text: string) => void;
  /** Called with the stage once images + fonts are ready (used by export). */
  onReady?: (stage: Konva.Stage) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
};

export function SceneCanvas({
  scene,
  secondShot,
  layoutKey,
  deviceKey,
  design,
  displayWidth,
  interactive = false,
  onPositions,
  onCopy,
  onReady,
  stageRef,
}: Props) {
  const spec = DEVICES[deviceKey];
  const tile = spec.screenshot;
  const scale = displayWidth / tile.width;
  const displayHeight = tile.height * scale;

  const layout = LAYOUTS[isLayoutKey(layoutKey) ? layoutKey : "classic"]!;
  const geom = FRAMES[deviceKey];
  const offsets = design.positions[scene.id];
  const c = useMemo(
    () =>
      compose(
        layout,
        tile,
        { copyHeightRatio: 0.24, deviceWidthRatio: 0.84 },
        { screenOnly: design.screenOnly, geom, copyScale: spec.copyScale, offsets },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.key, tile.width, design.screenOnly, deviceKey, JSON.stringify(offsets)],
  );

  const variant = design.frames[deviceKey];
  const bezelUrl =
    deviceKey === "pixel-10-pro" ? "/frames/pixel-10-pro.webp" : variant ? `/frames/${variant}.png` : null;
  const [bezelImg, bezelStatus] = useImage(bezelUrl ?? "", "anonymous");
  const shotUrl = scene.shots[deviceKey];
  const [shotImg, shotStatus] = useImage(shotUrl ?? "", "anonymous");
  const [secondShotImg, secondShotStatus] = useImage(secondShot ?? "", "anonymous");

  const stageLocalRef = useRef<Konva.Stage | null>(null);
  const stage = stageRef ?? stageLocalRef;

  const ready =
    (!bezelUrl || bezelStatus === "loaded") &&
    (!shotUrl || shotStatus === "loaded") &&
    (!secondShot || secondShotStatus === "loaded");
  useEffect(() => {
    if (ready && stage.current) onReady?.(stage.current);
  }, [ready, onReady, stage]);

  const bgFill = useMemo(() => parseBackground(design.background), [design.background]);

  const moveLayer = (layer: "copy" | number, dx: number, dy: number) => {
    const cur = offsets ?? {};
    if (layer === "copy") {
      const o = cur.copy ?? { x: 0, y: 0 };
      onPositions?.(scene.id, { ...cur, copy: { x: o.x + dx, y: o.y + dy } });
    } else {
      const arr = [...(cur.devices ?? [])];
      const o = arr[layer] ?? { x: 0, y: 0 };
      arr[layer] = { x: o.x + dx, y: o.y + dy };
      onPositions?.(scene.id, { ...cur, devices: arr });
    }
  };

  const [editing, setEditing] = useState<null | {
    field: "headline" | "subhead";
    x: number;
    y: number;
    width: number;
    value: string;
    fontSize: number;
    align: string;
    color: string;
  }>(null);

  const dark = isDark(design.background);
  const headlineColor = dark ? "#FFFFFF" : designHeadline(design.background);
  const subheadColor = dark ? "#D9E1EA" : designSubhead(design.background);

  return (
    <div style={{ position: "relative", width: displayWidth, height: displayHeight }}>
      <Stage
        ref={stage}
        width={displayWidth}
        height={displayHeight}
        scaleX={scale}
        scaleY={scale}
        style={{ display: "block" }}
      >
        <Layer>
          {/* Background */}
          <Rect x={0} y={0} width={c.width} height={c.height} {...konvaFill(bgFill, c.width, c.height)} />

          {/* Copy block */}
          {c.copy && (
            <CopyBlock
              copy={c.copy}
              tile={tile}
              headline={scene.headline}
              subhead={scene.subhead}
              fontFamily={design.fontFamily}
              headlineColor={headlineColor}
              subheadColor={subheadColor}
              draggable={interactive}
              onDrag={(dx, dy) => moveLayer("copy", dx, dy)}
              onEdit={
                interactive && onCopy
                  ? (field, x, y, width, value, fontSize, align, color) =>
                      setEditing({ field, x, y, width, value, fontSize, align, color })
                  : undefined
              }
            />
          )}

          {/* Devices */}
          {c.devices.map((dev, i) => (
            <DeviceNode
              key={i}
              device={dev}
              tile={tile}
              bezelImg={design.screenOnly ? null : bezelImg}
              shotImg={(dev.capture === "secondary" ? secondShotImg : shotImg) ?? null}
              draggable={interactive}
              onDrag={(dx, dy) => moveLayer(i, dx, dy)}
            />
          ))}
        </Layer>
      </Stage>

      {/* Inline text editor overlay */}
      {editing && (
        <textarea
          autoFocus
          value={editing.value}
          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
          onBlur={() => {
            onCopy?.(scene.id, editing.field, editing.value);
            setEditing(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onCopy?.(scene.id, editing.field, editing.value);
              setEditing(null);
            }
            if (e.key === "Escape") setEditing(null);
          }}
          style={{
            position: "absolute",
            left: editing.x * scale,
            top: editing.y * scale,
            width: editing.width * scale,
            fontSize: editing.fontSize * scale,
            fontFamily: design.fontFamily,
            color: editing.color,
            textAlign: editing.align as "left" | "center",
            background: "rgba(255,255,255,0.9)",
            border: "2px solid #3b82f6",
            borderRadius: 6,
            padding: 4,
            zIndex: 10,
            resize: "none",
          }}
          rows={3}
        />
      )}
    </div>
  );
}

function isDark(css: string): boolean {
  const hexes = css.match(/#[0-9a-fA-F]{6}/g);
  if (!hexes || hexes.length === 0) return false;
  const lum = (hex: string) => {
    const ch = (o: number) => {
      const v = Number.parseInt(hex.slice(o, o + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(1) + 0.7152 * ch(3) + 0.0722 * ch(5);
  };
  return hexes.reduce((s, h) => s + lum(h), 0) / hexes.length < 0.5;
}
const designHeadline = (_bg: string) => "#0E1B2A";
const designSubhead = (_bg: string) => "#5A6A7D";

function CopyBlock({
  copy,
  tile,
  headline,
  subhead,
  fontFamily,
  headlineColor,
  subheadColor,
  draggable,
  onDrag,
  onEdit,
}: {
  copy: NonNullable<Composition["copy"]>;
  tile: { width: number; height: number };
  headline: string;
  subhead: string;
  fontFamily: string;
  headlineColor: string;
  subheadColor: string;
  draggable: boolean;
  onDrag: (dx: number, dy: number) => void;
  onEdit?: (
    field: "headline" | "subhead",
    x: number,
    y: number,
    width: number,
    value: string,
    fontSize: number,
    align: string,
    color: string,
  ) => void;
}) {
  const groupRef = useRef<Konva.Group>(null);
  const headlineRef = useRef<Konva.Text>(null);
  const [headlineH, setHeadlineH] = useState(0);
  const [measuredH, setMeasuredH] = useState(0);

  const hSize = TYPE.headlineSize * copy.typeWidth;
  const sSize = TYPE.subheadSize * copy.typeWidth;
  const gap = tile.height * TYPE.gap;
  const align = copy.align === "left" ? "left" : "center";

  // Measure the rendered headline (it may wrap to several lines, and the
  // height changes once the webfont arrives) so the subhead sits below it.
  useLayoutEffect(() => {
    const measure = () => {
      const h = headlineRef.current;
      if (h) setHeadlineH(h.height());
    };
    measure();
    let alive = true;
    document.fonts?.ready.then(() => alive && measure()).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [headline, subhead, hSize, copy.maxWidth, fontFamily]);

  // Bottom-positioned copy: measure the whole block, then lift it so its
  // bottom edge sits at copy.y.
  useEffect(() => {
    if (copy.position === "bottom" && groupRef.current) {
      setMeasuredH(groupRef.current.getClientRect({ skipTransform: true }).height);
    }
  }, [copy.position, headlineH, subhead, sSize]);

  const y = copy.position === "top" ? copy.y : copy.y - measuredH;

  const dragProps = draggable
    ? {
        draggable: true,
        onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
          const dx = (e.target.x() - copy.box.left) / tile.width;
          const dy = (e.target.y() - y) / tile.height;
          e.target.x(copy.box.left);
          e.target.y(y);
          onDrag(dx, dy);
        },
      }
    : {};

  const editProps = (field: "headline" | "subhead") =>
    onEdit
      ? {
          onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
            e.cancelBubble = true;
            const t = e.target as Konva.Text;
            // Absolute position inside the stage container (display px).
            const abs = t.getAbsolutePosition();
            onEdit(
              field,
              abs.x,
              abs.y,
              t.width() * (t.getStage()?.scaleX() ?? 1),
              field === "headline" ? headline : subhead,
              (field === "headline" ? hSize : sSize) * (t.getStage()?.scaleX() ?? 1),
              align,
              field === "headline" ? headlineColor : subheadColor,
            );
          },
        }
      : {};

  return (
    <Group ref={groupRef} x={copy.box.left} y={y} {...dragProps}>
      <Text
        ref={headlineRef}
        text={headline || "Headline"}
        x={0}
        y={0}
        width={copy.maxWidth}
        align={align}
        fontSize={hSize}
        lineHeight={TYPE.headlineLineHeight}
        fontFamily={fontFamily}
        fontStyle="700"
        fill={headlineColor}
        opacity={headline ? 1 : 0.4}
        {...editProps("headline")}
      />
      <Text
        text={subhead}
        x={0}
        y={headlineH + gap}
        width={copy.maxWidth}
        align={align}
        fontSize={sSize}
        lineHeight={TYPE.subheadLineHeight}
        fontFamily={fontFamily}
        fill={subheadColor}
        {...editProps("subhead")}
      />
    </Group>
  );
}

function DeviceNode({
  device,
  tile,
  bezelImg,
  shotImg,
  draggable,
  onDrag,
}: {
  device: Composition["devices"][number];
  tile: { width: number; height: number };
  bezelImg: HTMLImageElement | undefined | null;
  shotImg: HTMLImageElement | undefined | null;
  draggable: boolean;
  onDrag: (dx: number, dy: number) => void;
}) {
  const { frame, screen } = device;
  const cx = frame.left + frame.width / 2;
  const cy = frame.top + frame.height / 2;

  // Cover-fit the screenshot into the screen cutout.
  const crop = useMemo(() => {
    if (!shotImg || !shotImg.naturalWidth) return null;
    const iw = shotImg.naturalWidth;
    const ih = shotImg.naturalHeight;
    const s = Math.max(screen.width / iw, screen.height / ih);
    const cw = screen.width / s;
    const ch = screen.height / s;
    return { x: (iw - cw) / 2, y: (ih - ch) / 2, width: cw, height: ch };
  }, [shotImg, screen.width, screen.height]);

  return (
    <Group
      x={cx}
      y={cy}
      offsetX={frame.width / 2}
      offsetY={frame.height / 2}
      rotation={device.rotate || 0}
      draggable={draggable}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        const g = e.target;
        const dx = (g.x() - cx) / tile.width;
        const dy = (g.y() - cy) / tile.height;
        g.x(cx);
        g.y(cy);
        onDrag(dx, dy);
      }}
    >
      {shotImg && crop ? (
        <KonvaImage
          image={shotImg}
          x={screen.left - frame.left}
          y={screen.top - frame.top}
          width={screen.width}
          height={screen.height}
          crop={crop}
          cornerRadius={screen.radius}
        />
      ) : (
        <Rect
          x={screen.left - frame.left}
          y={screen.top - frame.top}
          width={screen.width}
          height={screen.height}
          cornerRadius={screen.radius}
          fill="#1c1917"
          stroke="#57534e"
          strokeWidth={4}
          dash={[24, 16]}
        />
      )}
      {bezelImg && (
        <KonvaImage image={bezelImg} x={0} y={0} width={frame.width} height={frame.height} />
      )}
    </Group>
  );
}
