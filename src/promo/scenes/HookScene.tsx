import type {FC} from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {Kicker, Sticker} from "../../packaging/primitives";
import {BRAND_COLORS, TYPE} from "../../packaging/tokens";
import {
  MetricStrip,
  PromoScene,
  SceneSubtitle,
  SceneTitle,
} from "../components";
import type {PromoSection} from "../types";

export const HookScene: FC<{section: PromoSection}> = ({section}) => {
  const frame = useCurrentFrame();
  const meter = interpolate(frame, [0, 510], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <PromoScene section={section} accent={BRAND_COLORS.lime}>
      <div
        style={{
          position: "absolute",
          right: 104,
          top: 144,
          fontFamily: '"Arial Narrow", Arial, sans-serif',
          fontSize: 262,
          lineHeight: 0.78,
          fontWeight: 900,
          letterSpacing: -18,
          color: "transparent",
          WebkitTextStroke: "2px rgba(255,255,255,0.18)",
          opacity: 0.9,
        }}
      >
        04:00
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: 1420,
        }}
      >
        <Kicker background={BRAND_COLORS.lime}>PROJECT TOUR / 4 MIN</Kicker>
        <SceneTitle
          section={section}
          fontSize={124}
          style={{marginTop: 20, maxWidth: 1320}}
        />
        <SceneSubtitle
          section={section}
          dark
          size={36}
          delay={20}
          style={{marginTop: 22, maxWidth: 1120}}
        />
        <MetricStrip
          metrics={section.metrics ?? []}
          dark
          startFrame={30}
          style={{marginTop: 42, maxWidth: 1380}}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 86,
          right: 86,
          bottom: 156,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 250,
            height: 10,
            borderRadius: 999,
            background: "rgba(255,255,255,0.16)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: meter * 100 + "%",
              height: "100%",
              background: BRAND_COLORS.lime,
            }}
          />
        </div>
        <div style={{...TYPE.micro, color: "rgba(255,255,255,0.48)"}}>
          CODE / VOICE / CAPTION / MASTER / QC
        </div>
      </div>

      <Sticker
        color={BRAND_COLORS.coral}
        rotate={-5}
        style={{position: "absolute", right: 112, bottom: 178}}
      >
        CODE-DRIVEN VIDEO SYSTEM
      </Sticker>
    </PromoScene>
  );
};
