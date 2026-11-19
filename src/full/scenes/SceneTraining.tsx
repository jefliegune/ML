import type {CSSProperties} from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Burst,
  EaseInText,
  MonoTag,
  SceneBackground,
  TopBar,
} from "../../components/Design";
import {COLORS, FONT, MONO} from "../../theme";
import {NetworkGraph} from "../components/NetworkGraph";

const WeightChip: React.FC<{
  label: string;
  value: string;
  color: string;
  delay: number;
  style: CSSProperties;
}> = ({label, value, color, delay, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 12, stiffness: 180, mass: 0.65},
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "9px 12px 8px",
        borderRadius: 8,
        border: `2px solid ${COLORS.ink}`,
        backgroundColor: color,
        color: COLORS.ink,
        fontFamily: MONO,
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: 0.8,
        boxShadow: `4px 5px 0 ${COLORS.ink}`,
        rotate: `${label === "w2" ? -2.5 : label === "w3" ? 2 : -1}deg`,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        ...style,
      }}
    >
      <span style={{opacity: 0.56}}>{label}</span>
      <span>{value}</span>
    </div>
  );
};

export const SceneTraining: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const backwardPhase = frame >= 116 && frame < 262;
  const confidence = interpolate(frame, [390, 498], [42, 98], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.18, 0.9, 0.32, 1),
  });
  const confidenceReached = spring({
    frame: frame - 486,
    fps,
    config: {damping: 10, stiffness: 160, mass: 0.7},
    durationInFrames: 22,
  });
  const trainCount = Math.round(
    interpolate(frame, [330, 462], [1, 10000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 0.9, 0.35, 1),
    }),
  );
  const retryEnter = spring({
    frame: frame - 260,
    fps,
    config: {damping: 13, stiffness: 165, mass: 0.7},
    durationInFrames: 18,
  });
  const errorPulse = 0.5 + Math.sin(frame / 7) * 0.4;

  return (
    <SceneBackground tone="dark" index="09">
      <TopBar chapter="09" label="LEARN FROM ERROR" dark />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 142,
          width: 1100,
          color: COLORS.white,
          fontFamily: FONT,
        }}
      >
        <EaseInText delay={0}>
          <MonoTag background={COLORS.coral}>BACKPROPAGATION / UPDATE</MonoTag>
        </EaseInText>
        <EaseInText delay={3} distance={56}>
          <div
            style={{
              marginTop: 23,
              fontSize: 66,
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: -2.8,
            }}
          >
            猜错之后，
            <span style={{color: COLORS.lime}}>网络开始改自己。</span>
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          right: 92,
          top: 175,
          width: 490,
          textAlign: "right",
          color: "rgba(255,255,255,0.45)",
          fontFamily: MONO,
          fontSize: 13,
          lineHeight: 1.75,
          fontWeight: 800,
          letterSpacing: 1.5,
        }}
      >
        LOSS → GRADIENT → UPDATE
        <br />
        REPEAT UNTIL BETTER
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 306,
          width: 330,
          height: 530,
          borderRadius: 18,
          border: `3px solid ${COLORS.coral}`,
          backgroundColor: "rgba(255,91,72,0.09)",
          boxShadow: `0 0 ${36 * errorPulse}px rgba(255,91,72,0.24)`,
          padding: "20px 20px",
          opacity: interpolate(frame, [4, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${interpolate(frame, [4, 24], [45, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: COLORS.coral,
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 1.6,
          }}
        >
          <span>ERROR SIGNAL</span>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              backgroundColor: COLORS.coral,
              boxShadow: `0 0 ${16 * errorPulse}px ${COLORS.coral}`,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 20,
            color: COLORS.white,
            fontFamily: MONO,
            fontSize: 86,
            lineHeight: 0.95,
            fontWeight: 900,
            letterSpacing: -3.5,
          }}
        >
          0.58
        </div>
        <div
          style={{
            marginTop: 8,
            color: "rgba(255,255,255,0.42)",
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          PREDICTION ERROR
        </div>

        <div
          style={{
            marginTop: 25,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.14)",
            color: COLORS.white,
            fontFamily: FONT,
            fontSize: 22,
            lineHeight: 1.45,
          }}
        >
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <span style={{opacity: 0.55}}>答案</span>
            <span style={{fontWeight: 800, color: COLORS.lime}}>猫</span>
          </div>
          <div style={{display: "flex", justifyContent: "space-between", marginTop: 8}}>
            <span style={{opacity: 0.55}}>预测</span>
            <span style={{fontWeight: 800, color: COLORS.coral}}>不是猫</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 20,
            padding: "13px 14px",
            borderRadius: 9,
            border: `2px solid ${COLORS.ink}`,
            backgroundColor: COLORS.coral,
            color: COLORS.ink,
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: 800,
            lineHeight: 1.32,
          }}
        >
          差得越远，
          <br />
          下一次修正越大。
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 450,
          top: 300,
          width: 950,
          height: 536,
          borderRadius: 22,
          border: `3px solid ${backwardPhase ? COLORS.coral : COLORS.lime}`,
          backgroundColor: "rgba(255,255,255,0.035)",
          boxShadow: `0 0 46px ${backwardPhase ? "rgba(255,91,72,0.16)" : "rgba(216,255,67,0.1)"}`,
          overflow: "hidden",
          opacity: interpolate(frame, [28, 46], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [28, 48], [0.93, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: COLORS.white,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.6,
            opacity: 0.62,
          }}
        >
          <span>NETWORK / PASS {backwardPhase ? "02" : frame > 260 ? "03" : "01"}</span>
          <span style={{color: backwardPhase ? COLORS.coral : COLORS.lime}}>
            {backwardPhase ? "← BACKPROPAGATION" : "FORWARD →"}
          </span>
        </div>

        <div style={{position: "absolute", inset: "42px 24px 90px"}}>
          <NetworkGraph
            direction={backwardPhase ? "backward" : "forward"}
            pulseColor={backwardPhase ? COLORS.coral : COLORS.lime}
            pulseStrength={backwardPhase ? 1.15 : 0.75}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            bottom: 18,
            height: 57,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <WeightChip
            label="w1"
            value="+0.03"
            color={COLORS.lime}
            delay={142}
            style={{left: 8, top: -8}}
          />
          <WeightChip
            label="w2"
            value="−0.08"
            color={COLORS.coral}
            delay={160}
            style={{left: 236, top: 3}}
          />
          <WeightChip
            label="w3"
            value="+0.05"
            color={COLORS.cyan}
            delay={178}
            style={{right: 8, top: -8}}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: -49,
              color: "rgba(255,255,255,0.38)",
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.3,
            }}
          >
            WEIGHTS UPDATE BY A TINY STEP
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1420,
          top: 306,
          width: 408,
          height: 530,
          borderRadius: 20,
          border: `3px solid ${COLORS.white}`,
          backgroundColor: COLORS.paper,
          color: COLORS.ink,
          boxShadow: `10px 11px 0 ${COLORS.lime}`,
          padding: "20px 21px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.4,
            color: COLORS.muted,
          }}
        >
          <span>MODEL CONFIDENCE</span>
          <span>CAT / %</span>
        </div>

        <div style={{position: "relative", height: 168, marginTop: 20}}>
          <Burst
            size={205}
            color={COLORS.lime}
            rotate={frame * 0.45}
            style={{
              position: "absolute",
              left: 80,
              top: -17,
              opacity: frame > 478 ? 0.28 : 0,
              scale: interpolate(confidenceReached, [0, 1], [0.4, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 18,
              fontFamily: MONO,
              fontSize: 112,
              lineHeight: 0.9,
              fontWeight: 900,
              letterSpacing: -6,
              color: frame >= 470 ? COLORS.ink : COLORS.coral,
              scale: interpolate(confidenceReached, [0, 1], [0.92, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {Math.round(confidence)}
            <span style={{fontSize: 38, letterSpacing: -2}}>%</span>
          </div>
        </div>

        <div style={{marginTop: 8}}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1,
              color: COLORS.muted,
            }}
          >
            <span>42%</span>
            <span>98%</span>
          </div>
          <div
            style={{
              marginTop: 7,
              height: 17,
              border: `2px solid ${COLORS.ink}`,
              borderRadius: 4,
              backgroundColor: "rgba(21,21,21,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${confidence}%`,
                height: "100%",
                backgroundColor: confidence > 85 ? COLORS.lime : COLORS.coral,
                borderRight: `2px solid ${COLORS.ink}`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            padding: "13px 14px",
            borderRadius: 10,
            border: `2px solid ${COLORS.ink}`,
            backgroundColor: COLORS.ink,
            color: COLORS.white,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              opacity: 0.5,
            }}
          >
            <span>TRAINING STEPS</span>
            <span>REPEAT</span>
          </div>
          <div
            style={{
              marginTop: 7,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 38,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -1.2,
                color: COLORS.lime,
              }}
            >
              {trainCount.toLocaleString("en-US")}
              {frame > 458 ? "+" : ""}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 17,
                fontWeight: 700,
                opacity: 0.68,
              }}
            >
              次修正
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 21,
            right: 21,
            bottom: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: "8px 16px 7px",
              borderRadius: 999,
              border: `2px solid ${COLORS.ink}`,
              backgroundColor: frame > 486 ? COLORS.lime : COLORS.lilac,
              fontFamily: FONT,
              fontSize: 19,
              fontWeight: 900,
              opacity: interpolate(retryEnter, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(retryEnter, [0, 1], [0.6, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
            }}
          >
            {frame > 486 ? "更接近答案" : "↻ 再猜一次"}
          </div>
        </div>

        <AbsoluteFill
          style={{
            border: `8px solid ${COLORS.lime}`,
            borderRadius: 20,
            opacity: frame > 482 ? 0.22 + Math.sin(frame / 8) * 0.12 : 0,
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 93,
          top: 884,
          display: "flex",
          alignItems: "center",
          gap: 13,
          color: COLORS.white,
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 1.6,
          opacity: 0.5,
        }}
      >
        <span>GUESS</span>
        <span style={{color: COLORS.coral}}>→</span>
        <span>ERROR</span>
        <span style={{color: COLORS.coral}}>→</span>
        <span>UPDATE</span>
        <span style={{color: COLORS.lime}}>→</span>
        <span>GUESS BETTER</span>
      </div>
    </SceneBackground>
  );
};
