import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CatPortrait,
  EaseInText,
  MonoTag,
  SceneBackground,
  TopBar,
} from "../../components/Design";
import {COLORS, FONT, MONO} from "../../theme";
import {NetworkGraph} from "../components/NetworkGraph";

const PixelVeil: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gridTemplateRows: "repeat(8, 1fr)",
        padding: 30,
        pointerEvents: "none",
      }}
    >
      {Array.from({length: 64}, (_, index) => (
        <div
          key={index}
          style={{
            border: "1px solid rgba(21,21,21,0.13)",
            backgroundColor:
              index % 7 === 0
                ? "rgba(51,85,255,0.12)"
                : index % 5 === 0
                  ? "rgba(216,255,67,0.18)"
                  : "transparent",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const ProbabilityRow: React.FC<{
  label: string;
  value: number;
  color: string;
  barProgress: number;
}> = ({label, value, color, barProgress}) => {
  return (
    <div style={{marginTop: 23}}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 9,
        }}
      >
        <span style={{fontSize: 26, fontWeight: 800}}>{label}</span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 46,
            lineHeight: 0.9,
            fontWeight: 900,
            letterSpacing: -1.5,
          }}
        >
          {Math.round(value)}
          <span style={{fontSize: 22, marginLeft: 2}}>%</span>
        </span>
      </div>
      <div
        style={{
          height: 18,
          borderRadius: 4,
          border: `2px solid ${COLORS.ink}`,
          backgroundColor: "rgba(21,21,21,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            backgroundColor: color,
            borderRight: value > 4 ? `2px solid ${COLORS.ink}` : "none",
            scale: `${Math.max(barProgress, 0.001)} 1`,
            transformOrigin: "left center",
          }}
        />
      </div>
    </div>
  );
};

const WrongStamp: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - 432,
    fps,
    config: {damping: 9, stiffness: 190, mass: 0.72},
    durationInFrames: 18,
  });

  if (frame < 428) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        top: 166,
        width: 332,
        padding: "18px 16px 17px",
        border: `5px solid ${COLORS.ink}`,
        borderRadius: 12,
        backgroundColor: COLORS.coral,
        color: COLORS.ink,
        boxShadow: `9px 10px 0 ${COLORS.ink}`,
        rotate: "-8deg",
        textAlign: "center",
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [1.7, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
      }}
    >
      <div style={{fontSize: 48, lineHeight: 1, fontWeight: 900, letterSpacing: 2}}>
        猜错了
      </div>
      <div
        style={{
          marginTop: 7,
          fontFamily: MONO,
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 4.2,
        }}
      >
        WRONG / TRY AGAIN
      </div>
    </div>
  );
};

