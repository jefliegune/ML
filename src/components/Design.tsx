import type {CSSProperties, ReactNode} from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {COLORS, FONT, MONO} from "../theme";

type Tone = "light" | "dark";

export const SceneBackground: React.FC<{
  tone?: Tone;
  index: string;
  children?: ReactNode;
}> = ({tone = "light", index, children}) => {
  const frame = useCurrentFrame();
  const dark = tone === "dark";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: dark ? COLORS.ink : COLORS.cream,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: dark
            ? "radial-gradient(rgba(255,255,255,0.16) 1.1px, transparent 1.2px)"
            : "radial-gradient(rgba(21,21,21,0.14) 1.1px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          opacity: dark ? 0.55 : 0.52,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: dark
            ? "repeating-linear-gradient(90deg, transparent 0 119px, rgba(255,255,255,0.055) 119px 120px)"
            : "repeating-linear-gradient(135deg, transparent 0 42px, rgba(21,21,21,0.032) 42px 43px)",
          opacity: dark ? 1 : 0.7,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          right: -330,
          top: -390,
          background: dark ? COLORS.blue : COLORS.blue,
          opacity: dark ? 0.38 : 0.94,
          filter: dark ? "blur(72px)" : "none",
          translate: `${Math.sin(frame / 34) * 18}px ${Math.cos(frame / 41) * 16}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 640,
          height: 640,
          borderRadius: "50%",
          left: -340,
          bottom: -430,
          background: COLORS.lime,
          opacity: dark ? 0.16 : 0.93,
          filter: dark ? "blur(80px)" : "none",
          translate: `${Math.cos(frame / 37) * 22}px ${Math.sin(frame / 31) * 14}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: "50%",
          left: 770,
          bottom: 112,
          background: COLORS.coral,
          opacity: dark ? 0.18 : 0.26,
          filter: "blur(6px)",
          translate: `${Math.sin(frame / 24) * 12}px ${Math.cos(frame / 28) * 10}px`,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 76,
          bottom: 150,
          fontFamily: MONO,
          fontSize: 410,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: -30,
          color: "transparent",
          WebkitTextStroke: dark
            ? "2px rgba(255,255,255,0.11)"
            : "2px rgba(21,21,21,0.1)",
          translate: `${Math.sin(frame / 55) * 8}px 0px`,
        }}
      >
        {index}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: dark
            ? "inset 0 0 180px rgba(0,0,0,0.58)"
            : "inset 0 0 150px rgba(64,48,20,0.08)",
          pointerEvents: "none",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const TopBar: React.FC<{
  chapter: string;
  label: string;
  dark?: boolean;
}> = ({chapter, label, dark = false}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 47,
        left: 86,
        right: 86,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: FONT,
        color: dark ? COLORS.white : COLORS.ink,
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 20}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: dark ? COLORS.lime : COLORS.ink,
            color: dark ? COLORS.ink : COLORS.lime,
            padding: "10px 17px 9px",
            borderRadius: 999,
            fontSize: 18,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: 1.2,
          }}
        >
          <span>ML</span>
          <span style={{opacity: 0.55}}>/</span>
          <span>{chapter}</span>
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 2.3,
            opacity: 0.72,
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: MONO,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: 2.1,
          opacity: 0.74,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 99,
            backgroundColor: COLORS.coral,
            boxShadow: `0 0 0 5px ${COLORS.coral}22`,
          }}
        />
        2 MIN EXPLAINER
      </div>
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: dark ? COLORS.white : COLORS.ink,
          opacity: 0.14,
        }}
      />
    </div>
  );
};

export const SoundBars: React.FC<{color?: string}> = ({color = COLORS.lime}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: "flex", alignItems: "center", gap: 4, height: 26}}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: 4,
            height: 8 + Math.abs(Math.sin(frame / 2.3 + index * 1.7)) * 16,
            borderRadius: 9,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};

