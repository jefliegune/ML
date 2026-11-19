import type {FC} from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {Kicker, PaperCard, Sticker} from "../../packaging/primitives";
import {BRAND_COLORS, RADIUS, TYPE} from "../../packaging/tokens";
import {
  PromoScene,
  SceneSubtitle,
  SceneTitle,
  SourceCard,
} from "../components";
import type {PromoSection} from "../types";

export const SourcesScene: FC<{section: PromoSection}> = ({section}) => {
  const frame = useCurrentFrame();
  const sourceCues = [1, 3, 5].map((index) => (section.cues ?? [])[index] ?? Infinity);
  const activeSource = sourceCues.reduce(
    (active, cue, index) => (frame >= cue ? index : active),
    -1,
  );
  const dash = interpolate(frame, [22, 70], [160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <PromoScene section={section} accent={BRAND_COLORS.blue}>
      <div style={{marginTop: 22}}>
        <Kicker background={BRAND_COLORS.blue} color={BRAND_COLORS.white}>
          METHOD + STYLE + RHYTHM
        </Kicker>
        <SceneTitle section={section} fontSize={94} style={{marginTop: 16}} />
        <SceneSubtitle section={section} delay={20} size={30} style={{marginTop: 14}} />
      </div>

      <div style={{position: "relative", marginTop: 30}}>
        <svg
          width="1748"
          height="430"
          viewBox="0 0 1748 430"
          style={{position: "absolute", left: 0, top: 0, zIndex: 0, overflow: "visible"}}
        >
          {[
            "M 260 318 C 260 390, 650 402, 874 418",
            "M 874 318 L 874 418",
            "M 1488 318 C 1488 390, 1098 402, 874 418",
          ].map((path, index) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke={[BRAND_COLORS.blue, BRAND_COLORS.coral, BRAND_COLORS.cyan][index]}
              strokeWidth={3}
              strokeDasharray="7 9"
              strokeDashoffset={dash}
              opacity={0.72}
            />
          ))}
        </svg>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          {(section.items ?? []).map((item, index) => (
            <SourceCard
              key={item.title}
              item={item}
              index={index}
              active={activeSource === -1 || activeSource === index}
            />
          ))}
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            margin: "18px auto 0",
            width: 520,
          }}
        >
          <PaperCard
            accent={BRAND_COLORS.lime}
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{...TYPE.label, color: BRAND_COLORS.ink}}>CATALOG.JSON</div>
            <div
              style={{
                ...TYPE.micro,
                color: BRAND_COLORS.white,
                background: BRAND_COLORS.ink,
                borderRadius: RADIUS.pill,
                padding: "6px 10px",
              }}
            >
              8 PALETTES / 51 STYLES / 9 GRAMMARS
            </div>
          </PaperCard>
        </div>
      </div>

      <Sticker
        color={BRAND_COLORS.lime}
        rotate={4}
        style={{position: "absolute", right: 120, bottom: 170}}
      >
        METADATA ONLY / MIT
      </Sticker>
    </PromoScene>
  );
};
