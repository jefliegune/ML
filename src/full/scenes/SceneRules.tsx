import {
  AbsoluteFill,
  interpolate,
  Sequence,
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

const CAT_VARIATIONS = [
  {label: "无毛猫", color: COLORS.paper, variant: 2, rotate: -4, x: 947, y: 355},
  {label: "折耳猫", color: COLORS.lilac, variant: 0, rotate: 3, x: 1236, y: 318},
  {label: "花纹不同", color: COLORS.cyan, variant: 1, rotate: -2, x: 1524, y: 376},
  {label: "被遮住", color: COLORS.lime, variant: 3, rotate: 2, x: 1020, y: 630},
  {label: "睡姿", color: COLORS.paper, variant: 2, rotate: -3, x: 1310, y: 610},
  {label: "只看背影", color: "#FFD1C7", variant: 0, rotate: 3, x: 1600, y: 618},
];

const RULE_LINES = [
  'if (hasEars && hasWhiskers) return "CAT";',
  'if (hasFur && likesBox) return "CAT";',
  'if (meows && purrs) return "CAT";',
  'if (tail && fourLegs) return "CAT";',
  'if (nightVision && hatesWater) return "CAT";',
  'if (pointyEars && smallNose) return "CAT";',
  'if (orange && stripes) return "CAT";',
  'if (sleeps && ignoresYou) return "CAT";',
];

const BackOfCat: React.FC<{size: number}> = ({size}) => {
  return (
    <svg viewBox="0 0 300 300" width={size} height={size}>
      <path
        d="M68 106 L82 34 L129 72 Q150 62 171 72 L218 34 L232 106 Q250 145 238 188 Q224 257 150 264 Q76 257 62 188 Q50 145 68 106 Z"
        fill={COLORS.coral}
        stroke={COLORS.ink}
        strokeWidth={11}
        strokeLinejoin="round"
      />
      <path
        d="M150 78 L150 250 M113 98 Q129 135 118 180 M187 98 Q171 135 182 180"
        stroke={COLORS.ink}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.32}
      />
      <path
        d="M122 224 Q150 242 178 224"
        fill="none"
        stroke={COLORS.ink}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  );
};

