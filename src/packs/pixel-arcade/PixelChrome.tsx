import type {CSSProperties, FC, ReactNode} from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {PIXEL_ARCADE as C, PIXEL_MONO} from "./tokens";

export const PixelPanel: FC<{
  children: ReactNode;
  style?: CSSProperties;
  accent?: string;
  shadow?: string;
}> = ({children, style, accent = C.cream, shadow = C.ink}) => (
  <div
    style={{
      position: "relative",
      backgroundColor: C.panel,
      border: `4px solid ${accent}`,
      boxShadow: `8px 8px 0 ${shadow}, inset 0 0 0 3px ${C.bg2}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const PixelBrandMark: FC = () => (
  <svg width={46} height={46} viewBox="0 0 8 8" shapeRendering="crispEdges">
    <rect x={0} y={0} width={8} height={8} fill={C.yellow} />
    <rect x={2} y={1} width={1} height={6} fill={C.ink} />
    <rect x={3} y={2} width={1} height={4} fill={C.ink} />
    <rect x={4} y={3} width={1} height={2} fill={C.ink} />
    <rect x={6} y={0} width={1} height={1} fill={C.coral} />
    <rect x={7} y={1} width={1} height={1} fill={C.mint} />
  </svg>
);

export const PixelSpeechBars: FC<{color: string}> = ({color}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: "flex", alignItems: "flex-end", gap: 3, height: 18}}>
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            width: 4,
            height: 5 + 12 * Math.abs(Math.sin(frame / 4.2 + index * 1.4)),
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};

export const PixelPhaseHud: FC<{
  chapters: string[];
  active: number;
}> = ({chapters, active}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: 35,
      translate: "-50% 0px",
      display: "flex",
      gap: 10,
    }}
  >
    {chapters.map((label, index) => {
      const on = index === active;
      return (
        <div
          key={`${label}-${index}`}
          style={{
            height: 38,
            minWidth: 112,
            padding: "0 13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${on ? C.yellow : "#FFFFFF24"}`,
            backgroundColor: on ? C.yellow : "rgba(13,16,32,0.72)",
            color: on ? C.ink : C.muted,
            fontFamily: PIXEL_MONO,
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 1,
            boxShadow: on ? `4px 4px 0 ${C.ink}` : "none",
          }}
        >
          {label}
        </div>
      );
    })}
  </div>
);

export const PixelHud: FC<{
  brand?: string;
  subtitle?: string;
  chapters: string[];
  chapterStarts: number[];
  totalFrames: number;
}> = ({
  brand = "CODE / VIDEO SYSTEM",
  subtitle = "PROJECT TUTORIAL · 10S PREVIEW",
  chapters,
  chapterStarts,
  totalFrames,
}) => {
  const frame = useCurrentFrame();
  const active = chapterStarts.reduce(
    (result, start, index) => (frame >= start ? index : result),
    0,
  );
  const totalSeconds = totalFrames / 30;
  const seconds = Math.min(totalSeconds, frame / 30);

  return (
    <div style={{position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30}}>
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <PixelBrandMark />
          <div>
            <div
              style={{
                fontFamily: PIXEL_MONO,
                color: C.cream,
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: 2.4,
                lineHeight: 1.2,
              }}
            >
              {brand}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: PIXEL_MONO,
                color: C.mint,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2.1,
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div style={{display: "flex", alignItems: "center", gap: 16}}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: PIXEL_MONO,
              color: C.coral,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.8,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                backgroundColor: C.coral,
                opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0.25,
              }}
            />
            REC
          </div>
          <div
            style={{
              padding: "8px 11px",
              border: `2px solid ${C.cream}44`,
              color: C.cream,
              fontFamily: PIXEL_MONO,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 1.6,
            }}
          >
            00:{seconds.toFixed(1).padStart(4, "0")} / 00:{totalSeconds.toFixed(1)}
          </div>
        </div>
      </div>

      <PixelPhaseHud chapters={chapters} active={active} />

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 104,
          height: 4,
          backgroundColor: "#FFFFFF18",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, (frame / totalFrames) * 100)}%`,
            height: "100%",
            backgroundColor: C.yellow,
            boxShadow: `0 0 0 1px ${C.ink}`,
          }}
        />
      </div>
    </div>
  );
};

export const PixelStage: FC<{
  children: ReactNode;
  indexText?: string;
}> = ({children, indexText = "03"}) => {
  const frame = useCurrentFrame();
  const stars = Array.from({length: 44}, (_, index) => ({
    x: (index * 149 + 83) % 1920,
    y: (index * 271 + 47) % 1080,
    size: index % 5 === 0 ? 8 : index % 3 === 0 ? 6 : 4,
    speed: 0.18 + (index % 7) * 0.07,
    color: [C.mint, C.yellow, C.blue, C.cream][index % 4],
    phase: index * 0.71,
  }));

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${C.bg} 0%, ${C.bg2} 58%, #10162A 100%)`,
        color: C.cream,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.cream}10 2px, transparent 2px), linear-gradient(90deg, ${C.cream}10 2px, transparent 2px)`,
          backgroundSize: "32px 32px",
          opacity: 0.45,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.24) 0px, rgba(0,0,0,0.24) 2px, transparent 2px, transparent 6px)",
          opacity: 0.28,
          mixBlendMode: "multiply",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 600,
          height: 120,
          left: -120,
          top: 170,
          backgroundColor: C.blue,
          opacity: 0.055,
          translate: `${Math.sin(frame / 52) * 28}px 0px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          right: -130,
          top: 230,
          backgroundColor: C.mint,
          opacity: 0.045,
          translate: `0px ${Math.cos(frame / 47) * 24}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          left: 720,
          bottom: -170,
          backgroundColor: C.yellow,
          opacity: 0.04,
          rotate: `${45 + Math.sin(frame / 60) * 3}deg`,
        }}
      />

      {stars.map((star, index) => {
        const y = (star.y + frame * star.speed) % 1080;
        const alpha = 0.14 + 0.22 * (0.5 + 0.5 * Math.sin(frame / 15 + star.phase));
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: star.x,
              top: y,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              opacity: alpha,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          right: 100,
          bottom: 112,
          fontFamily: PIXEL_MONO,
          fontSize: 470,
          fontWeight: 900,
          lineHeight: 0.72,
          letterSpacing: -40,
          color: "transparent",
          WebkitTextStroke: `2px ${C.cream}0F`,
          opacity: 0.75,
          translate: `${Math.sin(frame / 50) * 9}px 0px`,
        }}
      >
        {indexText}
      </div>

      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 220px rgba(0,0,0,0.78)",
          pointerEvents: "none",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const PixelGlitch: FC<{
  windows: Array<[number, number]>;
}> = ({windows}) => {
  const frame = useCurrentFrame();
  const current = windows.find(([from, to]) => frame >= from && frame <= to);
  if (!current) return null;
  const local = frame - current[0];
  const intensity = Math.max(0, 1 - Math.abs(local - 4) / 5);
  return (
    <AbsoluteFill style={{pointerEvents: "none", opacity: intensity, zIndex: 25}}>
      {Array.from({length: 12}, (_, index) => {
        const y = (index * 97 + frame * 13) % 1080;
        const width = 260 + ((index * 173 + frame * 29) % 980);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: (index * 211 + frame * 37) % 1820,
              top: y,
              width,
              height: index % 3 === 0 ? 8 : 3,
              backgroundColor: [C.mint, C.yellow, C.blue, C.coral, C.cream][index % 5],
              opacity: 0.45,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.cream,
          opacity: intensity * 0.08,
        }}
      />
    </AbsoluteFill>
  );
};
