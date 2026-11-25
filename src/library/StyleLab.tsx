import type {CSSProperties, FC} from "react";
import {AbsoluteFill, Sequence} from "remotion";
import type {LibraryGrammar, LibraryStyle} from "./index";
import {GRAMMARS, STYLES, STYLE_COUNTS, getPalette} from "./index";
import {CameraRig} from "../packaging/CameraRig";
import {KineticType} from "../packaging/KineticType";
import {StyleTexture} from "../packaging/StyleTexture";
import {
  Headline,
  Kicker,
  PackagingBackground,
  PaperCard,
  Sticker,
} from "../packaging/primitives";
import {BRAND_COLORS, RADIUS, STROKE, TYPE} from "../packaging/tokens";

const FEATURED_IDS = ["hs-09-postimp", "hs-12-bauhaus", "hs-20-dunhuang"];

const featured = FEATURED_IDS.map((id) => STYLES.find((style) => style.id === id)).filter(
  (style): style is LibraryStyle => Boolean(style),
);

const huashuStyles = STYLES.filter((style) => style.family === "huashu");

const PaletteDots: FC<{paletteId: string | null}> = ({paletteId}) => {
  if (!paletteId) {
    return (
      <span style={{...TYPE.micro, color: BRAND_COLORS.muted}}>
        CARD-DEFINED PALETTE
      </span>
    );
  }
  const palette = getPalette(paletteId);
  const keys = ["bg", "surface", "ink", "accent", "accent2", "sub"] as const;
  return (
    <div style={{display: "flex", gap: 5}}>
      {keys.map((key) => (
        <span
          key={key}
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: palette.colors[key],
            border: `1.5px solid ${BRAND_COLORS.ink}`,
          }}
        />
      ))}
    </div>
  );
};

const StyleCard: FC<{style: LibraryStyle; index: number}> = ({style, index}) => {
  return (
    <PaperCard
      style={{
        width: 520,
        height: 372,
        padding: 26,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: `7px 7px 0 ${BRAND_COLORS.ink}`,
      }}
    >
      <div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <span style={{...TYPE.label, color: BRAND_COLORS.muted}}>
            0{index + 1} / HUASHU
          </span>
          <span style={{...TYPE.label, color: BRAND_COLORS.coral, letterSpacing: 2}}>
            {"★".repeat(style.quality)}
          </span>
        </div>
        <div style={{...TYPE.h3, marginTop: 12, fontSize: 46}}>{style.name}</div>
        <div
          style={{
            ...TYPE.small,
            marginTop: 10,
            color: BRAND_COLORS.muted,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 72,
          }}
        >
          {style.technique}
        </div>
      </div>
      <div>
        <PaletteDots paletteId={style.palette} />
        <div
          style={{
            ...TYPE.micro,
            marginTop: 12,
            color: BRAND_COLORS.muted,
            textTransform: "uppercase",
          }}
        >
          {style.english ?? style.technique.slice(0, 48)}
        </div>
      </div>
    </PaperCard>
  );
};

const StyleChip: FC<{style: LibraryStyle; active: boolean}> = ({style, active}) => {
  return (
    <div
      style={{
        padding: "7px 11px",
        borderRadius: RADIUS.pill,
        border: `1.5px solid ${active ? BRAND_COLORS.lime : "rgba(255,255,255,0.35)"}`,
        background: active ? BRAND_COLORS.lime : "transparent",
        color: active ? BRAND_COLORS.ink : BRAND_COLORS.white,
        fontFamily: '"HarmonyOS Sans SC", "Microsoft YaHei", sans-serif',
        fontSize: 15,
        fontWeight: 750,
      }}
    >
      {style.name}
    </div>
  );
};