export type CaptionSegment = {text: string; color?: string; weight?: number};

export const CaptionBar: React.FC<{
  segments: CaptionSegment[];
  tone?: Tone;
}> = ({segments, tone = "light"}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 160, mass: 0.7},
    durationInFrames: 18,
  });
  const dark = tone === "dark";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 46,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          minHeight: 78,
          padding: "11px 27px 13px 20px",
          borderRadius: 18,
          border: dark
            ? "2px solid rgba(255,255,255,0.24)"
            : "2px solid rgba(255,255,255,0.13)",
          backgroundColor: dark ? "rgba(8,8,8,0.91)" : "rgba(21,21,21,0.91)",
          boxShadow: "0 12px 38px rgba(0,0,0,0.24)",
          color: COLORS.white,
          fontFamily: FONT,
          fontSize: 39,
          lineHeight: 1.22,
          fontWeight: 600,
          letterSpacing: 0.5,
          whiteSpace: "pre",
          opacity: interpolate(enter, [0, 1], [0, 1]),
          translate: `0px ${interpolate(enter, [0, 1], [18, 0])}px`,
          scale: interpolate(enter, [0, 1], [0.96, 1], {
            output: "perceptual-scale",
          }),
        }}
      >
        <SoundBars color={COLORS.lime} />
        <div>
          {segments.map((segment, index) => (
            <span
              key={index}
              style={{
                color: segment.color ?? COLORS.white,
                fontWeight: segment.weight ?? 600,
              }}
            >
              {segment.text}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CatPortrait: React.FC<{
  size?: number;
  color?: string;
  variant?: number;
  style?: CSSProperties;
}> = ({size = 220, color = COLORS.coral, variant = 0, style}) => {
  const eyesClosed = variant === 2;
  const wink = variant === 3;

  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      style={{overflow: "visible", ...style}}
    >
      <path
        d="M57 101 L77 29 L128 68 Q150 58 172 68 L223 29 L243 101 Q260 139 250 184 Q236 258 150 267 Q64 258 50 184 Q40 139 57 101 Z"
        fill={color}
        stroke={COLORS.ink}
        strokeWidth={11}
        strokeLinejoin="round"
      />
      {variant === 1 ? (
        <>
          <path
            d="M150 70 L150 108 M130 82 L136 112 M170 82 L164 112"
            stroke={COLORS.ink}
            strokeWidth={8}
            strokeLinecap="round"
            opacity={0.34}
          />
          <path
            d="M78 142 L105 149 M222 142 L195 149"
            stroke={COLORS.ink}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.28}
          />
        </>
      ) : null}
      {variant === 3 ? (
        <>
          <path
            d="M150 67 L150 104 M127 75 L132 107 M173 75 L168 107"
            stroke={COLORS.ink}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.26}
          />
          <path
            d="M66 181 L101 177 M199 177 L234 181"
            stroke={COLORS.ink}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.2}
          />
        </>
      ) : null}

      {eyesClosed ? (
        <>
          <path
            d="M85 160 Q108 143 132 160"
            fill="none"
            stroke={COLORS.ink}
            strokeWidth={10}
            strokeLinecap="round"
          />
          <path
            d="M168 160 Q192 143 215 160"
            fill="none"
            stroke={COLORS.ink}
            strokeWidth={10}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <ellipse cx={108} cy={158} rx={17} ry={23} fill={COLORS.ink} />
          <ellipse cx={192} cy={158} rx={17} ry={23} fill={COLORS.ink} />
          <circle cx={114} cy={151} r={5.5} fill={COLORS.white} />
          <circle cx={198} cy={151} r={5.5} fill={COLORS.white} />
          {wink ? (
            <path
              d="M168 160 Q192 143 215 160"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={10}
              strokeLinecap="round"
            />
          ) : null}
        </>
      )}

      <path
        d="M141 193 Q150 184 159 193 Q156 207 150 209 Q144 207 141 193 Z"
        fill={COLORS.ink}
      />
      <path
        d="M134 221 Q150 236 166 221"
        fill="none"
        stroke={COLORS.ink}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path
        d="M132 207 L80 197 M132 216 L77 220 M168 207 L220 197 M168 216 L223 220"
        stroke={COLORS.ink}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <circle cx={77} cy={188} r={11} fill={COLORS.coral} opacity={0.55} />
      <circle cx={223} cy={188} r={11} fill={COLORS.coral} opacity={0.55} />
    </svg>
  );
};

