import type {FC} from "react";
import {RiseIn} from "../../packaging/motionPrimitives";
import {Kicker, PaperCard, Sticker} from "../../packaging/primitives";
import {BRAND_COLORS, TYPE} from "../../packaging/tokens";
import {
  FeatureGrid,
  MetricStrip,
  PromoScene,
  SceneSubtitle,
  SceneTitle,
  TimelineCard,
} from "../components";
import type {PromoSection} from "../types";

const COMPONENTS = [
  {name: "CameraRig", body: "推 / 拉 / 平移 / 急推", color: BRAND_COLORS.lime},
  {name: "KineticType", body: "词级入场 / 关键词高亮", color: BRAND_COLORS.cyan},
  {name: "StyleTexture", body: "纸纹 / 颗粒 / 半调 / 扫描线", color: BRAND_COLORS.coral},
];

export const AdvantagesScene: FC<{section: PromoSection}> = ({section}) => {
  return (
    <PromoScene section={section} accent={BRAND_COLORS.lime} texture="scanlines">
      <div style={{marginTop: 14}}>
        <Kicker background={BRAND_COLORS.lime}>SYSTEM, NOT A FILTER</Kicker>
        <SceneTitle section={section} fontSize={86} style={{marginTop: 14}} />
        <SceneSubtitle section={section} dark delay={18} size={28} style={{marginTop: 12}} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.08fr 0.92fr",
          gap: 20,
          marginTop: 24,
          flex: 1,
          minHeight: 0,
        }}
      >
        <FeatureGrid
          items={section.items ?? []}
          dark
          columns={2}
          startFrame={14}
          style={{alignContent: "start"}}
        />

        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          <RiseIn delay={20} distance={28}>
            <TimelineCard />
          </RiseIn>
          <RiseIn delay={28} distance={28} style={{flex: 1}}>
            <PaperCard
              tone="dark"
              accent={BRAND_COLORS.blue}
              style={{padding: "16px 18px", height: "100%"}}
            >
              <div style={{...TYPE.micro, color: BRAND_COLORS.lime, marginBottom: 10}}>
                ORIGINAL COMPONENTS
              </div>
              {COMPONENTS.map((component) => (
                <div
                  key={component.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "14px 1fr",
                    gap: 10,
                    alignItems: "start",
                    padding: "9px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      marginTop: 5,
                      borderRadius: "50%",
                      background: component.color,
                    }}
                  />
                  <div>
                    <div style={{...TYPE.small, color: BRAND_COLORS.white, fontWeight: 800}}>
                      {component.name}
                    </div>
                    <div style={{...TYPE.micro, color: "rgba(255,255,255,0.48)", marginTop: 3}}>
                      {component.body}
                    </div>
                  </div>
                </div>
              ))}
            </PaperCard>
          </RiseIn>
        </div>
      </div>

      <MetricStrip
        metrics={section.metrics ?? []}
        dark
        startFrame={30}
        compact
        style={{
          marginTop: 14,
        }}
      />

      <Sticker
        color={BRAND_COLORS.coral}
        rotate={4}
        style={{position: "absolute", right: 110, top: 132}}
      >
        51 STYLES / 9 GRAMMARS
      </Sticker>
    </PromoScene>
  );
};