export const SceneModel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cardShake =
    frame >= 430
      ? Math.sin((frame - 430) * 1.8) *
        9 *
        (1 -
          spring({
            frame: frame - 430,
            fps,
            config: {damping: 12, stiffness: 150, mass: 0.6},
            durationInFrames: 16,
          }))
      : 0;
  const probProgress = spring({
    frame: frame - 292,
    fps,
    config: {damping: 18, stiffness: 105, mass: 0.9},
    durationInFrames: 40,
  });
  const catProbability = 42 * probProgress;
  const notCatProbability = 58 * probProgress;
  const answerReveal = spring({
    frame: frame - 436,
    fps,
    config: {damping: 14, stiffness: 150, mass: 0.7},
    durationInFrames: 18,
  });

  return (
    <SceneBackground index="08">
      <TopBar chapter="08" label="MAKE A PREDICTION" />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 148,
          width: 880,
          color: COLORS.ink,
          fontFamily: FONT,
        }}
      >
        <EaseInText delay={0}>
          <MonoTag background={COLORS.lime}>FORWARD PASS / ONE GUESS</MonoTag>
        </EaseInText>
        <EaseInText delay={3} distance={54}>
          <div
            style={{
              marginTop: 24,
              fontSize: 66,
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: -2.7,
            }}
          >
            一层层计算，
            <span style={{color: COLORS.blue}}>挤出一个概率。</span>
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 330,
          width: 420,
          height: 520,
          borderRadius: 20,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.paper,
          boxShadow: `11px 12px 0 ${COLORS.ink}`,
          overflow: "hidden",
          opacity: interpolate(frame, [2, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${interpolate(frame, [2, 22], [54, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px`,
        }}
      >
        <div
          style={{
            height: 48,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${COLORS.ink}`,
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 1.4,
          }}
        >
          <span>INPUT / IMAGE_0042</span>
          <span style={{color: COLORS.blue}}>32 × 32 × 3</span>
        </div>

        <div
          style={{
            height: 365,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, rgba(216,255,67,0.48), rgba(255,255,255,0) 60%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 286,
              height: 286,
              borderRadius: "50%",
              backgroundColor: COLORS.lime,
              border: `2px solid ${COLORS.ink}`,
            }}
          />
          <CatPortrait
            size={286}
            color={COLORS.coral}
            variant={1}
            style={{position: "relative"}}
          />
          {frame > 182 ? <PixelVeil /> : null}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 22 + ((frame * 2.7) % 315),
              height: 3,
              backgroundColor: COLORS.blue,
              boxShadow: `0 0 16px ${COLORS.blue}`,
              opacity: frame > 182 ? 0.7 : 0,
            }}
          />
        </div>

        <div
          style={{
            height: 104,
            borderTop: `2px solid ${COLORS.ink}`,
            padding: "15px 17px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.6,
              color: COLORS.muted,
            }}
          >
            WHAT THE MODEL RECEIVES
          </div>
          <div style={{marginTop: 8, fontSize: 27, lineHeight: 1.16, fontWeight: 800}}>
            猫图不再像猫,
            <br />
            只是一组像素值。
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 555,
          top: 302,
          width: 790,
          height: 548,
          borderRadius: 22,
          border: `4px solid ${COLORS.white}`,
          backgroundColor: COLORS.ink,
          boxShadow: `14px 15px 0 ${COLORS.blue}`,
          overflow: "hidden",
          opacity: interpolate(frame, [62, 84], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [62, 88], [0.92, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: COLORS.white,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.8,
            opacity: 0.65,
          }}
        >
          <span>NEURAL NETWORK / 4 → 5 → 3 → 2</span>
          <span style={{color: COLORS.lime}}>SIGNAL FLOW →</span>
        </div>

        <div style={{position: "absolute", inset: "42px 38px 46px"}}>
          <NetworkGraph direction="forward" pulseColor={COLORS.lime} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 14,
            display: "flex",
            justifyContent: "space-between",
            color: COLORS.white,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.2,
          }}
        >
          <span>× WEIGHT</span>
          <span style={{color: COLORS.cyan}}>+ BIAS</span>
          <span style={{color: COLORS.lilac}}>→ ACTIVATION</span>
          <span style={{color: COLORS.lime}}>→ NEXT LAYER</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1380,
          top: 302,
          width: 448,
          height: 548,
          borderRadius: 22,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.paper,
          boxShadow: `11px 12px 0 ${COLORS.coral}`,
          padding: "21px 24px",
          translate: `${cardShake}px 0px`,
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
            letterSpacing: 1.5,
            color: COLORS.muted,
          }}
        >
          <span>PREDICTION</span>
          <span>SOFTMAX</span>
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 32,
            lineHeight: 1.1,
            fontWeight: 900,
            letterSpacing: -0.6,
          }}
        >
          模型觉得，
          <br />
          这是猫吗？
        </div>

        <div
          style={{
            marginTop: 24,
            borderTop: `2px solid ${COLORS.ink}22`,
            paddingTop: 8,
          }}
        >
          <ProbabilityRow
            label="这是猫"
            value={catProbability}
            color={COLORS.lime}
            barProgress={probProgress}
          />
          <ProbabilityRow
            label="不是猫"
            value={notCatProbability}
            color={COLORS.coral}
            barProgress={probProgress}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 22,
            padding: "12px 14px",
            borderRadius: 9,
            border: `2px solid ${COLORS.ink}`,
            backgroundColor: COLORS.ink,
            color: COLORS.white,
            fontFamily: FONT,
            opacity: interpolate(answerReveal, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: `0px ${interpolate(answerReveal, [0, 1], [18, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px`,
          }}
        >
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <span style={{fontSize: 21, fontWeight: 700}}>标准答案：这是猫</span>
            <span style={{fontFamily: MONO, fontSize: 17, fontWeight: 900, color: COLORS.coral}}>
              ERROR 0.58
            </span>
          </div>
        </div>

        <WrongStamp />
      </div>

      <div
        style={{
          position: "absolute",
          left: 93,
          top: 894,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: COLORS.ink,
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 1.7,
          opacity: 0.55,
        }}
      >
        <span>IMAGE</span>
        <span>→</span>
        <span>NUMBERS</span>
        <span>→</span>
        <span>LAYERS</span>
        <span>→</span>
        <span style={{color: COLORS.coral}}>A GUESS</span>
        <span style={{width: 76, height: 2, backgroundColor: COLORS.blue}} />
      </div>
    </SceneBackground>
  );
};
