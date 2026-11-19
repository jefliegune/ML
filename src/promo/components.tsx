import type {CSSProperties, FC, ReactNode} from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {DrawRule, RiseIn} from "../packaging/motionPrimitives";
import {
  EditorialRule,
  PackagingBackground,
  PaperCard,
} from "../packaging/primitives";
import {StyleTexture} from "../packaging/StyleTexture";
import {
  BRAND_COLORS,
  RADIUS,
  SHADOW,
  STROKE,
  TYPE,
} from "../packaging/tokens";
import type {
  PromoItem,
  PromoMetric,
  PromoSection,
  PromoStep,
} from "./types";
import {FONT} from "../theme";

export const isDarkSection = (section: PromoSection) =>
  section.tone === "ink" || section.tone === "signal";

export const PromoScene: FC<{
  section: PromoSection;
  children: ReactNode;
  accent?: string;
  texture?: "grain" | "scanlines" | "paper";
}> = ({section, children, accent, texture = "grain"}) => {
  const dark = isDarkSection(section);
  const foreground = dark ? BRAND_COLORS.white : BRAND_COLORS.ink;

  return (
    <PackagingBackground
      tone={section.tone}
      index={section.index}
      label={section.label}
      accent={accent}
    >
      <AbsoluteFill
        style={{
          padding: "48px 86px 150px",
          color: foreground,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...TYPE.label,
            opacity: dark ? 0.68 : 0.56,
          }}
        >
          <span>ML VIDEO SYSTEM / PROJECT TOUR</span>
          <span>04:00 / {section.label}</span>
        </div>
        <div style={{height: 2, background: foreground, opacity: 0.18, marginTop: 14}} />
        {children}
      </AbsoluteFill>
      <StyleTexture
        variant={texture}
        opacity={texture === "scanlines" ? 0.07 : 0.14}
        color={dark ? BRAND_COLORS.white : BRAND_COLORS.ink}
      />
    </PackagingBackground>
  );
};

export const SceneTitle: FC<{
  section: PromoSection;
  fontSize?: number;
  startFrame?: number;
  style?: CSSProperties;
}> = ({section, fontSize = 104, startFrame = 4, style}) => {
  const dark = isDarkSection(section);
  const tokens = section.title.split("|").filter(Boolean);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        ...style,
      }}
    >
      {tokens.map((token, index) => {
        const last = index === tokens.length - 1;
        return (
          <RiseIn
            key={token}
            delay={startFrame + index * 4}
            distance={24}
            fromScale={1}
            style={{display: "inline-flex", flexDirection: "column", alignItems: "flex-start"}}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize,
                lineHeight: 0.94,
                fontWeight: 900,
                letterSpacing: -fontSize * 0.045,
                color: last
                  ? dark
                    ? BRAND_COLORS.lime
                    : BRAND_COLORS.blue
                  : dark
                    ? BRAND_COLORS.white
                    : BRAND_COLORS.ink,
                whiteSpace: "nowrap",
              }}
            >
              {token}
            </span>
            {last ? (
              <DrawRule
                delay={startFrame + index * 4 + 4}
                color={dark ? BRAND_COLORS.lime : BRAND_COLORS.coral}
                style={{
                  height: Math.max(6, fontSize * 0.075),
                  width: "100%",
                  marginTop: 6,
                  borderRadius: 999,
                  opacity: 0.96,
                }}
              />
            ) : null}
          </RiseIn>
        );
      })}
    </div>
  );
};

export const SceneSubtitle: FC<{
  section: PromoSection;
  dark?: boolean;
  delay?: number;
  size?: number;
  style?: CSSProperties;
}> = ({section, dark = false, delay = 18, size = 32, style}) => {
  return (
    <RiseIn delay={delay} distance={28}>
      <div
        style={{
          ...TYPE.body,
          fontSize: size,
          lineHeight: 1.35,
          maxWidth: 1280,
          color: dark ? "rgba(255,255,255,0.78)" : BRAND_COLORS.muted,
          ...style,
        }}
      >
        {section.subtitle}
      </div>
    </RiseIn>
  );
};

