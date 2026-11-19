import type {FC} from "react";
import {RiseIn} from "../../packaging/motionPrimitives";
import {Kicker, PaperCard, Sticker} from "../../packaging/primitives";
import {ImpactStamp} from "../../packaging/transitions";
import {BRAND_COLORS, RADIUS, TYPE} from "../../packaging/tokens";
import {
  MetricStrip,
  PromoScene,
  SceneSubtitle,
  SceneTitle,
} from "../components";
import type {PromoSection} from "../types";

export const OutroScene: FC<{section: PromoSection}> = ({section}) => {
  return (
    <PromoScene section={section} accent={BRAND_COLORS.lime}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: 1480,
        }}
      >
        <Kicker background={BRAND_COLORS.lime}>OPEN SOURCE / MIT</Kicker>
        <SceneTitle section={section} fontSize={122} style={{marginTop: 20}} />
        <SceneSubtitle
          section={section}
          dark
          delay={18}
          size={36}
          style={{marginTop: 18, maxWidth: 1120}}
        />
        <MetricStrip
          metrics={section.metrics ?? []}
          dark
          startFrame={24}
          style={{marginTop: 32, maxWidth: 980}}
        />

        <RiseIn delay={40} distance={28} style={{marginTop: 26}}>
          <PaperCard
            accent={BRAND_COLORS.coral}
            style={{
              width: 700,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{...TYPE.label, color: BRAND_COLORS.ink}}>FORK / STAR / BUILD</div>
            <div
              style={{
                ...TYPE.small,
                color: BRAND_COLORS.ink,
                background: BRAND_COLORS.lime,
                borderRadius: RADIUS.pill,
                padding: "7px 12px",
                fontWeight: 900,
              }}
            >
              {section.cta ?? "github.com/jefliegune/ML"}
            </div>
          </PaperCard>
        </RiseIn>
      </div>

      <ImpactStamp
        delay={30}
        color={BRAND_COLORS.lime}
        rotate={7}
        style={{position: "absolute", right: 128, top: 178}}
      >
        MIT
      </ImpactStamp>

      <Sticker
        color={BRAND_COLORS.coral}
        rotate={-4}
        style={{position: "absolute", right: 120, bottom: 176}}
      >
        NEXT VIDEO STARTS HERE
      </Sticker>
    </PromoScene>
  );
};
