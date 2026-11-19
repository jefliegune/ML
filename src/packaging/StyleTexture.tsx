import type {CSSProperties, FC} from "react";
import {AbsoluteFill} from "remotion";

export type TextureVariant =
  | "paper"
  | "grain"
  | "halftone"
  | "scanlines"
  | "riso"
  | "vignette";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

export interface StyleTextureProps {
  variant: TextureVariant;
  opacity?: number;
  color?: string;
  accent?: string;
  scale?: number;
  style?: CSSProperties;
}

export const StyleTexture: FC<StyleTextureProps> = ({
  variant,
  opacity = 0.35,
  color = "#151515",
  accent = "#FF5B48",
  scale = 7,
  style,
}) => {
  let backgroundImage = NOISE;
  let backgroundSize = "140px 140px";
  let mixBlendMode: CSSProperties["mixBlendMode"] = "multiply";

  if (variant === "grain") {
    mixBlendMode = "overlay";
  }
  if (variant === "halftone") {
    backgroundImage = `radial-gradient(circle at 1px 1px, ${color} 1.1px, transparent 1.2px)`;
    backgroundSize = `${scale}px ${scale}px`;
  }
  if (variant === "scanlines") {
    backgroundImage = `repeating-linear-gradient(0deg, ${color} 0 1px, transparent 1px ${scale}px)`;
    backgroundSize = "auto";
    mixBlendMode = "normal";
  }
  if (variant === "riso") {
    backgroundImage = `linear-gradient(118deg, ${color} 0%, transparent 52%), linear-gradient(298deg, ${accent} 0%, transparent 58%)`;
    backgroundSize = "auto";
    mixBlendMode = "multiply";
  }
  if (variant === "vignette") {
    backgroundImage =
      "radial-gradient(ellipse at center, rgba(0,0,0,0) 46%, rgba(0,0,0,0.5) 100%)";
    backgroundSize = "auto";
    mixBlendMode = "normal";
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity,
        backgroundImage,
        backgroundSize,
        mixBlendMode,
        ...style,
      }}
    />
  );
};