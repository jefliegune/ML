import type {CSSProperties, FC} from "react";
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {AbsoluteFill} from "remotion";
import {PIXEL_ARCADE as C, PIXEL_FONT, PIXEL_MONO} from "./tokens";
import {PixelBuddy} from "./PixelBuddy";
import {PixelPanel, PixelSpeechBars} from "./PixelChrome";
import {PixelMiniStep, type PixelStep} from "./PixelStepUI";

const reveal = (frame: number, start: number, duration = 14) => {
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return {
    opacity: progress,
    translateY: (1 - progress) * 28,
  };
};

export const PixelGuideActor: FC<{
  pose?: "idle" | "wave" | "point";
  caption?: string;
  accent?: string;
  left?: number;
  bottom?: number;
}> = ({pose = "idle", caption = "HOW TO", accent = C.mint, left = 56, bottom = 36}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left,
        bottom,
        width: 260,
        height: 320,
        zIndex: 14,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 8,
          bottom: 0,
          height: 70,
          backgroundColor: C.panel,
          border: `3px solid ${accent}`,
          boxShadow: `6px 6px 0 ${C.ink}`,
        }}
      />
      <div style={{position: "absolute", left: 21, bottom: 72}}>
        <PixelBuddy pose={pose} size={218} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 28,
          bottom: 8,
          width: 204,
          height: 47,
          padding: "0 9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: C.ink,
          border: `2px solid ${accent}`,
          color: accent,
          fontFamily: PIXEL_MONO,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.2,
        }}
      >
        <span>BIT / GUIDE</span>
        <PixelSpeechBars color={accent} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          bottom: 177,
          padding: "8px 10px",
          backgroundColor: C.panel2,
          border: `2px solid ${C.cream}`,
          boxShadow: `4px 4px 0 ${C.ink}`,
          fontFamily: PIXEL_MONO,
          fontSize: 11,
          color: C.cream,
          fontWeight: 900,
          letterSpacing: 1.3,
          opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.68,
        }}
      >
        {caption}
      </div>
    </div>
  );
};