export const MetricCard: FC<{
  metric: PromoMetric;
  dark?: boolean;
  index?: number;
  compact?: boolean;
  style?: CSSProperties;
}> = ({metric, dark = false, index = 0, compact = false, style}) => {
  return (
    <PaperCard
      tone={dark ? "dark" : "light"}
      accent={index % 2 === 0 ? BRAND_COLORS.lime : BRAND_COLORS.blue}
      style={{
        padding: compact ? "12px 20px 11px" : "22px 24px 20px",
        minHeight: compact ? 94 : 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...style,
      }}
    >
      <div style={{...TYPE.display, fontSize: compact ? 46 : 66, letterSpacing: -3}}>
        {metric.value}
      </div>
      <div
        style={{
          ...TYPE.label,
          color: dark ? "rgba(255,255,255,0.62)" : BRAND_COLORS.muted,
        }}
      >
        {metric.label}
      </div>
    </PaperCard>
  );
};

export const MetricStrip: FC<{
  metrics: PromoMetric[];
  dark?: boolean;
  startFrame?: number;
  compact?: boolean;
  style?: CSSProperties;
}> = ({metrics, dark = false, startFrame = 20, compact = false, style}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(" + metrics.length + ", minmax(0, 1fr))",
        gap: 16,
        ...style,
      }}
    >
      {metrics.map((metric, index) => (
        <RiseIn key={metric.label} delay={startFrame + index * 5} distance={30}>
          <MetricCard metric={metric} dark={dark} index={index} compact={compact} />
        </RiseIn>
      ))}
    </div>
  );
};

export const FeatureCard: FC<{
  item: PromoItem;
  dark?: boolean;
  index: number;
  style?: CSSProperties;
}> = ({item, dark = false, index, style}) => {
  return (
    <PaperCard
      tone={dark ? "dark" : "light"}
      accent={index % 2 === 0 ? BRAND_COLORS.coral : BRAND_COLORS.cyan}
      style={{
        padding: "20px 22px",
        minHeight: 214,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...style,
      }}
    >
      <div>
        <div
          style={{
            ...TYPE.micro,
            color: dark ? BRAND_COLORS.lime : BRAND_COLORS.coral,
          }}
        >
          {item.label}
        </div>
        <div style={{...TYPE.h3, fontSize: 31, marginTop: 12}}>{item.title}</div>
      </div>
      <div
        style={{
          ...TYPE.small,
          color: dark ? "rgba(255,255,255,0.68)" : BRAND_COLORS.muted,
          marginTop: 10,
        }}
      >
        {item.body}
        {item.value ? (
          <span
            style={{
              display: "block",
              marginTop: 10,
              ...TYPE.micro,
              color: dark ? BRAND_COLORS.lime : BRAND_COLORS.blue,
            }}
          >
            {item.value}
          </span>
        ) : null}
      </div>
    </PaperCard>
  );
};

export const FeatureGrid: FC<{
  items: PromoItem[];
  dark?: boolean;
  columns?: number;
  startFrame?: number;
  style?: CSSProperties;
}> = ({items, dark = false, columns = 2, startFrame = 12, style}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(" + columns + ", minmax(0, 1fr))",
        gap: 16,
        ...style,
      }}
    >
      {items.map((item, index) => (
        <RiseIn key={item.title} delay={startFrame + index * 6} distance={34}>
          <FeatureCard item={item} dark={dark} index={index} />
        </RiseIn>
      ))}
    </div>
  );
};

