import {
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

const IdeaBlock: React.FC<{
  number: string;
  title: string;
  english: string;
  note: string;
  color: string;
  delay: number;
}> = ({number, title, english, note, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 145, mass: 0.8},
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        width: 334,
        height: 186,
        borderRadius: 15,
        border: `3px solid ${COLORS.ink}`,
        backgroundColor: color,
        color: COLORS.ink,
        padding: "15px 16px",
        boxShadow: `6px 7px 0 ${COLORS.ink}`,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0px ${interpolate(enter, [0, 1], [38, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px`,
        scale: interpolate(enter, [0, 1], [0.86, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
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
          letterSpacing: 1.2,
          opacity: 0.54,
        }}
      >
        <span>{number}</span>
        <span>{english}</span>
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: FONT,
          fontSize: 43,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: -1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 15,
          paddingTop: 11,
          borderTop: `2px solid ${COLORS.ink}22`,
          fontFamily: FONT,
          fontSize: 17,
          lineHeight: 1.25,
          fontWeight: 700,
          opacity: 0.68,
        }}
      >
        {note}
      </div>
    </div>
  );
};

const Times: React.FC<{delay: number}> = ({delay}) => {
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
        width: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MONO,
        fontSize: 41,
        fontWeight: 900,
        color: COLORS.ink,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.4, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
      }}
    >
      ×
    </div>
  );
};

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const headlineOut = interpolate(frame, [166, 184], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardEnter = spring({
    frame: frame - 180,
    fps,
    config: {damping: 17, stiffness: 120, mass: 0.9},
    durationInFrames: 30,
  });
  const brandEnter = spring({
    frame: frame - 206,
    fps,
    config: {damping: 18, stiffness: 130, mass: 0.8},
    durationInFrames: 24,
  });

  return (
    <SceneBackground tone="dark" index="11">
      <TopBar chapter="11" label="THE IDEA / RECAP" dark />

      <div
        style={{
          position: "absolute",
          left: 360,
          top: 70,
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          border: "1px dashed rgba(255,255,255,0.12)",
          rotate: `${frame * 0.28}deg`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 36,
            width: 16,
            height: 16,
            borderRadius: 99,
            backgroundColor: COLORS.lime,
            boxShadow: `0 0 18px ${COLORS.lime}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 152,
            top: 255,
            width: 10,
            height: 10,
            borderRadius: 99,
            backgroundColor: COLORS.coral,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 960,
          top: 558,
          width: 1020,
          height: 1020,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
          translate: "-50% -50%",
          rotate: `${-frame * 0.2}deg`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 510,
            top: -6,
            width: 12,
            height: 12,
            borderRadius: 99,
            backgroundColor: COLORS.blue,
          }}
        />
      </div>

      <Burst
        size={980}
        color={COLORS.lime}
        rotate={frame * 0.16}
        style={{
          position: "absolute",
          left: 470,
          top: -70,
          opacity: 0.07,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: COLORS.white,
          fontFamily: FONT,
          opacity: headlineOut,
        }}
      >
        <div style={{marginTop: 192}}>
          <EaseInText delay={2}>
            <MonoTag background={COLORS.lime}>AI IS NOT MAGIC / IT IS PRACTICE</MonoTag>
          </EaseInText>
        </div>

        <EaseInText delay={7} distance={66} style={{marginTop: 27}}>
          <div
            style={{
              fontSize: 138,
              lineHeight: 0.98,
              fontWeight: 900,
              letterSpacing: -7,
            }}
          >
            AI <span style={{color: COLORS.lime}}>不是</span>魔法。
          </div>
        </EaseInText>

        <div
          style={{
            marginTop: 42,
            width: 1210,
            fontSize: 53,
            lineHeight: 1.32,
            fontWeight: 700,
            letterSpacing: -1.2,
          }}
        >
          <EaseInText delay={68} distance={34}>
            <div>
              它只是把从<span style={{color: COLORS.lime}}>经验</span>中
              <span style={{color: COLORS.coral}}>修正</span>，
            </div>
          </EaseInText>
          <EaseInText delay={84} distance={34}>
            <div style={{marginTop: 3}}>
              这件事，做得<span style={{color: COLORS.cyan}}>非常快</span>。
            </div>
          </EaseInText>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 220,
          top: 236,
          width: 1480,
          height: 594,
          borderRadius: 24,
          border: `4px solid ${COLORS.white}`,
          backgroundColor: COLORS.cream,
          color: COLORS.ink,
          boxShadow: `15px 16px 0 ${COLORS.lime}`,
          padding: "27px 30px",
          opacity: interpolate(cardEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${interpolate(cardEnter, [0, 1], [58, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px`,
          scale: interpolate(cardEnter, [0, 1], [0.94, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -50,
            bottom: -100,
            width: 420,
            height: 420,
            borderRadius: "50%",
            backgroundColor: COLORS.lilac,
            opacity: 0.32,
          }}
        />

        <div
          style={{
            position: "relative",
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
                letterSpacing: 1.8,
                color: COLORS.muted,
              }}
            >
              THE WHOLE IDEA / IN ONE LINE
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: FONT,
                fontSize: 68,
                lineHeight: 0.98,
                fontWeight: 900,
                letterSpacing: -3,
              }}
            >
              机器学习
            </div>
          </div>
          <div
            style={{
              padding: "8px 12px 7px",
              borderRadius: 999,
              border: `2px solid ${COLORS.ink}`,
              backgroundColor: COLORS.ink,
              color: COLORS.lime,
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.4,
            }}
          >
            ML EXPLAINED / 02:00
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 17,
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 600,
            color: COLORS.muted,
          }}
        >
          不是手写所有规则，而是从例子里找到规律，用误差不断修正。
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IdeaBlock
            number="01"
            title="数据"
            english="DATA"
            note="成千上万个例子，\n是经验，也是教材。"
            color={COLORS.lime}
            delay={191}
          />
          <Times delay={198} />
          <IdeaBlock
            number="02"
            title="模型"
            english="MODEL"
            note="一串可调参数，\n负责找出模式。"
            color={COLORS.cyan}
            delay={196}
          />
          <Times delay={204} />
          <IdeaBlock
            number="03"
            title="反馈"
            english="FEEDBACK"
            note="每次误差，\n都变成下一次修正。"
            color={COLORS.coral}
            delay={201}
          />
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 24,
            height: 58,
            borderRadius: 10,
            border: `2px solid ${COLORS.ink}`,
            backgroundColor: COLORS.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 17px",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 1.8,
            }}
          >
            DATA × MODEL × FEEDBACK
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontFamily: FONT,
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            <span>学得更准</span>
            <span style={{color: COLORS.coral}}>↑</span>
            <span
              style={{
                width: 78,
                height: 3,
                backgroundColor: COLORS.ink,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: `${((frame - 196) * 2.3) % 100}%`,
                  top: -3,
                  width: 20,
                  height: 9,
                  backgroundColor: COLORS.lime,
                }}
              />
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 74,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 17,
          color: COLORS.white,
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 2.2,
          opacity: interpolate(brandEnter, [0, 1], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span>ML EXPLAINED</span>
        <span style={{color: COLORS.lime}}>●</span>
        <span>EPISODE 01</span>
        <span style={{color: COLORS.coral}}>●</span>
        <span>DATA → MODEL → FEEDBACK</span>
      </div>
    </SceneBackground>
  );
};
