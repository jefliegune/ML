import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Burst,
  CatPortrait,
  EaseInText,
  MonoTag,
  SceneBackground,
  TopBar,
} from "../../components/Design";
import {COLORS, FONT, MONO} from "../../theme";

const MEMORIZED_CATS = [
  {color: COLORS.coral, variant: 0},
  {color: COLORS.lilac, variant: 1},
  {color: COLORS.cyan, variant: 2},
  {color: COLORS.paper, variant: 3},
  {color: "#FFD1C7", variant: 1},
  {color: COLORS.lime, variant: 0},
];

const FeaturePill: React.FC<{
  label: string;
  color: string;
  delay: number;
}> = ({label, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 13, stiffness: 170, mass: 0.7},
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 12px 7px",
        borderRadius: 8,
        border: `2px solid ${COLORS.ink}`,
        backgroundColor: color,
        fontFamily: FONT,
        fontSize: 17,
        fontWeight: 800,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `${interpolate(enter, [0, 1], [24, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px 0px`,
      }}
    >
      <span style={{fontFamily: MONO, fontSize: 11, opacity: 0.5}}>✓</span>
      {label}
    </div>
  );
};

const MemoryGrid: React.FC<{failed: number}> = ({failed}) => {
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 9,
      }}
    >
      {MEMORIZED_CATS.map((cat, index) => (
        <div
          key={index}
          style={{
            height: 112,
            borderRadius: 10,
            border: `2px solid ${COLORS.white}33`,
            backgroundColor: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CatPortrait
            size={103}
            color={cat.color}
            variant={cat.variant}
            style={{translate: "0px 9px"}}
          />
          <span
            style={{
              position: "absolute",
              left: 6,
              top: 5,
              fontFamily: MONO,
              fontSize: 8,
              fontWeight: 900,
              color: COLORS.white,
              opacity: 0.38,
            }}
          >
            #{String(index + 1).padStart(3, "0")}
          </span>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          inset: -5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `rgba(255,91,72,${failed * 0.2})`,
          opacity: failed,
          border: `4px solid ${COLORS.coral}`,
          borderRadius: 12,
          color: COLORS.coral,
          fontFamily: MONO,
          fontSize: 54,
          fontWeight: 900,
          rotate: "-4deg",
        }}
      >
        NO MATCH
      </div>
    </div>
  );
};

const NewSampleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - 96,
    fps,
    config: {damping: 13, stiffness: 145, mass: 0.84},
    durationInFrames: 24,
  });
  const success = spring({
    frame: frame - 294,
    fps,
    config: {damping: 12, stiffness: 160, mass: 0.7},
    durationInFrames: 20,
  });
  const active = frame >= 96;

  if (!active) {
    return (
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 362,
          width: 400,
          height: 430,
          borderRadius: 20,
          border: `4px dashed ${COLORS.ink}66`,
          backgroundColor: "rgba(255,253,244,0.64)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.ink,
          opacity: interpolate(frame, [28, 45], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: 1.8, opacity: 0.46}}>
          NEW SAMPLE
        </div>
        <div style={{fontSize: 132, lineHeight: 1, fontWeight: 900, marginTop: 12}}>?</div>
        <div style={{marginTop: 10, fontFamily: FONT, fontSize: 21, fontWeight: 700, opacity: 0.52}}>
          等待没见过的新猫
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 760,
        top: 362,
        width: 400,
        height: 430,
        borderRadius: 20,
        border: `4px solid ${COLORS.ink}`,
        backgroundColor: COLORS.paper,
        boxShadow: success > 0.05
          ? `11px 12px 0 ${COLORS.lime}`
          : `11px 12px 0 ${COLORS.coral}`,
        overflow: "hidden",
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0px ${interpolate(enter, [0, 1], [-76, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px`,
        rotate: `${interpolate(enter, [0, 1], [-5, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}deg`,
        scale: interpolate(success, [0, 1], [1, 1.025], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          height: 50,
          borderBottom: `2px solid ${COLORS.ink}`,
          padding: "0 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.3,
        }}
      >
        <span>TEST / UNSEEN_001</span>
        <span
          style={{
            padding: "4px 7px 3px",
            borderRadius: 999,
            backgroundColor: COLORS.blue,
            color: COLORS.white,
          }}
        >
          NEW
        </span>
      </div>

      <div
        style={{
          height: 289,
          background:
            "radial-gradient(circle at 50% 47%, rgba(78,216,210,0.55) 0%, rgba(78,216,210,0) 64%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Burst
          size={270}
          color={COLORS.lime}
          rotate={frame * 0.32}
          style={{
            position: "absolute",
            opacity: success > 0.05 ? 0.28 : 0,
            scale: interpolate(success, [0, 1], [0.5, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <CatPortrait size={278} color="#FFB84E" variant={3} style={{position: "relative"}} />
      </div>

      <div
        style={{
          height: 87,
          borderTop: `2px solid ${COLORS.ink}`,
          padding: "12px 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{fontSize: 26, lineHeight: 1.1, fontWeight: 900}}>新猫</div>
          <div style={{marginTop: 5, fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: 1.1, color: COLORS.muted}}>
            NOT IN TRAINING SET
          </div>
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 900,
            color: success > 0.05 ? COLORS.ink : COLORS.coral,
            padding: "7px 9px 6px",
            borderRadius: 7,
            border: `2px solid ${COLORS.ink}`,
            backgroundColor: success > 0.05 ? COLORS.lime : COLORS.coral,
          }}
        >
          {success > 0.05 ? "CAT 98%" : "?"}
        </div>
      </div>
    </div>
  );
};

export const SceneGeneralize: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fail = spring({
    frame: frame - 204,
    fps,
    config: {damping: 11, stiffness: 180, mass: 0.65},
    durationInFrames: 18,
  });
  const success = spring({
    frame: frame - 294,
    fps,
    config: {damping: 10, stiffness: 165, mass: 0.76},
    durationInFrames: 22,
  });
  const leftShake =
    frame >= 204
      ? Math.sin((frame - 204) * 1.6) * 5 * (1 - fail)
      : 0;

  return (
    <SceneBackground index="10">
      <TopBar chapter="10" label="GENERALIZE / NEW DATA" />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 138,
          width: 1120,
          color: COLORS.ink,
          fontFamily: FONT,
        }}
      >
        <EaseInText delay={0}>
          <MonoTag background={COLORS.coral}>THE REAL TEST / UNSEEN DATA</MonoTag>
        </EaseInText>
        <EaseInText delay={3} distance={54}>
          <div
            style={{
              marginTop: 23,
              fontSize: 64,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: -2.7,
            }}
          >
            真正的考验，
            <span style={{color: COLORS.blue}}>是没见过的新猫。</span>
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          right: 92,
          top: 180,
          width: 430,
          textAlign: "right",
          fontFamily: MONO,
          fontSize: 13,
          lineHeight: 1.7,
          fontWeight: 900,
          letterSpacing: 1.6,
          color: COLORS.ink,
          opacity: 0.46,
        }}
      >
        MEMORIZE ≠ LEARN
        <br />
        PATTERN &gt; ANSWER KEY
      </div>

      <div
        style={{
          position: "absolute",
          left: 86,
          top: 306,
          width: 650,
          height: 520,
          borderRadius: 22,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.ink,
          color: COLORS.white,
          boxShadow: `11px 12px 0 ${COLORS.coral}`,
          padding: "19px 20px",
          translate: `${leftShake}px 0px`,
          opacity: interpolate(frame, [12, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.6,
                color: COLORS.coral,
              }}
            >
              MODEL A / MEMORIZER
            </div>
            <div
              style={{
                marginTop: 7,
                fontFamily: FONT,
                fontSize: 37,
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              背答案模型
            </div>
          </div>
          <div
            style={{
              padding: "7px 10px 6px",
              borderRadius: 999,
              border: `2px solid ${COLORS.white}33`,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.1,
              opacity: 0.7,
            }}
          >
            10,000 MEMORIZED
          </div>
        </div>

        <div style={{marginTop: 20}}>
          <MemoryGrid failed={fail} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 20,
            height: 100,
            borderRadius: 12,
            border: `2px solid ${frame >= 204 ? COLORS.coral : `${COLORS.white}33`}`,
            backgroundColor:
              frame >= 204 ? "rgba(255,91,72,0.15)" : "rgba(255,255,255,0.05)",
            padding: "14px 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 1.2,
                color: frame >= 204 ? COLORS.coral : "rgba(255,255,255,0.42)",
              }}
            >
              {frame >= 204 ? "INPUT NOT IN MEMORY" : "LOOKUP TABLE"}
            </div>
            <div style={{marginTop: 7, fontSize: 23, fontWeight: 800}}>
              {frame >= 204 ? "这张图，记忆里没有。" : "只认识背过的样本。"}
            </div>
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 27,
              fontWeight: 900,
              color: COLORS.coral,
              whiteSpace: "nowrap",
              opacity: interpolate(fail, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(fail, [0, 1], [0.6, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
            }}
          >
            卡住
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1184,
          top: 306,
          width: 650,
          height: 520,
          borderRadius: 22,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.paper,
          color: COLORS.ink,
          boxShadow: `11px 12px 0 ${COLORS.lime}`,
          padding: "19px 20px",
          overflow: "hidden",
          opacity: interpolate(frame, [16, 34], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Burst
          size={310}
          color={COLORS.lime}
          rotate={frame * 0.35}
          style={{
            position: "absolute",
            right: -70,
            top: -88,
            opacity: success > 0.05 ? 0.32 : 0.08,
            scale: interpolate(success, [0, 1], [0.55, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        <div style={{position: "relative"}}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1.6,
                  color: COLORS.blue,
                }}
              >
                MODEL B / PATTERN LEARNER
              </div>
              <div
                style={{
                  marginTop: 7,
                  fontFamily: FONT,
                  fontSize: 37,
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                学规律模型
              </div>
            </div>
            <div
              style={{
                padding: "7px 10px 6px",
                borderRadius: 999,
                border: `2px solid ${COLORS.ink}`,
                backgroundColor: COLORS.cyan,
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 1.1,
              }}
            >
              FEATURES NOT ANSWERS
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              padding: "16px 15px",
              borderRadius: 12,
              border: `2px solid ${COLORS.ink}22`,
              backgroundColor: "rgba(255,255,255,0.68)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 1.1,
                color: COLORS.muted,
              }}
            >
              <span>EXTRACTING PATTERNS</span>
              <span>EDGE / EAR / SHAPE</span>
            </div>
            <div style={{display: "flex", gap: 9, marginTop: 13}}>
              <FeaturePill label="边缘" color={COLORS.cyan} delay={48} />
              <FeaturePill label="耳朵" color={COLORS.lilac} delay={58} />
              <FeaturePill label="轮廓" color={COLORS.lime} delay={68} />
            </div>
            <div
              style={{
                marginTop: 16,
                height: 3,
                backgroundColor: "rgba(21,21,21,0.1)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: `${interpolate(frame, [66, 116], [0, 96], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}%`,
                  top: -6,
                  width: 15,
                  height: 15,
                  borderRadius: 99,
                  backgroundColor: COLORS.blue,
                  boxShadow: `0 0 14px ${COLORS.blue}`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 15,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 9,
            }}
          >
            {[
              {value: "0.97", label: "耳形", color: COLORS.lime},
              {value: "0.94", label: "轮廓", color: COLORS.lilac},
              {value: "0.91", label: "纹理", color: COLORS.cyan},
            ].map((item, index) => (
              <div
                key={item.label}
                style={{
                  padding: "10px 11px 9px",
                  borderRadius: 9,
                  border: `2px solid ${COLORS.ink}`,
                  backgroundColor: item.color,
                  opacity: interpolate(success, [0, 1], [0.55, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  translate: `${interpolate(success, [0, 1], [0, -4 - index * 2], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}px 0px`,
                }}
              >
                <div style={{fontFamily: MONO, fontSize: 22, lineHeight: 1, fontWeight: 900}}>
                  {item.value}
                </div>
                <div style={{marginTop: 5, fontFamily: FONT, fontSize: 14, fontWeight: 800}}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 15,
              height: 95,
              padding: "13px 15px",
              borderRadius: 11,
              border: `2px solid ${COLORS.ink}`,
              backgroundColor: COLORS.ink,
              color: COLORS.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: interpolate(success, [0, 1], [0.16, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(success, [0, 1], [0.92, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 1.2,
                  color: COLORS.lime,
                }}
              >
                {success > 0.05 ? "PATTERN MATCHED" : "WAITING FOR SAMPLE"}
              </div>
              <div style={{marginTop: 7, fontSize: 24, fontWeight: 800}}>
                {success > 0.05 ? "CAT 98%" : "不背答案，也能判断"}
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 42,
                lineHeight: 1,
                fontWeight: 900,
                color: COLORS.lime,
                rotate: "-3deg",
              }}
            >
              {success > 0.05 ? "举一反三" : "…"}
            </div>
          </div>
        </div>
      </div>

      <NewSampleCard />

      <div
        style={{
          position: "absolute",
          left: 93,
          top: 878,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: COLORS.ink,
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 1.7,
          opacity: 0.52,
        }}
      >
        <span>MEMORIZE</span>
        <span style={{color: COLORS.coral}}>✕</span>
        <span>GENERALIZE</span>
        <span style={{color: COLORS.blue}}>→</span>
        <span>SEE THE PATTERN, NOT THE ANSWER</span>
      </div>
    </SceneBackground>
  );
};
