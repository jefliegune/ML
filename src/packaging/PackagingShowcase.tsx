import type {ReactNode} from "react";
import {Audio} from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {Burst} from "../components/Design";
import {PopIn, RiseIn} from "./motionPrimitives";
import {
  EditorialRule,
  Headline,
  Kicker,
  PackagingBackground,
  PaperCard,
  Sticker,
  TapeStrip,
} from "./primitives";
import {ChapterOpener, EndSlate} from "./templates";
import {BRAND_TOKENS, STROKE, TYPE} from "./tokens";
import {SectionWipe} from "./transitions";

const AssetTile: React.FC<{
  index: string;
  title: string;
  subtitle: string;
  accent: string;
  delay: number;
  children: ReactNode;
}> = ({index, title, subtitle, accent, delay, children}) => {
  return (
    <PopIn delay={delay} fromScale={0.82}>
      <PaperCard
        tone="clear"
        accent={accent}
        style={{
          height: 246,
          padding: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: 42,
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `${STROKE.base}px solid ${BRAND_TOKENS.line.subtle}`,
            ...TYPE.micro,
            color: BRAND_TOKENS.ink.secondary,
          }}
        >
          <span>{index}</span>
          <span>REUSABLE ASSET</span>
        </div>

        <div style={{position: "absolute", inset: "42px 0 48px"}}>{children}</div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 48,
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `${STROKE.base}px solid ${BRAND_TOKENS.line.subtle}`,
          }}
        >
          <span style={{...TYPE.label, fontSize: 14}}>{title}</span>
          <span style={{...TYPE.micro, opacity: 0.42}}>{subtitle}</span>
        </div>
      </PaperCard>
    </PopIn>
  );
};

