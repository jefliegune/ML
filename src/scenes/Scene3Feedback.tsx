import {
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  EaseInText,
  MonoTag,
  SceneBackground,
  TopBar,
} from "../components/Design";
import {COLORS, FONT, MONO} from "../theme";

const NeuralBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const layers = [
    [80, 180, 280, 380, 480],
    [115, 225, 335, 445],
    [175, 305, 435],
    [245, 365],
  ];
  const layerX = [42, 235, 440, 655];
  const edges: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[] = [];

  for (let layer = 0; layer < layers.length - 1; layer++) {
    for (const y1 of layers[layer]) {
      for (const y2 of layers[layer + 1]) {
        edges.push({
          x1: layerX[layer],
          y1,
          x2: layerX[layer + 1],
          y2,
        });
      }
    }
  }

  return (
    <svg
      width={720}
      height={570}
      viewBox="0 0 720 570"
      style={{position: "absolute", left: 0, top: 0, opacity: 0.72}}
    >
      {edges.map((edge, index) => (
        <line
          key={index}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke={COLORS.white}
          strokeWidth={1.15}
          opacity={index % 4 === 0 ? 0.18 : 0.075}
        />
      ))}
      {layers.map((ys, layerIndex) =>
        ys.map((y, nodeIndex) => {
          const pulse = 0.52 + Math.sin(frame / 9 + layerIndex + nodeIndex) * 0.22;
          return (
            <g key={`${layerIndex}-${nodeIndex}`}>
              <circle
                cx={layerX[layerIndex]}
                cy={y}
                r={13}
                fill={layerIndex === layers.length - 1 ? COLORS.lime : COLORS.ink}
                stroke={COLORS.white}
                strokeWidth={2}
                opacity={0.9}
              />
              <circle
                cx={layerX[layerIndex]}
                cy={y}
                r={3.3}
                fill={layerIndex === layers.length - 1 ? COLORS.ink : COLORS.cyan}
                opacity={pulse}
              />
            </g>
          );
        }),
      )}
      {edges
        .filter((_, index) => index % 11 === 0)
        .map((edge, index) => {
          const t = ((frame / 42 + index * 0.27) % 1 + 1) % 1;
          return (
            <circle
              key={`pulse-${index}`}
              cx={edge.x1 + (edge.x2 - edge.x1) * t}
              cy={edge.y1 + (edge.y2 - edge.y1) * t}
              r={4.2}
              fill={COLORS.lime}
              opacity={0.75 - Math.abs(t - 0.5) * 0.6}
            />
          );
        })}
    </svg>
  );
};

const WeightChip: React.FC<{
  label: string;
  value: string;
  delay: number;
  color: string;
  style: React.CSSProperties;
}> = ({label, value, delay, color, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 12, stiffness: 180, mass: 0.68},
    durationInFrames: 17,
  });

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px 8px",
        borderRadius: 10,
        border: `2px solid ${COLORS.white}55`,
        backgroundColor: COLORS.ink,
        color: COLORS.white,
        fontFamily: MONO,
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: 0.4,
        boxShadow: `0 0 0 1px ${COLORS.ink}`,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        rotate: `${interpolate(enter, [0, 1], [-7, 0])}deg`,
        ...style,
      }}
    >
      <span style={{color: COLORS.white, opacity: 0.62}}>{label}</span>
      <span style={{color}}>{value}</span>
    </div>
  );
};

