import type {FC} from "react";
import {RiseIn} from "../../packaging/motionPrimitives";
import {Kicker, PaperCard} from "../../packaging/primitives";
import {ImpactStamp} from "../../packaging/transitions";
import {BRAND_COLORS, RADIUS, TYPE} from "../../packaging/tokens";
import {PromoScene, SceneSubtitle, SceneTitle} from "../components";
import type {PromoSection} from "../types";

const ACCENTS = [BRAND_COLORS.coral, BRAND_COLORS.blue, BRAND_COLORS.lime];

export const ProblemScene: FC<{section: PromoSection}> = ({section}) => {
  return (
    <PromoScene section={section} accent={BRAND_COLORS.coral}>
      <div style={{marginTop: 26}}>
        <Kicker background={BRAND_COLORS.coral}>THE REPEAT TAX</Kicker>
        <SceneTitle section={section} fontSize={92} style={{marginTop: 16}} />
        <SceneSubtitle section={section} delay={20} size={30} style={{marginTop: 16}} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 18,
          marginTop: 34,
        }}
      >
        {(section.items ?? []).map((item, index) => (
          <RiseIn key={item.title} delay={12 + index * 7} distance={38}>
            <PaperCard
              accent={ACCENTS[index % ACCENTS.length]}
              style={{
                minHeight: 278,
                padding: "22px 24px 20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  ...TYPE.micro,
                  color: BRAND_COLORS.coral,
                }}
              >
                {item.label}
              </div>
              <div style={{...TYPE.h2, fontSize: 56, marginTop: 18}}>
                {item.title}
              </div>
              <div
                style={{
                  ...TYPE.body,
                  fontSize: 24,
                  color: BRAND_COLORS.muted,
                  marginTop: 18,
                  maxWidth: 390,
                }}
              >
                {item.body}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: -22,
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  border: "5px solid rgba(255,91,72,0.34)",
                  display: "grid",
                  placeItems: "center",
                  color: BRAND_COLORS.coral,
                  fontFamily: '"Arial Narrow", Arial, sans-serif',
                  fontSize: 58,
                  fontWeight: 900,
                  opacity: 0.7,
                }}
              >
                ×
              </div>
            </PaperCard>
          </RiseIn>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 86,
          right: 86,
          bottom: 174,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 4,
            background:
              "repeating-linear-gradient(90deg, " +
              BRAND_COLORS.ink +
              " 0 18px, transparent 18px 28px)",
            opacity: 0.22,
          }}
        />
        <div
          style={{
            padding: "10px 15px",
            border: "2px solid " + BRAND_COLORS.ink,
            borderRadius: RADIUS.pill,
            background: BRAND_COLORS.paper,
            ...TYPE.label,
          }}
        >
          4× RE-EXPORT / 0× REUSE
        </div>
      </div>

      <ImpactStamp
        delay={28}
        color={BRAND_COLORS.coral}
        style={{position: "absolute", right: 124, top: 136}}
      >
        重复劳动
      </ImpactStamp>
    </PromoScene>
  );
};
