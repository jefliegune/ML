import type {ReactNode} from "react";
import {AbsoluteFill} from "remotion";
import {RiseIn, PopIn} from "./motionPrimitives";
import {
  EditorialRule,
  Headline,
  Kicker,
  PackagingBackground,
  PaperCard,
  Sticker,
  TapeStrip,
} from "./primitives";
import {
  BRAND_COLORS,
  RADIUS,
  SHADOW,
  STROKE,
  TYPE,
  type BrandTone,
} from "./tokens";

export const ChapterOpener: React.FC<{
  index: string;
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  accent?: string;
  tone?: BrandTone;
  sticker?: string;
  footer?: string;
}> = ({
  index,
  kicker,
  title,
  subtitle,
  accent = BRAND_COLORS.coral,
  tone = "paper",
  sticker,
  footer = "EDITORIAL MOTION SYSTEM",
}) => {
  const foreground = tone === "paper" ? BRAND_COLORS.ink : BRAND_COLORS.white;

  return (
    <PackagingBackground tone={tone} index={index} accent={accent} label={footer}>
      <AbsoluteFill style={{padding: "94px 92px 70px"}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <RiseIn delay={1}>
            <Kicker background={accent}>{kicker}</Kicker>
          </RiseIn>
          <RiseIn delay={6} style={{textAlign: "right"}}>
            <div style={{...TYPE.label, opacity: 0.5}}>
              PACKAGING / {index}
            </div>
            <div style={{...TYPE.micro, opacity: 0.35, marginTop: 8}}>
              {footer}
            </div>
          </RiseIn>
        </div>

        <div style={{height: 104}} />
        <RiseIn delay={7} distance={66}>
          <Headline size="display" style={{maxWidth: 1260, color: foreground}}>
            {title}
          </Headline>
        </RiseIn>

        {subtitle ? (
          <RiseIn delay={15} distance={34}>
            <div
              style={{
                marginTop: 32,
                maxWidth: 860,
                color: foreground,
                opacity: 0.68,
                ...TYPE.body,
              }}
            >
              {subtitle}
            </div>
          </RiseIn>
        ) : null}

        <div style={{position: "absolute", left: 92, right: 92, bottom: 72}}>
          <EditorialRule label="READ / MAKE / REPEAT" color={foreground} />
        </div>
      </AbsoluteFill>

      {sticker ? (
        <PopIn
          delay={18}
          style={{position: "absolute", right: 116, bottom: 164}}
        >
          <div style={{position: "relative"}}>
            <TapeStrip width={180} style={{position: "absolute", right: -28, top: -24}} />
            <Sticker color={accent} rotate={5} style={{fontSize: 18}}>
              {sticker}
            </Sticker>
          </div>
        </PopIn>
      ) : null}
    </PackagingBackground>
  );
};

export const EndSlate: React.FC<{
  title: ReactNode;
  subtitle: ReactNode;
  footer?: string;
  tags?: string[];
  accent?: string;
  tone?: BrandTone;
}> = ({
  title,
  subtitle,
  footer = "ML EXPLAINED / SYSTEM V1",
  tags = ["DATA", "MODEL", "FEEDBACK"],
  accent = BRAND_COLORS.lime,
  tone = "ink",
}) => {
  return (
    <PackagingBackground tone={tone} index="END" accent={accent} label={footer}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "70px 110px",
        }}
      >
        <RiseIn delay={2} distance={56}>
          <PaperCard
            tone="light"
            accent={accent}
            style={{width: 1400, padding: "42px 46px 38px"}}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Kicker background={BRAND_COLORS.ink} color={BRAND_COLORS.lime}>
                {footer}
              </Kicker>
              <div style={{...TYPE.label, opacity: 0.45}}>FINAL FRAME</div>
            </div>

            <div style={{marginTop: 30}}>
              <Headline size="h1" style={{maxWidth: 1180}}>
                {title}
              </Headline>
            </div>

            <div
              style={{
                marginTop: 22,
                fontFamily: '"HarmonyOS Sans SC", "Microsoft YaHei", sans-serif',
                fontSize: 28,
                lineHeight: 1.45,
                fontWeight: 600,
                color: BRAND_COLORS.muted,
                maxWidth: 1120,
              }}
            >
              {subtitle}
            </div>

            <div style={{display: "flex", gap: 12, marginTop: 30}}>
              {tags.map((tag, index) => (
                <div
                  key={tag}
                  style={{
                    padding: "9px 14px 8px",
                    borderRadius: RADIUS.pill,
                    border: `${STROKE.base}px solid ${BRAND_COLORS.ink}`,
                    backgroundColor:
                      index === 0
                        ? BRAND_COLORS.lime
                        : index === 1
                          ? BRAND_COLORS.cyan
                          : BRAND_COLORS.coral,
                    boxShadow: SHADOW.micro,
                    ...TYPE.label,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </PaperCard>
        </RiseIn>
      </AbsoluteFill>
    </PackagingBackground>
  );
};