export const SourceCard: FC<{
  item: PromoItem;
  index: number;
  active?: boolean;
}> = ({item, index, active = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - 8 - index * 9,
    fps,
    config: {damping: 16, stiffness: 120, mass: 0.8},
    durationInFrames: 26,
  });

  return (
    <div
      style={{
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) * (active ? 1 : 0.72),
        translate: "0px " + interpolate(enter, [0, 1], [40, 0]) + "px",
        scale: active ? 1 : 0.985,
      }}
    >
      <PaperCard
        accent={[BRAND_COLORS.blue, BRAND_COLORS.coral, BRAND_COLORS.cyan][index]}
        style={{
          padding: "24px 24px 20px",
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div style={{...TYPE.micro, color: BRAND_COLORS.coral}}>{item.label}</div>
            <div
              style={{
                ...TYPE.micro,
                border: "1.5px solid " + BRAND_COLORS.ink,
                borderRadius: RADIUS.pill,
                padding: "4px 7px",
              }}
            >
              MIT
            </div>
          </div>
          <div style={{...TYPE.h3, fontSize: 38, marginTop: 16, lineHeight: 1.05}}>
            {item.title}
          </div>
          <div style={{...TYPE.small, color: BRAND_COLORS.muted, marginTop: 12}}>
            {item.body}
          </div>
        </div>
        <div>
          <EditorialRule label={item.value?.toUpperCase()} />
        </div>
      </PaperCard>
    </div>
  );
};

export const BrowserFrame: FC<{
  label: string;
  children: ReactNode;
  dark?: boolean;
  style?: CSSProperties;
}> = ({label, children, dark = false, style}) => {
  return (
    <div
      style={{
        border: STROKE.strong + "px solid " + (dark ? BRAND_COLORS.white : BRAND_COLORS.ink),
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        background: BRAND_COLORS.paper,
        boxShadow: "12px 13px 0 " + (dark ? BRAND_COLORS.lime : BRAND_COLORS.ink),
        ...style,
      }}
    >
      <div
        style={{
          height: 42,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          borderBottom: "2px solid " + BRAND_COLORS.ink,
          background: BRAND_COLORS.cream,
        }}
      >
        {[BRAND_COLORS.coral, BRAND_COLORS.lime, BRAND_COLORS.cyan].map((color) => (
          <span
            key={color}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: color,
              border: "1.5px solid " + BRAND_COLORS.ink,
            }}
          />
        ))}
        <span
          style={{
            ...TYPE.micro,
            color: BRAND_COLORS.ink,
            marginLeft: 8,
            opacity: 0.6,
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
};

export const CommandLine: FC<{
  command: string;
  note: string;
  delay: number;
  index: number;
}> = ({command, note, delay, index}) => {
  const frame = useCurrentFrame();
  const visible = interpolate(frame, [delay, delay + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const typed = Math.max(
    0,
    Math.min(command.length, Math.floor((frame - delay) / 1.15)),
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr 220px",
        gap: 12,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        opacity: visible,
        translate: "0px " + interpolate(visible, [0, 1], [12, 0]) + "px",
      }}
    >
      <span style={{...TYPE.micro, color: BRAND_COLORS.lime}}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: '"Consolas", "Cascadia Mono", monospace',
          fontSize: 21,
          color: BRAND_COLORS.white,
          fontWeight: 700,
          whiteSpace: "pre",
        }}
      >
        <span style={{color: BRAND_COLORS.lime}}>$ </span>
        {command.slice(0, typed)}
        {typed < command.length ? (
          <span style={{color: BRAND_COLORS.lime}}>▌</span>
        ) : null}
      </span>
      <span style={{...TYPE.micro, color: "rgba(255,255,255,0.46)", textAlign: "right"}}>
        {note}
      </span>
    </div>
  );
};