const RuleCard: React.FC<{
  variation: (typeof CAT_VARIATIONS)[number];
  index: number;
}> = ({variation, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - 18 - index * 15,
    fps,
    config: {damping: 13, stiffness: 150, mass: 0.78},
    durationInFrames: 22,
  });
  const miss = spring({
    frame: frame - 112 - index * 12,
    fps,
    config: {damping: 10, stiffness: 200, mass: 0.62},
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: variation.x,
        top: variation.y,
        width: 250,
        height: 250,
        borderRadius: 20,
        border: `4px solid ${COLORS.ink}`,
        backgroundColor: variation.color,
        boxShadow: `10px 11px 0 ${COLORS.ink}`,
        rotate: `${variation.rotate}deg`,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.72, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        translate: `0px ${interpolate(enter, [0, 1], [80, 0])}px`,
      }}
    >
      <div
        style={{
          height: 42,
          borderBottom: `2px solid ${COLORS.ink}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        <span>CAT_TYPE_{index + 1}</span>
        <span>?</span>
      </div>
      <div
        style={{
          height: 156,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {index === 5 ? (
          <BackOfCat size={165} />
        ) : (
          <CatPortrait size={166} color={COLORS.coral} variant={variation.variant} />
        )}
      </div>
      <div
        style={{
          height: 49,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {variation.label}
      </div>

      <div
        style={{
          position: "absolute",
          right: -20,
          top: -22,
          padding: "7px 11px 6px",
          borderRadius: 8,
          border: `3px solid ${COLORS.ink}`,
          backgroundColor: COLORS.coral,
          color: COLORS.ink,
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: 0.8,
          rotate: "8deg",
          scale: interpolate(miss, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          opacity: interpolate(miss, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        MISS
      </div>
    </div>
  );
};

const RulesPhase: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ruleCount = Math.round(
    interpolate(frame, [20, 220], [1, 1204], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const failEnter = spring({
    frame: frame - 220,
    fps,
    config: {damping: 10, stiffness: 180, mass: 0.62},
    durationInFrames: 18,
  });

  return (
    <SceneBackground index="05">
      <TopBar chapter="05" label="RULE → EXAMPLE" />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 188,
          width: 820,
          fontFamily: FONT,
        }}
      >
        <EaseInText delay={1}>
          <MonoTag background={COLORS.coral}>PROGRAM 1.0 / RULE ENGINE</MonoTag>
        </EaseInText>
        <EaseInText delay={4} distance={58}>
          <div
            style={{
              marginTop: 27,
              fontSize: 104,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -3.8,
              color: COLORS.ink,
            }}
          >
            规则，写不完。
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 374,
          width: 790,
          height: 440,
          borderRadius: 22,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.ink,
          color: COLORS.white,
          boxShadow: `14px 15px 0 ${COLORS.blue}`,
          overflow: "hidden",
          fontFamily: MONO,
        }}
      >
        <div
          style={{
            height: 54,
            borderBottom: `1px solid ${COLORS.white}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          <span style={{color: COLORS.lime}}>cat-rules.js</span>
          <span style={{color: COLORS.coral}}>RULES: {ruleCount.toLocaleString("en-US")}</span>
        </div>

        <div style={{padding: "17px 21px", position: "relative"}}>
          {RULE_LINES.map((line, index) => {
            const appear = spring({
              frame: frame - 10 - index * 7,
              fps,
              config: {damping: 16, stiffness: 140, mass: 0.7},
              durationInFrames: 16,
            });
            return (
              <div
                key={line}
                style={{
                  fontSize: 21,
                  lineHeight: 1.62,
                  letterSpacing: -0.25,
                  color:
                    index % 3 === 0
                      ? COLORS.lime
                      : index % 3 === 1
                        ? COLORS.cyan
                        : COLORS.white,
                  opacity: interpolate(appear, [0, 1], [0, 0.9], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  translate: `${interpolate(appear, [0, 1], [-18, 0])}px 0px`,
                }}
              >
                <span style={{opacity: 0.35, marginRight: 12}}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {line}
              </div>
            );
          })}
          <div
            style={{
              marginTop: 16,
              color: COLORS.white,
              opacity: interpolate(frame, [150, 180], [0, 0.5], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 19,
              letterSpacing: 0.5,
            }}
          >
            + 1,196 more exceptions...
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            padding: "11px 16px 10px",
            borderRadius: 9,
            border: `3px solid ${COLORS.white}`,
            backgroundColor: COLORS.coral,
            color: COLORS.ink,
            fontFamily: MONO,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 1.1,
            rotate: "-4deg",
            scale: interpolate(failEnter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        >
          RULE FAILED
        </div>
      </div>

      {CAT_VARIATIONS.map((variation, index) => (
        <RuleCard key={variation.label} variation={variation} index={index} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 190,
          top: 844,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 1.8,
          color: COLORS.ink,
          opacity: 0.55,
        }}
      >
        <span>THE LONGER THE RULEBOOK, THE MORE IT MISSES</span>
        <span style={{width: 90, height: 2, background: COLORS.coral}} />
      </div>
    </SceneBackground>
  );
};

const beltCards = [
  {kind: "cat", color: COLORS.lime, variant: 0},
  {kind: "dog", color: "#FFD1C7", variant: 0},
  {kind: "cat", color: COLORS.paper, variant: 2},
  {kind: "cat", color: COLORS.lilac, variant: 3},
  {kind: "cat", color: COLORS.cyan, variant: 1},
  {kind: "dog", color: COLORS.paper, variant: 0},
  {kind: "cat", color: COLORS.coral, variant: 0},
  {kind: "cat", color: COLORS.lime, variant: 1},
  {kind: "cat", color: COLORS.paper, variant: 0},
  {kind: "dog", color: "#FFD1C7", variant: 0},
] as const;

const ExamplesPhase: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const countEnter = spring({
    frame: frame - 60,
    fps,
    config: {damping: 13, stiffness: 150, mass: 0.75},
    durationInFrames: 20,
  });

  return (
    <SceneBackground index="06">
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.blue,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.16) 1.2px, transparent 1.3px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 650,
          height: 650,
          borderRadius: "50%",
          right: -250,
          top: -300,
          backgroundColor: COLORS.cyan,
          opacity: 0.45,
          filter: "blur(75px)",
        }}
      />
      <TopBar chapter="05" label="RULE → EXAMPLE" dark />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 206,
          width: 760,
          color: COLORS.white,
          fontFamily: FONT,
        }}
      >
        <EaseInText delay={0}>
          <MonoTag background={COLORS.lime}>NEW APPROACH / DATA</MonoTag>
        </EaseInText>
        <EaseInText delay={3} distance={58}>
          <div
            style={{
              marginTop: 29,
              fontSize: 115,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: -4,
            }}
          >
            换个思路。
          </div>
        </EaseInText>
        <EaseInText delay={8} distance={36}>
          <div
            style={{
              marginTop: 27,
              fontSize: 42,
              lineHeight: 1.32,
              fontWeight: 650,
              color: COLORS.lime,
            }}
          >
            从“写规则”，
            <br />
            到“看例子”。
          </div>
        </EaseInText>
        <EaseInText delay={13} distance={28}>
          <div
            style={{
              marginTop: 33,
              maxWidth: 650,
              fontSize: 28,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.66)",
            }}
          >
            每个样本都带着答案。
            <br />
            机器从数据里搜索模式，而不是等人把世界写进代码。
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 850,
          top: 275,
          width: 980,
          height: 520,
          rotate: "-4deg",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -35,
            top: 65,
            width: 1050,
            height: 410,
            borderRadius: 52,
            border: `6px solid ${COLORS.ink}`,
            backgroundColor: "rgba(21,21,21,0.92)",
            boxShadow: `18px 20px 0 ${COLORS.lime}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 80,
            display: "flex",
            gap: 22,
            translate: `${-((frame * 2.2) % 234)}px 0px`,
          }}
        >
          {[...beltCards, ...beltCards].map((card, index) => (
            <div
              key={index}
              style={{
                width: 188,
                height: 286,
                borderRadius: 17,
                border: `4px solid ${COLORS.ink}`,
                backgroundColor: card.color,
                overflow: "hidden",
                boxShadow: `7px 8px 0 ${COLORS.ink}`,
                translate: `0px ${Math.sin(frame / 12 + index) * 6}px`,
                rotate: `${(index % 2 ? 1 : -1) * 1.6}deg`,
              }}
            >
              <div
                style={{
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  borderBottom: `2px solid ${COLORS.ink}33`,
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                }}
              >
                <span>SAMPLE</span>
                <span>{card.kind === "cat" ? "✓" : "×"}</span>
              </div>
              <div
                style={{
                  height: 182,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.kind === "cat" ? (
                  <CatPortrait
                    size={146}
                    color={COLORS.coral}
                    variant={card.variant}
                  />
                ) : (
                  <div
                    style={{
                      width: 146,
                      height: 146,
                      borderRadius: "50%",
                      backgroundColor: COLORS.paper,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: MONO,
                      fontSize: 58,
                      fontWeight: 900,
                      color: COLORS.ink,
                    }}
                  >
                    ?
                  </div>
                )}
              </div>
              <div
                style={{
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {card.kind === "cat" ? "猫" : "非猫"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 96,
          top: 214,
          width: 265,
          height: 116,
          borderRadius: 16,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.lime,
          color: COLORS.ink,
          boxShadow: `10px 11px 0 ${COLORS.ink}`,
          rotate: "4deg",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          opacity: interpolate(countEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(countEnter, [0, 1], [0.25, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        <div
          style={{
            fontSize: 45,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: -1.2,
          }}
        >
          10,000+
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          LABELED EXAMPLES
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 849,
          top: 840,
          width: 980,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: COLORS.white,
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 1.8,
        }}
      >
        <span>DATA → PATTERN</span>
        <span style={{color: COLORS.lime}}>NO HAND-WRITTEN RULES</span>
      </div>
    </SceneBackground>
  );
};

const RulesWipe: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 318 || frame >= 342) {
    return null;
  }
  const progress = interpolate(frame, [318, 342], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: "-20%",
          top: "-12%",
          width: "140%",
          height: "124%",
          rotate: "-5deg",
          backgroundColor: COLORS.lime,
          translate: `${interpolate(progress, [0, 1], [-120, 120])}% 0px`,
          borderLeft: `20px solid ${COLORS.ink}`,
          borderRight: `20px solid ${COLORS.ink}`,
        }}
      />
    </AbsoluteFill>
  );
};

export const SceneRules: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={332}>
        <RulesPhase />
      </Sequence>
      <Sequence from={330} durationInFrames={210}>
        <ExamplesPhase />
      </Sequence>
      <RulesWipe />
    </AbsoluteFill>
  );
};