export const Scene3Feedback: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const accuracy = interpolate(frame, [32, 60], [0.42, 0.98], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringColor = interpolateColors(
    frame,
    [30, 58],
    [COLORS.coral, COLORS.lime],
  );
  const fixed = frame >= 54;
  const radius = 132;
  const circumference = Math.PI * 2 * radius;
  const cardEnter = spring({
    frame: frame - 3,
    fps,
    config: {damping: 16, stiffness: 115, mass: 0.9},
    durationInFrames: 26,
  });
  const errorEnter = spring({
    frame: frame - 13,
    fps,
    config: {damping: 11, stiffness: 185, mass: 0.65},
    durationInFrames: 20,
  });

  return (
    <SceneBackground tone="dark" index="03">
      <TopBar chapter="03" label="ERROR = SIGNAL" dark />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 199,
          width: 890,
          fontFamily: FONT,
          color: COLORS.white,
        }}
      >
        <EaseInText delay={0} distance={25}>
          <MonoTag background={COLORS.lime}>STEP 02 / FEEDBACK LOOP</MonoTag>
        </EaseInText>

        <div
          style={{
            marginTop: 33,
            fontSize: 108,
            lineHeight: 1.04,
            fontWeight: 800,
            letterSpacing: -3.8,
          }}
        >
          <EaseInText delay={3} distance={68}>
            <div>猜错一次，</div>
          </EaseInText>
          <EaseInText delay={8} distance={76}>
            <div style={{marginTop: 4}}>
              就
              <span
                style={{
                  display: "inline-block",
                  color: COLORS.ink,
                  backgroundColor: COLORS.lime,
                  border: `4px solid ${COLORS.white}`,
                  borderRadius: 16,
                  padding: "0 15px 8px",
                  margin: "0 4px",
                  rotate: "1.2deg",
                  boxShadow: `8px 9px 0 ${COLORS.blue}`,
                }}
              >
                修正
              </span>
              一点。
            </div>
          </EaseInText>
        </div>

        <EaseInText delay={14} distance={30}>
          <div
            style={{
              marginTop: 38,
              maxWidth: 700,
              fontSize: 29,
              lineHeight: 1.52,
              fontWeight: 500,
              color: "rgba(255,255,255,0.62)",
            }}
          >
            误差不是失败。
            <br />
            它告诉模型：下一次，该往哪个方向调。
          </div>
        </EaseInText>

        <EaseInText delay={20} distance={24}>
          <div
            style={{
              marginTop: 48,
              display: "flex",
              alignItems: "center",
              gap: 15,
              fontFamily: MONO,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 1.9,
              color: COLORS.lime,
            }}
          >
            <div style={{display: "flex", gap: 6}}>
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 99,
                    backgroundColor:
                      frame > 17 + index * 6 ? COLORS.lime : `${COLORS.white}33`,
                  }}
                />
              ))}
            </div>
            PREDICT → COMPARE → UPDATE
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1028,
          top: 190,
          width: 748,
          height: 610,
          opacity: 0.52,
        }}
      >
        <NeuralBackdrop />
      </div>

      <div
        style={{
          position: "absolute",
          left: 1032,
          top: 273,
          width: 756,
          height: 408,
          borderRadius: 25,
          border: `4px solid ${COLORS.white}38`,
          backgroundColor: "rgba(14,14,14,0.93)",
          boxShadow: `16px 17px 0 ${COLORS.blue}`,
          opacity: interpolate(cardEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(cardEnter, [0, 1], [0.84, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          translate: `0px ${interpolate(cardEnter, [0, 1], [46, 0])}px`,
          overflow: "hidden",
          fontFamily: FONT,
          color: COLORS.white,
        }}
      >
        <div
          style={{
            height: 58,
            borderBottom: `1px solid ${COLORS.white}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 22px",
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 1.8,
          }}
        >
          <span style={{color: COLORS.lime}}>MODEL OUTPUT / EPOCH 01</span>
          <span style={{opacity: 0.5}}>LOSS = 0.56</span>
        </div>

        <div
          style={{
            height: 350,
            display: "flex",
            alignItems: "center",
            padding: "0 29px",
            gap: 24,
          }}
        >
          <div style={{position: "relative", width: 305, height: 305}}>
            <svg width={305} height={305} viewBox="0 0 305 305">
              <circle
                cx={152.5}
                cy={152.5}
                r={radius}
                fill="none"
                stroke={`${COLORS.white}18`}
                strokeWidth={18}
              />
              <circle
                cx={152.5}
                cy={152.5}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={18}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - accuracy)}
                transform="rotate(-90 152.5 152.5)"
                style={{filter: `drop-shadow(0 0 12px ${ringColor}66)`}}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 89,
                  lineHeight: 0.95,
                  fontWeight: 800,
                  letterSpacing: -5,
                  color: ringColor,
                }}
              >
                {Math.round(accuracy * 100)}%
              </div>
              <div
                style={{
                  marginTop: 11,
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 1.7,
                  opacity: 0.54,
                }}
              >
                CONFIDENCE
              </div>
            </div>
          </div>

          <div style={{flex: 1}}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 1.8,
                opacity: 0.47,
              }}
            >
              PREDICTION
            </div>
            <div
              style={{
                marginTop: 11,
                fontSize: 72,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              这是猫
            </div>
            <div
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "10px 14px 9px",
                borderRadius: 9,
                backgroundColor: fixed ? COLORS.lime : COLORS.coral,
                color: COLORS.ink,
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: 0.6,
                rotate: fixed ? "-1deg" : "1.5deg",
              }}
            >
              {fixed ? "UPDATE +0.56" : "ERROR −0.56"}
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 20,
                lineHeight: 1.45,
                fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {fixed ? "权重已更新，再来一次。" : "差距被算出来，准备回传。"}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1034,
          top: 716,
          width: 754,
          height: 84,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: 1.3,
          color: COLORS.white,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 58,
            borderRadius: 13,
            border: `2px solid ${COLORS.white}28`,
            backgroundColor: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
          }}
        >
          <span>PREDICT</span>
          <span style={{color: COLORS.coral}}>−56</span>
          <span>COMPARE</span>
          <span style={{color: COLORS.lime}}>+1 STEP</span>
          <span>UPDATE</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 62,
          top: 225,
          width: 132,
          height: 78,
          borderRadius: 13,
          border: `3px solid ${COLORS.white}`,
          backgroundColor: COLORS.coral,
          color: COLORS.ink,
          fontFamily: MONO,
          fontSize: 26,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          rotate: "7deg",
          opacity: interpolate(errorEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(errorEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        {fixed ? "FIX!" : "ERROR"}
      </div>

      <WeightChip
        label="w1"
        value="+0.03"
        delay={49}
        color={COLORS.lime}
        style={{left: 992, top: 530}}
      />
      <WeightChip
        label="w2"
        value="−0.08"
        delay={53}
        color={COLORS.coral}
        style={{left: 1715, top: 490}}
      />
      <WeightChip
        label="w3"
        value="+0.12"
        delay={57}
        color={COLORS.cyan}
        style={{left: 1768, top: 610}}
      />

      <div
        style={{
          position: "absolute",
          left: 1038,
          top: 826,
          width: 754,
          height: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 1.8,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        <span>BACKPROPAGATION</span>
        <span>ONE SMALL CORRECTION AT A TIME</span>
      </div>
    </SceneBackground>
  );
};