export const Pipeline: FC<{
  steps: PromoStep[];
  dark?: boolean;
  startFrame?: number;
}> = ({steps, dark = false, startFrame = 14}) => {
  return (
    <div style={{position: "relative", display: "flex", alignItems: "stretch", gap: 0}}>
      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          top: 35,
          height: 2,
          background: dark ? "rgba(255,255,255,0.2)" : "rgba(21,21,21,0.16)",
        }}
      />
      {steps.map((step, index) => (
        <RiseIn
          key={step.label}
          delay={startFrame + index * 5}
          distance={20}
          style={{flex: 1, position: "relative"}}
        >
          <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: index === steps.length - 1 ? BRAND_COLORS.lime : BRAND_COLORS.paper,
                color: BRAND_COLORS.ink,
                border: "3px solid " + BRAND_COLORS.ink,
                boxShadow: SHADOW.micro,
                ...TYPE.h3,
                fontSize: 25,
              }}
            >
              {index + 1}
            </div>
            <div style={{...TYPE.h3, fontSize: 20, marginTop: 12, textAlign: "center"}}>
              {step.label}
            </div>
            <div
              style={{
                ...TYPE.micro,
                marginTop: 5,
                color: dark ? "rgba(255,255,255,0.48)" : BRAND_COLORS.muted,
                textAlign: "center",
              }}
            >
              {step.note}
            </div>
          </div>
        </RiseIn>
      ))}
    </div>
  );
};

export const TimelineCard: FC<{style?: CSSProperties}> = ({style}) => {
  const frame = useCurrentFrame();
  const progress = (Math.sin(frame / 45) + 1) / 2;
  const lanes = [
    {label: "VOICE", color: BRAND_COLORS.lime, offset: 12, width: 48},
    {label: "CAPTION", color: BRAND_COLORS.cyan, offset: 16, width: 62},
    {label: "BGM", color: BRAND_COLORS.blue, offset: 4, width: 86},
    {label: "SFX", color: BRAND_COLORS.coral, offset: 28, width: 18},
  ];

  return (
    <PaperCard
      tone="dark"
      accent={BRAND_COLORS.lime}
      style={{padding: "22px 24px", ...style}}
    >
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{...TYPE.label, color: BRAND_COLORS.lime}}>ONE TIMELINE</div>
        <div style={{...TYPE.micro, color: "rgba(255,255,255,0.46)"}}>30 FPS</div>
      </div>
      <div style={{position: "relative", marginTop: 18}}>
        {lanes.map((lane, index) => (
          <div
            key={lane.label}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 14,
              alignItems: "center",
              marginBottom: 11,
            }}
          >
            <div style={{...TYPE.micro, color: "rgba(255,255,255,0.56)"}}>
              {lane.label}
            </div>
            <div
              style={{
                position: "relative",
                height: 12,
                borderRadius: RADIUS.pill,
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: lane.offset + "%",
                  width: lane.width + "%",
                  height: "100%",
                  borderRadius: RADIUS.pill,
                  background: lane.color,
                  opacity: index === 3 ? 0.86 : 0.96,
                }}
              />
            </div>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: "calc(100px + 14px + " + progress * 74 + "%)",
            top: -4,
            bottom: -2,
            width: 3,
            background: BRAND_COLORS.white,
            boxShadow: "0 0 14px rgba(255,255,255,0.7)",
          }}
        />
      </div>
      <div style={{...TYPE.micro, color: "rgba(255,255,255,0.42)", marginTop: 14}}>
        CAPTION / BGM DUCKING / SFX SHARE THE SAME FRAME
      </div>
    </PaperCard>
  );
};

export const Callout: FC<{
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}> = ({children, color = BRAND_COLORS.lime, style}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 12px",
        border: "2px solid " + BRAND_COLORS.ink,
        borderRadius: RADIUS.pill,
        background: color,
        color: BRAND_COLORS.ink,
        boxShadow: SHADOW.micro,
        ...TYPE.label,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const PromoFooter: FC<{left: string; right: string; dark?: boolean}> = ({
  left,
  right,
  dark = false,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 86,
        right: 86,
        bottom: 136,
        display: "flex",
        justifyContent: "space-between",
        ...TYPE.micro,
        color: dark ? "rgba(255,255,255,0.42)" : "rgba(21,21,21,0.48)",
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
};
