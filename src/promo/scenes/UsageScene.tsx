import type {FC} from "react";
import {useCurrentFrame} from "remotion";
import {PopIn, RiseIn} from "../../packaging/motionPrimitives";
import {Kicker, Sticker} from "../../packaging/primitives";
import {BRAND_COLORS, RADIUS, STROKE, TYPE} from "../../packaging/tokens";
import {
  CommandLine,
  PromoScene,
  SceneSubtitle,
  SceneTitle,
} from "../components";
import type {PromoSection} from "../types";

export const UsageScene: FC<{section: PromoSection}> = ({section}) => {
  const frame = useCurrentFrame();
  const stepCues = (section.cues ?? []).slice(1, 5);
  const activeStep = stepCues.reduce(
    (active, cue, index) => (frame >= cue ? index : active),
    0,
  );

  return (
    <PromoScene section={section} accent={BRAND_COLORS.lime} texture="scanlines">
      <div style={{marginTop: 16}}>
        <Kicker background={BRAND_COLORS.lime}>REPRODUCIBLE WORKFLOW</Kicker>
        <SceneTitle section={section} fontSize={90} style={{marginTop: 14}} />
        <SceneSubtitle section={section} dark delay={18} size={28} style={{marginTop: 12}} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.72fr 1.28fr",
          gap: 24,
          marginTop: 26,
          flex: 1,
          alignItems: "start",
        }}
      >
        <div style={{display: "flex", flexDirection: "column", gap: 10}}>
          {(section.steps ?? []).map((step, index) => (
            <PopIn key={step.label} delay={10 + index * 7} fromScale={0.92}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "62px 1fr",
                  gap: 14,
                  alignItems: "center",
                  padding: "13px 16px",
                  border: "2px solid rgba(255,255,255,0.22)",
                  borderRadius: RADIUS.md,
                  background:
                    index === activeStep ? BRAND_COLORS.lime : "rgba(255,255,255,0.04)",
                  color: index === activeStep ? BRAND_COLORS.ink : BRAND_COLORS.white,
                }}
              >
                <div
                  style={{
                    ...TYPE.display,
                    fontSize: 42,
                    color: index === activeStep ? BRAND_COLORS.ink : BRAND_COLORS.lime,
                  }}
                >
                  0{index + 1}
                </div>
                <div>
                  <div style={{...TYPE.h3, fontSize: 28}}>{step.label}</div>
                  <div
                    style={{
                      ...TYPE.micro,
                      marginTop: 3,
                      opacity: 0.56,
                    }}
                  >
                    {step.note}
                  </div>
                </div>
              </div>
            </PopIn>
          ))}

          <RiseIn delay={34} distance={20} style={{marginTop: 4}}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: RADIUS.pill,
                ...TYPE.micro,
                color: "rgba(255,255,255,0.52)",
              }}
            >
              <span style={{width: 8, height: 8, borderRadius: "50%", background: BRAND_COLORS.cyan}} />
              OUTPUT → local/out
            </div>
          </RiseIn>
        </div>

        <RiseIn delay={12} distance={30}>
          <div
            style={{
              border: STROKE.strong + "px solid " + BRAND_COLORS.white,
              borderRadius: 22,
              background: "#0C0C0C",
              boxShadow: "12px 13px 0 " + BRAND_COLORS.lime,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: "2px solid rgba(255,255,255,0.18)",
                background: "#151515",
              }}
            >
              <div style={{display: "flex", gap: 8}}>
                {[BRAND_COLORS.coral, BRAND_COLORS.lime, BRAND_COLORS.cyan].map((color) => (
                  <span
                    key={color}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: color,
                    }}
                  />
                ))}
              </div>
              <div style={{...TYPE.micro, color: "rgba(255,255,255,0.48)"}}>
                TERMINAL / ml-explainer
              </div>
            </div>
            <div style={{padding: "12px 20px 18px"}}>
              {(section.commands ?? []).map((command, index) => (
                <CommandLine
                  key={command.cmd}
                  command={command.cmd}
                  note={command.note}
                  delay={18 + index * 36}
                  index={index}
                />
              ))}
            </div>
          </div>
        </RiseIn>
      </div>

      <Sticker
        color={BRAND_COLORS.coral}
        rotate={-4}
        style={{position: "absolute", right: 120, bottom: 170}}
      >
        ONE COMMAND AT A TIME
      </Sticker>
    </PromoScene>
  );
};
