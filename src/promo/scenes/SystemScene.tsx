import type {FC} from "react";
import {Kicker} from "../../packaging/primitives";
import {RiseIn} from "../../packaging/motionPrimitives";
import {BRAND_COLORS, TYPE} from "../../packaging/tokens";
import {
  FeatureCard,
  Pipeline,
  PromoScene,
  SceneSubtitle,
  SceneTitle,
} from "../components";
import type {PromoSection} from "../types";

export const SystemScene: FC<{section: PromoSection}> = ({section}) => {
  return (
    <PromoScene section={section} accent={BRAND_COLORS.lime} texture="scanlines">
      <div style={{marginTop: 18}}>
        <Kicker background={BRAND_COLORS.blue} color={BRAND_COLORS.white}>
          THREE LAYERS / ONE PIPELINE
        </Kicker>
        <SceneTitle section={section} fontSize={88} style={{marginTop: 16}} />
        <SceneSubtitle section={section} dark delay={20} size={28} style={{marginTop: 14}} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          marginTop: 28,
        }}
      >
        {(section.items ?? []).map((item, index) => (
          <RiseIn key={item.title} delay={12 + index * 7} distance={34}>
            <FeatureCard item={item} dark index={index} />
          </RiseIn>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 86,
          right: 86,
          bottom: 172,
          padding: "26px 30px 22px",
          border: "2px solid rgba(255,255,255,0.2)",
          borderRadius: 22,
          background: "rgba(255,255,255,0.035)",
        }}
      >
        <div style={{...TYPE.micro, color: BRAND_COLORS.lime, marginBottom: 18}}>
          SCRIPT → VOICE → TIMELINE → SCENE → MASTER → QC
        </div>
        <Pipeline steps={section.steps ?? []} dark startFrame={18} />
      </div>
    </PromoScene>
  );
};
