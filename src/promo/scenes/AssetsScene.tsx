import type {FC} from "react";
import {Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {CameraRig} from "../../packaging/CameraRig";
import {RiseIn} from "../../packaging/motionPrimitives";
import {Kicker, Sticker} from "../../packaging/primitives";
import {BRAND_COLORS, TYPE} from "../../packaging/tokens";
import {
  BrowserFrame,
  Callout,
  PromoScene,
  SceneSubtitle,
  SceneTitle,
} from "../components";
import type {PromoSection} from "../types";

export const AssetsScene: FC<{section: PromoSection}> = ({section}) => {
  const frame = useCurrentFrame();
  const showStyles = frame > 360;
  const firstOpacity = interpolate(frame, [330, 360], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const secondOpacity = interpolate(frame, [330, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <PromoScene section={section} accent={BRAND_COLORS.cyan}>
      <div style={{marginTop: 24}}>
        <Kicker background={BRAND_COLORS.cyan}>LOCAL ASSET LIBRARY</Kicker>
        <SceneTitle section={section} fontSize={92} style={{marginTop: 14}} />
        <SceneSubtitle section={section} delay={18} size={28} style={{marginTop: 12}} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "520px 1fr",
          gap: 28,
          marginTop: 26,
          flex: 1,
          alignItems: "start",
        }}
      >
        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
          {(section.items ?? []).map((item, index) => (
            <RiseIn key={item.title} delay={14 + index * 5} distance={26}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: "1px solid rgba(21,21,21,0.13)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    background: [
                      BRAND_COLORS.lime,
                      BRAND_COLORS.cyan,
                      BRAND_COLORS.coral,
                      BRAND_COLORS.paper,
                    ][index],
                    border: "2px solid " + BRAND_COLORS.ink,
                    ...TYPE.micro,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{...TYPE.h3, fontSize: 25}}>{item.title}</div>
                  <div style={{...TYPE.small, color: BRAND_COLORS.muted, marginTop: 4}}>
                    {item.body}
                  </div>
                </div>
              </div>
            </RiseIn>
          ))}
        </div>

        <div style={{position: "relative"}}>
          <BrowserFrame label={showStyles ? "127.0.0.1:4321 / 设计资产" : "127.0.0.1:4321 / 素材库"}>
            <div style={{position: "relative", height: 516, overflow: "hidden", background: "#111"}}>
              <CameraRig
                move="pan-right"
                amount={1.04}
                panPercent={3}
                durationInFrames={section.endFrame - section.startFrame}
              >
                <Img
                  src={staticFile("promo/asset-manager.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: firstOpacity,
                  }}
                />
                <Img
                  src={staticFile("promo/style-library.png")}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: secondOpacity,
                  }}
                />
              </CameraRig>
            </div>
          </BrowserFrame>

          <div style={{display: "flex", gap: 8, marginTop: 10}}>
            <Callout>搜索</Callout>
            <Callout color={BRAND_COLORS.cyan}>筛选</Callout>
            <Callout color={BRAND_COLORS.coral}>预览 / 元数据</Callout>
            <Callout color={BRAND_COLORS.paper}>归档</Callout>
          </div>
        </div>
      </div>

      <Sticker
        color={BRAND_COLORS.lime}
        rotate={5}
        style={{position: "absolute", left: 86, bottom: 170}}
      >
        LOCAL ONLY / GITIGNORED
      </Sticker>
    </PromoScene>
  );
};