export const PixelGuideMonitor: FC<{
  eyebrow?: string;
  title?: string;
  steps: PixelStep[];
  footer?: string;
  style?: CSSProperties;
}> = ({eyebrow = "SELECT MODE", title = "三步开工", steps, footer = "[ PRESS START ]", style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        right: 86,
        top: 160,
        width: 586,
        ...style,
      }}
    >
      <PixelPanel
        accent={C.cream}
        style={{
          padding: 17,
          backgroundColor: C.panel2,
          boxShadow: `12px 12px 0 ${C.ink}`,
        }}
      >
        <div
          style={{
            height: 414,
            position: "relative",
            overflow: "hidden",
            backgroundColor: C.ink,
            border: `3px solid ${C.cream}`,
          }}
        >
          <div
            style={{
              height: 39,
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `2px solid ${C.cream}33`,
              color: C.mint,
              fontFamily: PIXEL_MONO,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.6,
            }}
          >
            <span>GUIDE_01 // ONLINE</span>
            <span style={{display: "flex", gap: 5}}>
              <i style={{width: 7, height: 7, backgroundColor: C.coral}} />
              <i style={{width: 7, height: 7, backgroundColor: C.yellow}} />
              <i style={{width: 7, height: 7, backgroundColor: C.mint}} />
            </span>
          </div>

          <div
            style={{
              padding: "24px 26px 20px",
              position: "relative",
              height: 375,
            }}
          >
            <div
              style={{
                fontFamily: PIXEL_MONO,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 2,
                color: C.muted,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: PIXEL_FONT,
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: 0.6,
                color: C.cream,
              }}
            >
              {title}
            </div>

            <div style={{display: "flex", flexDirection: "column", gap: 12, marginTop: 20}}>
              {steps.map((step, index) => {
                const on =
                  frame < 55 ? true : frame < 72 ? index === 0 : frame < 91 ? index <= 1 : true;
                return (
                  <div
                    key={step.key}
                    style={{
                      height: 65,
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: `2px solid ${on ? step.accent : C.cream + "22"}`,
                      backgroundColor: on ? C.panel : "transparent",
                      opacity: on ? 1 : 0.55,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: on ? step.accent : C.panel2,
                        color: C.ink,
                        fontFamily: PIXEL_MONO,
                        fontSize: 13,
                        fontWeight: 900,
                      }}
                    >
                      {step.index}
                    </div>
                    <div style={{flex: 1}}>
                      <div
                        style={{
                          fontFamily: PIXEL_FONT,
                          fontSize: 21,
                          fontWeight: 900,
                          color: C.cream,
                        }}
                      >
                        {step.title}
                      </div>
                      <div
                        style={{
                          marginTop: 3,
                          fontFamily: PIXEL_MONO,
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 1.3,
                          color: step.accent,
                        }}
                      >
                        {step.english} / READY
                      </div>
                    </div>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderTop: `3px solid ${step.accent}`,
                        borderRight: `3px solid ${step.accent}`,
                        rotate: "45deg",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              style={{
                position: "absolute",
                left: 26,
                right: 26,
                bottom: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: PIXEL_MONO,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 1.4,
                color: C.yellow,
              }}
            >
              <span>{footer}</span>
              <span style={{opacity: Math.floor(frame / 9) % 2 === 0 ? 1 : 0.2}}>▶▶▶</span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${(frame * 2.3) % 360}px`,
              height: 2,
              backgroundColor: C.mint,
              opacity: 0.2,
            }}
          />
        </div>
      </PixelPanel>
    </div>
  );
};

export const PixelHookScene: FC<{
  badge: string;
  titleLead: string;
  titleMain: string;
  titleAccent: string;
  titleSuffix: string;
  flow: string[];
  steps: PixelStep[];
  monitorTitle?: string;
  monitorEyebrow?: string;
}> = ({
  badge,
  titleLead,
  titleMain,
  titleAccent,
  titleSuffix,
  flow,
  steps,
  monitorTitle = "三步开工",
  monitorEyebrow = "SELECT MODE",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleA = reveal(frame, 2, 14);
  const titleB = reveal(frame, 6, 16);
  const start = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 180, mass: 0.65},
    durationInFrames: 18,
  });
  const activeMini =
    frame < 66 ? 0 : frame < 82 ? 1 : Math.min(2, steps.length - 1);

  return (
    <AbsoluteFill>
      <div style={{position: "absolute", left: 94, top: 184, width: 1200}}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "9px 13px",
            border: `2px solid ${C.mint}`,
            backgroundColor: C.mint,
            color: C.ink,
            boxShadow: `4px 4px 0 ${C.ink}`,
            fontFamily: PIXEL_MONO,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.8,
            opacity: start,
            translate: `0px ${(1 - start) * 16}px`,
          }}
        >
          <span style={{width: 8, height: 8, backgroundColor: C.ink}} />
          {badge}
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: PIXEL_FONT,
            fontSize: 78,
            lineHeight: 1.08,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: C.cream,
            textShadow: `5px 5px 0 ${C.ink}`,
            opacity: titleA.opacity,
            translate: `0px ${titleA.translateY}px`,
          }}
        >
          {titleLead}
        </div>

        <div
          style={{
            marginTop: 4,
            fontFamily: PIXEL_FONT,
            fontSize: 154,
            lineHeight: 1.02,
            fontWeight: 900,
            letterSpacing: 1.8,
            color: C.cream,
            textShadow: `7px 7px 0 ${C.ink}, 13px 13px 0 rgba(61,220,151,0.17)`,
            opacity: titleB.opacity,
            translate: `0px ${titleB.translateY}px`,
          }}
        >
          {titleMain}
          <span
            style={{
              display: "inline-block",
              margin: "0 10px",
              color: C.yellow,
              fontSize: 184,
              lineHeight: 0.86,
              textShadow: `8px 8px 0 ${C.ink}, 15px 15px 0 rgba(255,200,87,0.13)`,
            }}
          >
            {titleAccent}
          </span>
          {titleSuffix}
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: PIXEL_MONO,
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: 1.8,
            color: C.muted,
            opacity: reveal(frame, 31, 14).opacity,
          }}
        >
          {flow.map((item, index) => (
            <span key={`${item}-${index}`} style={{display: "contents"}}>
              <span style={{color: index % 2 === 0 ? C.mint : C.yellow}}>{item}</span>
              {index < flow.length - 1 ? <span style={{color: C.yellow}}>▶</span> : null}
            </span>
          ))}
        </div>
      </div>

      <div style={{position: "absolute", left: 94, top: 666, display: "flex", gap: 22}}>
        {steps.map((step, index) => (
          <PixelMiniStep
            key={step.key}
            step={step}
            active={index === activeMini}
            delay={46 + index * 7}
          />
        ))}
      </div>

      <PixelGuideMonitor title={monitorTitle} eyebrow={monitorEyebrow} steps={steps} />
    </AbsoluteFill>
  );
};