const AssetLibrary: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <PackagingBackground tone="paper" index="02" label="ASSET LIBRARY">
      <AbsoluteFill style={{padding: "88px 92px 68px"}}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <RiseIn delay={1}>
              <Kicker background={BRAND_TOKENS.support.base}>ASSET LIBRARY / 06 TILES</Kicker>
            </RiseIn>
            <RiseIn delay={5} distance={50}>
              <Headline
                size="h1"
                style={{
                  marginTop: 20,
                  maxWidth: 1240,
                  fontSize: 72,
                  lineHeight: 1.02,
                  letterSpacing: -2.8,
                }}
              >
                每个镜头，都从
                <span style={{color: BRAND_TOKENS.accent.base}}>素材库</span>
                组合。
              </Headline>
            </RiseIn>
          </div>
          <div style={{...TYPE.label, opacity: 0.45, paddingBottom: 10}}>
            REUSE / COMBINE / REMIX
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          <AssetTile
            index="01 / TEXTURE"
            title="PAPER / DOT GRID"
            subtitle="BACKGROUND"
            accent={BRAND_TOKENS.accent.base}
            delay={12}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: BRAND_TOKENS.surface.raised,
                backgroundImage:
                  `radial-gradient(${BRAND_TOKENS.line.strong} 1.2px, transparent 1.4px)`,
                backgroundSize: "16px 16px",
              }}
            />
            <TapeStrip
              width={132}
              style={{position: "absolute", left: 30, top: 34}}
            />
          </AssetTile>

          <AssetTile
            index="02 / TEXTURE"
            title="HALFTONE / BURST"
            subtitle="ACCENT"
            accent={BRAND_TOKENS.accent.base}
            delay={16}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: BRAND_TOKENS.surface.base,
                backgroundImage:
                  `radial-gradient(${BRAND_TOKENS.accent.soft} 2.8px, transparent 3px)`,
                backgroundSize: "15px 15px",
                rotate: `${frame * 0.08}deg`,
                scale: 1.14,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 20,
                top: 12,
                fontFamily: '"Arial Narrow", Arial, sans-serif',
                fontSize: 86,
                lineHeight: 1,
                fontWeight: 900,
                color: BRAND_TOKENS.ink.primary,
                opacity: 0.86,
              }}
            >
              45°
            </div>
          </AssetTile>

          <AssetTile
            index="03 / COMPONENT"
            title="STICKER / CALLOUT"
            subtitle="EMPHASIS"
            accent={BRAND_TOKENS.accent.base}
            delay={20}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: BRAND_TOKENS.support.soft,
                backgroundImage:
                  `repeating-linear-gradient(135deg, transparent 0 24px, ${BRAND_TOKENS.line.subtle} 24px 26px)`,
              }}
            />
            <Sticker
              color={BRAND_TOKENS.accent.base}
              rotate={-5}
              style={{
                position: "absolute",
                left: 38,
                top: 38,
                fontSize: 16,
              }}
            >
              KEY POINT
            </Sticker>
          </AssetTile>

          <AssetTile
            index="04 / SHAPE"
            title="IMPACT / STAR"
            subtitle="TRANSITION"
            accent={BRAND_TOKENS.accent.base}
            delay={24}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: BRAND_TOKENS.ink.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Burst
                size={175}
                color={BRAND_TOKENS.signal}
                rotate={frame * 0.8}
              />
            </div>
          </AssetTile>

          <AssetTile
            index="05 / TYPE"
            title="TYPE / SCALE"
            subtitle="HIERARCHY"
            accent={BRAND_TOKENS.accent.base}
            delay={28}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: BRAND_TOKENS.surface.raised,
                padding: "22px 24px",
              }}
            >
              <div style={{...TYPE.micro, opacity: 0.45}}>DISPLAY / 136</div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: '"HarmonyOS Sans SC", "Microsoft YaHei", sans-serif',
                  fontSize: 87,
                  lineHeight: 0.9,
                  fontWeight: 900,
                  letterSpacing: -5,
                }}
              >
                Aa 86
              </div>
              <div style={{...TYPE.body, fontSize: 18, marginTop: 9, opacity: 0.56}}>
                标题 / 数据 / 注释
              </div>
            </div>
          </AssetTile>

          <AssetTile
            index="06 / MOTION"
            title="WIPE / SECTION"
            subtitle="TRANSITION"
            accent={BRAND_TOKENS.accent.base}
            delay={32}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: BRAND_TOKENS.ink.primary,
                overflow: "hidden",
              }}
            >
              {[
                {color: BRAND_TOKENS.accent.base, top: 18, delay: 0},
                {color: BRAND_TOKENS.signal, top: 74, delay: 8},
                {color: BRAND_TOKENS.support.base, top: 130, delay: 16},
              ].map((bar) => (
                <div
                  key={bar.color}
                  style={{
                    position: "absolute",
                    left: `${((frame + bar.delay) * 3.2) % 150 - 30}%`,
                    top: bar.top,
                    width: "64%",
                    height: 34,
                    backgroundColor: bar.color,
                    rotate: "-8deg",
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  top: 10,
                  padding: "5px 7px 4px",
                  borderRadius: 4,
                  backgroundColor: BRAND_TOKENS.ink.primary,
                  color: BRAND_TOKENS.signal,
                  ...TYPE.micro,
                }}
              >
                WHOOSH / 16F
              </div>
            </div>
          </AssetTile>
        </div>

        <div style={{position: "absolute", left: 92, right: 92, bottom: 58}}>
          <EditorialRule label="TOKENS → COMPONENTS → TEMPLATES → QC" />
        </div>
      </AbsoluteFill>
    </PackagingBackground>
  );
};

export const PackagingShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BRAND_TOKENS.bg.base}}>
      <Sequence durationInFrames={100}>
        <ChapterOpener
          index="01"
          kicker="VISUAL PACKAGING KIT / V1.0"
          title={
            <>
              视觉包装，
              <br />
              是一套系统。
            </>
          }
          subtitle="把颜色、字体、图形、动效、声音和质检，做成可复用的生产工具。"
          sticker="SYSTEM / V1.0"
          accent={BRAND_TOKENS.signal}
        />
      </Sequence>

      <Sequence from={100} durationInFrames={100}>
        <AssetLibrary />
      </Sequence>

      <Sequence from={200} durationInFrames={100}>
        <EndSlate
          title={
            <>
              高标准，不是更难做，
              <br />
              是更少返工。
            </>
          }
          subtitle="下一期开始：从脚本、素材、动效、声音到质检，全部走同一套系统。"
          tags={["TOKENS", "MOTION", "SOUND", "QC"]}
        />
      </Sequence>

      <Sequence from={92} durationInFrames={16}>
        <SectionWipe color={BRAND_TOKENS.signal} />
      </Sequence>
      <Sequence from={192} durationInFrames={16}>
        <SectionWipe color={BRAND_TOKENS.support.base} direction={-1} />
      </Sequence>

      <Audio src={staticFile("audio/bgm-preview.wav")} volume={0.5} />
      <Sequence from={3}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.22} />
      </Sequence>
      <Sequence from={94}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={194}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={202}>
        <Audio src={staticFile("sfx/ding.wav")} volume={0.18} />
      </Sequence>
    </AbsoluteFill>
  );
};





