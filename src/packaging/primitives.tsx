import type {CSSProperties, ReactNode} from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {
  BRAND_COLORS,
  BRAND_TOKENS,
  RADIUS,
  SHADOW,
  STROKE,
  TYPE,
  Z,
  type BrandTone,
} from "./tokens";

export const CornerMarks: React.FC<{color?: string; inset?: number}> = ({
  color = BRAND_COLORS.ink,
  inset = 38,
}) => {
  const size = 22;
  const thickness = 3;
  return (
    <AbsoluteFill style={{pointerEvents: "none", zIndex: Z.chrome}}>
      {[
        {left: inset, top: inset, rotate: "0deg"},
        {right: inset, top: inset, rotate: "90deg"},
        {right: inset, bottom: inset, rotate: "180deg"},
        {left: inset, bottom: inset, rotate: "270deg"},
      ].map((corner, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: size,
            height: size,
            left: corner.left,
            right: corner.right,
            top: corner.top,
            bottom: corner.bottom,
            rotate: corner.rotate,
            borderTop: `${thickness}px solid ${color}`,
            borderLeft: `${thickness}px solid ${color}`,
            opacity: 0.55,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const PackagingBackground: React.FC<{
  tone?: BrandTone;
  index: string;
  label?: string;
  accent?: string;
  children?: ReactNode;
}> = ({tone = "paper", index, label = "VISUAL SYSTEM", accent, children}) => {
  const frame = useCurrentFrame();
  const dark = tone === "ink";
  const signal = tone === "signal";
  const background = signal
    ? BRAND_TOKENS.accent.base
    : dark
      ? BRAND_TOKENS.ink.primary
      : BRAND_TOKENS.bg.base;
  const foreground =
    signal || dark ? BRAND_TOKENS.ink.inverse : BRAND_TOKENS.ink.primary;
  const accentColor =
    accent ?? (dark || signal ? BRAND_TOKENS.signal : BRAND_TOKENS.support.base);
  const gridColor =
    dark || signal ? BRAND_COLORS.gridDark : BRAND_COLORS.grid;
  const driftX = Math.sin(frame / 42) * 18;
  const driftY = Math.cos(frame / 49) * 14;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        color: foreground,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${gridColor} 1.15px, transparent 1.25px)`,
          backgroundSize: "29px 29px",
          opacity: dark ? 0.48 : 0.56,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 44px, rgba(21,21,21,0.035) 44px 45px)",
          opacity: dark || signal ? 0.32 : 0.72,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: -260 + driftX,
          top: -330 + driftY,
          width: 760,
          height: 760,
          borderRadius: "50%",
          backgroundColor: signal
            ? BRAND_TOKENS.signal
            : BRAND_TOKENS.accent.soft,
          opacity: dark || signal ? 0.22 : 0.92,
          filter: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -300 - driftY,
          bottom: -400 - driftX,
          width: 680,
          height: 680,
          borderRadius: "50%",
          backgroundColor: BRAND_TOKENS.support.soft,
          opacity: dark || signal ? 0.16 : 0.84,
          filter: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 670,
          bottom: 90,
          width: 330,
          height: 330,
          borderRadius: "50%",
          backgroundImage: `radial-gradient(${accentColor} 3px, transparent 3.5px)`,
          backgroundSize: "16px 16px",
          opacity: dark || signal ? 0.18 : 0.20,
          rotate: `${frame * 0.08}deg`,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 72,
          bottom: 132,
          fontFamily: '"Arial Narrow", Arial, sans-serif',
          fontSize: 420,
          lineHeight: 0.8,
          fontWeight: 900,
          letterSpacing: -32,
          color: "transparent",
          WebkitTextStroke: `2px ${BRAND_TOKENS.line.subtle}`,
          translate: `${driftX * 0.35}px 0px`,
          zIndex: Z.pattern,
        }}
      >
        {index}
      </div>

      <div
        style={{
          position: "absolute",
          left: 32,
          top: 120,
          writingMode: "vertical-rl",
          fontFamily: '"Arial Narrow", Arial, sans-serif',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 2,
          opacity: 0.38,
          zIndex: Z.chrome,
        }}
      >
        {label}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow:
            dark || signal
              ? "inset 0 0 190px rgba(0,0,0,0.54)"
              : "inset 0 0 160px rgba(64,48,20,0.08)",
          pointerEvents: "none",
          zIndex: Z.pattern,
        }}
      />

      <CornerMarks color={foreground} />
      {children}
    </AbsoluteFill>
  );
};

export const Kicker: React.FC<{
  children: ReactNode;
  background?: string;
  color?: string;
  rotate?: number;
  style?: CSSProperties;
}> = ({
  children,
  background = BRAND_TOKENS.signal,
  color = BRAND_TOKENS.ink.primary,
  rotate = 0,
  style,
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        padding: "10px 15px 9px",
        border: `${STROKE.base}px solid ${BRAND_TOKENS.ink.primary}`,
        borderRadius: RADIUS.sm,
        backgroundColor: background,
        color,
        boxShadow: SHADOW.micro,
        rotate: `${rotate}deg`,
        ...TYPE.label,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Headline: React.FC<{
  children: ReactNode;
  size?: "display" | "h1" | "h2" | "h3";
  style?: CSSProperties;
}> = ({children, size = "h1", style}) => {
  return <div style={{...TYPE[size], ...style}}>{children}</div>;
};

export const PaperCard: React.FC<{
  children: ReactNode;
  tone?: "light" | "dark" | "clear";
  accent?: string;
  style?: CSSProperties;
}> = ({children, tone = "light", accent = BRAND_COLORS.ink, style}) => {
  const dark = tone === "dark";
  return (
    <div
      style={{
        border: `${STROKE.strong}px solid ${
          dark ? BRAND_TOKENS.ink.inverse : BRAND_TOKENS.ink.primary
        }`,
        borderRadius: RADIUS.lg,
        backgroundColor: dark
          ? BRAND_TOKENS.ink.primary
          : tone === "clear"
            ? BRAND_TOKENS.surface.overlay
            : BRAND_TOKENS.surface.raised,
        color: dark ? BRAND_TOKENS.ink.inverse : BRAND_TOKENS.ink.primary,
        boxShadow: `10px 11px 0 ${accent}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Sticker: React.FC<{
  children: ReactNode;
  color?: string;
  rotate?: number;
  style?: CSSProperties;
}> = ({children, color = BRAND_TOKENS.support.base, rotate = -4, style}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        padding: "9px 13px 8px",
        border: `${STROKE.strong}px solid ${BRAND_TOKENS.ink.primary}`,
        borderRadius: RADIUS.sm,
        backgroundColor: color,
        color: BRAND_TOKENS.ink.primary,
        boxShadow: SHADOW.micro,
        rotate: `${rotate}deg`,
        ...TYPE.label,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const EditorialRule: React.FC<{
  label?: string;
  color?: string;
  style?: CSSProperties;
}> = ({label, color = BRAND_COLORS.ink, style}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        ...style,
      }}
    >
      {label ? (
        <div style={{...TYPE.micro, whiteSpace: "nowrap", opacity: 0.56}}>
          {label}
        </div>
      ) : null}
      <div style={{height: 2, flex: 1, backgroundColor: color, opacity: 0.25}} />
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          backgroundColor: color,
          opacity: 0.72,
        }}
      />
    </div>
  );
};

export const TapeStrip: React.FC<{
  width?: number;
  color?: string;
  rotate?: number;
  style?: CSSProperties;
}> = ({
  width = 150,
  color = "rgba(216,255,67,0.72)",
  rotate = -5,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height: 26,
        backgroundColor: color,
        rotate: `${rotate}deg`,
        clipPath: "polygon(4% 9%, 98% 0, 94% 88%, 0 100%)",
        opacity: 0.82,
        ...style,
      }}
    />
  );
};
