import type {CSSProperties} from "react";
import {useCurrentFrame} from "remotion";
import {PIXEL_ARCADE as C} from "./tokens";

const BODY = [
  "................",
  "......oooo......",
  ".....ohhhho.....",
  "....ohhhhhho....",
  "....ohssssho....",
  "....ohsksksho...",
  "....ohssssho....",
  ".....osssso.....",
  "......ommo......",
  ".......oo.......",
  "....ooccccoo....",
  "...occcccccco...",
  "...occcacccco...",
  "...occcccccco...",
  "....occcccco....",
  "....opppppo.....",
  "....oppoppo.....",
  "....oppoppo.....",
  "....obb.obbo....",
  "....ooo.ooo.....",
  "................",
  "................",
];

const COLORS: Record<string, string> = {
  o: C.ink,
  h: "#2B2D42",
  s: "#F2C6A0",
  k: C.ink,
  m: C.coral,
  c: C.mint,
  p: C.blue,
  b: C.ink,
  a: C.yellow,
};

type Pose = "idle" | "wave" | "point";

const PixelArm: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  hand?: boolean;
}> = ({x, y, w, h, fill, hand = false}) => (
  <>
    <rect x={x} y={y} width={w} height={h} fill={C.ink} />
    <rect x={x + 0.22} y={y + 0.22} width={w - 0.44} height={h - 0.44} fill={fill} />
    {hand ? (
      <>
        <rect x={x + 0.1} y={y + h - 0.3} width={w + 0.4} height={1.6} fill={C.ink} />
        <rect x={x + 0.34} y={y + h} width={w - 0.05} height={1.1} fill="#F2C6A0" />
      </>
    ) : null}
  </>
);

export const PixelBuddy: React.FC<{
  pose?: Pose;
  size?: number;
  style?: CSSProperties;
  shirtColor?: string;
  pantsColor?: string;
  accentColor?: string;
}> = ({
  pose = "idle",
  size = 300,
  style,
  shirtColor = C.mint,
  pantsColor = C.blue,
  accentColor = C.yellow,
}) => {
  const frame = useCurrentFrame();
  const blink = frame % 86 < 4;
  const bob = Math.sin(frame / 6) * 2.5;

  return (
    <svg
      viewBox="0 0 20 22"
      width={size}
      height={size * 1.1}
      style={{overflow: "visible", ...style}}
      shapeRendering="crispEdges"
    >
      <ellipse cx={10} cy={21.6} rx={6.2} ry={0.75} fill={C.ink} opacity={0.5} />
      <g transform={`translate(2 ${bob})`}>
        {BODY.flatMap((row, y) =>
          row.split("").map((cell, x) => {
            if (cell === ".") return null;
            const fill =
              cell === "k" && blink
                ? "#F2C6A0"
                : cell === "c"
                  ? shirtColor
                  : cell === "p"
                    ? pantsColor
                    : cell === "a"
                      ? accentColor
                      : COLORS[cell];
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1.02}
                height={1.02}
                fill={fill}
              />
            );
          }),
        )}

        {pose === "wave" ? (
          <>
            <PixelArm x={13.2} y={7} w={2.4} h={5} fill={shirtColor} hand />
            <rect x={16.2} y={6.2} width={0.55} height={0.55} fill={accentColor} />
            <rect x={16.9} y={7.3} width={0.55} height={0.55} fill={accentColor} />
          </>
        ) : pose === "point" ? (
          <PixelArm x={13.2} y={9.5} w={5.2} h={2.2} fill={shirtColor} hand />
        ) : (
          <>
            <PixelArm x={1.1} y={11.2} w={2.2} h={4.2} fill={shirtColor} />
            <PixelArm x={13.2} y={11.2} w={2.2} h={4.2} fill={shirtColor} />
          </>
        )}
      </g>
    </svg>
  );
};
