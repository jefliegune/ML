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
} from "../components/Design";
import {COLORS, FONT, MONO} from "../theme";

const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pieces = [
    {x: 320, y: 300, color: COLORS.coral, shape: "square", delay: 7},
    {x: 1585, y: 286, color: COLORS.blue, shape: "circle", delay: 8},
    {x: 1450, y: 205, color: COLORS.cyan, shape: "square", delay: 11},
    {x: 430, y: 620, color: COLORS.blue, shape: "circle", delay: 13},
    {x: 1510, y: 610, color: COLORS.coral, shape: "square", delay: 15},
    {x: 257, y: 488, color: COLORS.lime, shape: "circle", delay: 16},
    {x: 1664, y: 478, color: COLORS.lime, shape: "square", delay: 18},
  ];

  return (
    <AbsoluteFill>
      {pieces.map((piece, index) => {
        const enter = spring({
          frame: frame - piece.delay,
          fps,
          config: {damping: 13, stiffness: 150, mass: 0.7},
          durationInFrames: 20,
        });
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: piece.x,
              top: piece.y,
              width: piece.shape === "circle" ? 22 : 27,
              height: piece.shape === "circle" ? 22 : 27,
              borderRadius: piece.shape === "circle" ? 99 : 4,
              backgroundColor: piece.color,
              border: `2px solid ${COLORS.ink}`,
              opacity: interpolate(enter, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(enter, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
              rotate: `${interpolate(enter, [0, 1], [index % 2 ? 80 : -80, index % 2 ? 20 : -24])}deg`,
              translate: `${interpolate(enter, [0, 1], [index % 2 ? 48 : -48, 0])}px ${interpolate(enter, [0, 1], [index % 3 ? -38 : 38, 0])}px`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const StepCard: React.FC<{
  index: number;
  label: string;
  chinese: string;
  delay: number;
  background: string;
  foreground: string;
  children: React.ReactNode;
}> = ({index, label, chinese, delay, background, foreground, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 150, mass: 0.78},
    durationInFrames: 23,
  });

  return (
    <div
      style={{
        width: 244,
        height: 112,
        borderRadius: 16,
        border: `4px solid ${COLORS.ink}`,
        backgroundColor: background,
        color: foreground,
        boxShadow: `8px 9px 0 ${COLORS.ink}`,
        padding: "13px 15px 10px",
        fontFamily: FONT,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.66, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        translate: `0px ${interpolate(enter, [0, 1], [42, 0])}px`,
        rotate: `${interpolate(enter, [0, 1], [index % 2 ? 4 : -4, index === 2 ? 1.2 : 0])}deg`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.4,
          opacity: 0.72,
        }}
      >
        <span>0{index + 1} / {label}</span>
        <span>{children}</span>
      </div>
      <div
        style={{
          marginTop: 9,
          fontSize: 37,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        {chinese}
      </div>
    </div>
  );
};

const FlowArrow: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 15, stiffness: 170, mass: 0.7},
    durationInFrames: 16,
  });

  return (
    <div
      style={{
        width: 67,
        height: 26,
        position: "relative",
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.2, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 10,
          top: 11,
          height: 4,
          borderRadius: 99,
          backgroundColor: COLORS.ink,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 2,
          width: 22,
          height: 22,
          borderTop: `4px solid ${COLORS.ink}`,
          borderRight: `4px solid ${COLORS.ink}`,
          rotate: "45deg",
        }}
      />
    </div>
  );
};

export const Scene4Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleEnter = spring({
    frame: frame - 4,
    fps,
    config: {damping: 14, stiffness: 115, mass: 0.92},
    durationInFrames: 25,
  });
  const blockEnter = spring({
    frame: frame - 8,
    fps,
    config: {damping: 12, stiffness: 150, mass: 0.76},
    durationInFrames: 22,
  });

  return (
    <SceneBackground index="04">
      <TopBar chapter="04" label="THE BIG IDEA" />
      <Confetti />

      <Burst
        size={670}
        color={COLORS.blue}
        rotate={frame * 0.28}
        style={{
          position: "absolute",
          left: 640,
          top: 220,
          opacity: 0.12,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 178,
          display: "flex",
          justifyContent: "center",
          fontFamily: FONT,
          color: COLORS.ink,
        }}
      >
        <EaseInText delay={1} distance={26}>
          <MonoTag background={COLORS.paper}>THE BIG IDEA / SO THAT’S IT</MonoTag>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 274,
          textAlign: "center",
          fontFamily: FONT,
          color: COLORS.ink,
        }}
      >
        <div
          style={{
            fontSize: 92,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: -2,
            opacity: interpolate(titleEnter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: `0px ${interpolate(titleEnter, [0, 1], [38, 0])}px`,
          }}
        >
          这，就是
        </div>

        <div
          style={{
            marginTop: 22,
            fontSize: 192,
            lineHeight: 0.94,
            fontWeight: 800,
            letterSpacing: -8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            opacity: interpolate(blockEnter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(blockEnter, [0, 1], [0.82, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
            translate: `0px ${interpolate(blockEnter, [0, 1], [66, 0])}px`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              backgroundColor: COLORS.lime,
              border: `5px solid ${COLORS.ink}`,
              borderRadius: 24,
              padding: "3px 24px 18px",
              boxShadow: `12px 14px 0 ${COLORS.ink}`,
              rotate: "-0.7deg",
            }}
          >
            机器学习
          </span>
          <span style={{color: COLORS.coral, fontSize: 208}}>。</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 665,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 21,
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: 2.2,
          color: COLORS.ink,
          opacity: interpolate(frame, [18, 27], [0, 0.64], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span style={{width: 84, height: 2, backgroundColor: COLORS.ink}} />
        DATA + MODEL + FEEDBACK
        <span style={{width: 84, height: 2, backgroundColor: COLORS.ink}} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 742,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0,
        }}
      >
        <StepCard
          index={0}
          label="DATA"
          chinese="数据"
          delay={9}
          background={COLORS.paper}
          foreground={COLORS.ink}
        >
          ◉
        </StepCard>
        <FlowArrow delay={13} />
        <StepCard
          index={1}
          label="MODEL"
          chinese="模型"
          delay={15}
          background={COLORS.blue}
          foreground={COLORS.white}
        >
          ✦
        </StepCard>
        <FlowArrow delay={19} />
        <StepCard
          index={2}
          label="FEEDBACK"
          chinese="反馈"
          delay={21}
          background={COLORS.lime}
          foreground={COLORS.ink}
        >
          ↻
        </StepCard>
      </div>

      <div
        style={{
          position: "absolute",
          right: 112,
          top: 217,
          width: 135,
          height: 82,
          borderRadius: 12,
          border: `3px solid ${COLORS.ink}`,
          backgroundColor: COLORS.coral,
          boxShadow: `6px 7px 0 ${COLORS.ink}`,
          rotate: "8deg",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontWeight: 900,
          color: COLORS.ink,
          opacity: interpolate(frame, [12, 19], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [12, 19], [0.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        <span style={{fontSize: 31, lineHeight: 0.95}}>02:00</span>
        <span style={{fontSize: 11, letterSpacing: 1.2}}>FULL STORY</span>
      </div>
    </SceneBackground>
  );
};