const GrammarChip: FC<{grammar: LibraryGrammar; index: number}> = ({grammar, index}) => {
  return (
    <div
      style={{
        minHeight: 118,
        padding: "16px 18px",
        borderRadius: RADIUS.md,
        border: `${STROKE.strong}px solid ${BRAND_COLORS.ink}`,
        background: BRAND_COLORS.paper,
        boxShadow: `4px 4px 0 ${BRAND_COLORS.ink}`,
      }}
    >
      <div style={{...TYPE.micro, color: BRAND_COLORS.coral}}>
        GRAMMAR / 0{index + 1}
      </div>
      <div style={{...TYPE.h3, fontSize: 26, marginTop: 6, lineHeight: 1.1}}>
        {grammar.name}
      </div>
      <div
        style={{
          ...TYPE.small,
          fontSize: 14,
          marginTop: 6,
          color: BRAND_COLORS.muted,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {grammar.oneLiner}
      </div>
    </div>
  );
};

const content: CSSProperties = {
  position: "absolute",
  inset: 0,
  padding: "86px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

export const StyleLab: FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BRAND_COLORS.cream}}>
      <Sequence durationInFrames={104}>
        <PackagingBackground
          tone="paper"
          index="01"
          label={`ASSET LIBRARY / ${STYLE_COUNTS.huashu + STYLE_COUNTS.original}`}
        >
          <CameraRig move="push" amount={1.07} durationInFrames={104} style={content}>
            <Kicker>
              {STYLE_COUNTS.huashu} HUASHU · {STYLE_COUNTS.original} ORIGINAL
            </Kicker>
            <KineticType
              tokens={["风格", "不是", "贴纸"]}
              accent={[2]}
              fontSize={168}
              startFrame={5}
              style={{marginTop: 22}}
            />
            <div style={{...TYPE.h2, marginTop: 22, color: BRAND_COLORS.muted, maxWidth: 1280}}>
              是把色板、运镜、语法，变成可以传入的参数。
            </div>
            <div style={{position: "absolute", right: 120, top: 190}}>
              <Sticker color={BRAND_COLORS.lime} rotate={-6}>
                {STYLE_COUNTS.huashu + STYLE_COUNTS.original} STYLES ·{" "}
                {STYLE_COUNTS.grammars} GRAMMARS
              </Sticker>
            </div>
          </CameraRig>
          <StyleTexture variant="grain" opacity={0.16} />
        </PackagingBackground>
      </Sequence>

      <Sequence from={104} durationInFrames={108}>
        <PackagingBackground tone="ink" index="02" label="HUASHU / 36">
          <CameraRig
            move="pan-right"
            amount={1.06}
            panPercent={4}
            durationInFrames={108}
            style={content}
          >
            <Kicker background={BRAND_COLORS.lime}>HUASHU STYLE CARDS / 36</Kicker>
            <Headline size="h1" style={{marginTop: 18}}>
              先选画法，再写画面。
            </Headline>
            <div style={{display: "flex", gap: 24, marginTop: 34}}>
              {featured.map((style, index) => (
                <StyleCard key={style.id} style={style} index={index} />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 86,
                right: 86,
                bottom: 48,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {huashuStyles.map((style) => (
                <StyleChip
                  key={style.id}
                  style={style}
                  active={FEATURED_IDS.includes(style.id)}
                />
              ))}
            </div>
          </CameraRig>
          <StyleTexture variant="scanlines" opacity={0.1} color="#FFFFFF" scale={4} />
        </PackagingBackground>
      </Sequence>

      <Sequence from={212} durationInFrames={88}>
        <PackagingBackground tone="paper" index="03" label="GRAMMAR / 09">
          <CameraRig move="pull" amount={1.06} durationInFrames={88} style={content}>
            <Kicker background={BRAND_COLORS.blue} color={BRAND_COLORS.white}>
              GRAMMAR / 9
            </Kicker>
            <KineticType
              tokens={["先选", "语法", "再选", "模板"]}
              accent={[1, 3]}
              fontSize={118}
              startFrame={3}
              style={{marginTop: 16}}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginTop: 26,
                maxWidth: 1500,
              }}
            >
              {GRAMMARS.map((grammar, index) => (
                <GrammarChip key={grammar.id} grammar={grammar} index={index} />
              ))}
            </div>
            <div style={{position: "absolute", right: 120, bottom: 92}}>
              <Sticker color={BRAND_COLORS.coral} rotate={4}>
                风格是参数，不是滤镜。
              </Sticker>
            </div>
          </CameraRig>
        </PackagingBackground>
      </Sequence>
    </AbsoluteFill>
  );
};