export const DogPortrait: React.FC<{
  size?: number;
  color?: string;
  style?: CSSProperties;
}> = ({size = 220, color = "#B98A62", style}) => {
  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      style={{overflow: "visible", ...style}}
    >
      <ellipse
        cx={68}
        cy={123}
        rx={38}
        ry={68}
        fill={color}
        stroke={COLORS.ink}
        strokeWidth={11}
        transform="rotate(18 68 123)"
      />
      <ellipse
        cx={232}
        cy={123}
        rx={38}
        ry={68}
        fill={color}
        stroke={COLORS.ink}
        strokeWidth={11}
        transform="rotate(-18 232 123)"
      />
      <path
        d="M76 102 Q84 52 150 48 Q216 52 224 102 Q238 153 226 197 Q211 258 150 264 Q89 258 74 197 Q62 153 76 102 Z"
        fill={color}
        stroke={COLORS.ink}
        strokeWidth={11}
        strokeLinejoin="round"
      />
      <ellipse cx={109} cy={153} rx={12} ry={16} fill={COLORS.ink} />
      <ellipse cx={191} cy={153} rx={12} ry={16} fill={COLORS.ink} />
      <circle cx={113} cy={148} r={4} fill={COLORS.white} />
      <circle cx={195} cy={148} r={4} fill={COLORS.white} />
      <ellipse cx={150} cy={195} rx={30} ry={23} fill={COLORS.paper} />
      <ellipse cx={150} cy={190} rx={17} ry={11} fill={COLORS.ink} />
      <path
        d="M150 202 L150 220 M150 220 Q136 235 122 224 M150 220 Q164 235 178 224"
        fill="none"
        stroke={COLORS.ink}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path
        d="M130 184 Q150 194 170 184"
        fill="none"
        stroke={COLORS.ink}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.4}
      />
    </svg>
  );
};

export const Burst: React.FC<{
  size?: number;
  color?: string;
  rotate?: number;
  style?: CSSProperties;
}> = ({size = 480, color = COLORS.lime, rotate = 0, style}) => {
  const points = Array.from({length: 32}, (_, index) => {
    const angle = (Math.PI * 2 * index) / 32;
    const radius = index % 2 === 0 ? 48 : 34;
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{rotate: `${rotate}deg`, overflow: "visible", ...style}}
    >
      <polygon points={points} fill={color} />
    </svg>
  );
};

export const MonoTag: React.FC<{
  children: ReactNode;
  color?: string;
  background?: string;
  style?: CSSProperties;
}> = ({children, color = COLORS.ink, background = COLORS.lime, style}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        width: "fit-content",
        padding: "9px 14px 8px",
        borderRadius: 9,
        border: `2px solid ${COLORS.ink}`,
        background,
        color,
        fontFamily: MONO,
        fontSize: 17,
        fontWeight: 800,
        letterSpacing: 1.5,
        lineHeight: 1,
        boxShadow: `4px 4px 0 ${COLORS.ink}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const EaseInText: React.FC<{
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: CSSProperties;
}> = ({children, delay = 0, distance = 46, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 19, stiffness: 120, mass: 0.85},
    durationInFrames: 26,
  });

  return (
    <div
      style={{
        opacity: interpolate(progress, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: `0px ${interpolate(progress, [0, 1], [distance, 0])}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
