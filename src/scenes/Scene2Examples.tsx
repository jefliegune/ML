import type {CSSProperties} from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CatPortrait,
  DogPortrait,
  EaseInText,
  MonoTag,
  SceneBackground,
  TopBar,
} from "../components/Design";
import {COLORS, FONT, MONO} from "../theme";

type Sample = {
  kind: "cat" | "dog";
  color: string;
  variant: number;
  label: string;
  rotate: number;
};

const SAMPLES: Sample[] = [
  {kind: "cat", color: COLORS.lime, variant: 0, label: "猫", rotate: -3.2},
  {kind: "cat", color: COLORS.paper, variant: 2, label: "猫", rotate: 2.1},
  {kind: "cat", color: COLORS.lilac, variant: 3, label: "猫", rotate: -1.4},
  {kind: "dog", color: "#FFD0C7", variant: 0, label: "非猫", rotate: 2.8},
  {kind: "cat", color: COLORS.cyan, variant: 1, label: "猫", rotate: -2.2},
  {kind: "cat", color: COLORS.paper, variant: 0, label: "猫", rotate: 1.5},
];

const SampleCard: React.FC<{
  sample: Sample;
  index: number;
  style: CSSProperties;
}> = ({sample, index, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - 5 - index * 3,
    fps,
    config: {damping: 13, stiffness: 150, mass: 0.72},
    durationInFrames: 24,
  });
  const isCat = sample.kind === "cat";
  const float = Math.sin(frame / 14 + index * 1.4) * 2.2;

  return (
    <div
      style={{
        position: "absolute",
        width: 252,
        height: 286,
        borderRadius: 21,
        border: `4px solid ${COLORS.ink}`,
        backgroundColor: sample.color,
        boxShadow: `10px 11px 0 ${COLORS.ink}`,
        overflow: "hidden",
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.72, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        rotate: `${sample.rotate + interpolate(enter, [0, 1], [6, 0])}deg`,
        translate: `0px ${interpolate(enter, [0, 1], [94, 0]) + float}px`,
        ...style,
      }}
    >
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 13px",
          borderBottom: `2px solid ${COLORS.ink}55`,
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.1,
        }}
      >
        <span>SAMPLE_{String(index + 1).padStart(2, "0")}</span>
        <span
          style={{
            width: 21,
            height: 21,
            borderRadius: 99,
            border: `2px solid ${COLORS.ink}`,
            backgroundColor: isCat ? COLORS.lime : COLORS.coral,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          {isCat ? "✓" : "×"}
        </span>
      </div>

      <div
        style={{
          height: 194,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 173,
            height: 173,
            borderRadius: "50%",
            backgroundColor: `${COLORS.paper}AA`,
            border: `2px solid ${COLORS.ink}33`,
          }}
        />
        {isCat ? (
          <CatPortrait
            size={177}
            color={
              sample.variant === 1
                ? COLORS.coral
                : sample.variant === 3
                  ? COLORS.lime
                  : COLORS.coral
            }
            variant={sample.variant}
            style={{position: "relative", zIndex: 2}}
          />
        ) : (
          <DogPortrait
            size={170}
            color="#B88C68"
            style={{position: "relative", zIndex: 2}}
          />
        )}
      </div>

      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            minWidth: 95,
            padding: "7px 17px 6px",
            borderRadius: 999,
            border: `2.5px solid ${COLORS.ink}`,
            backgroundColor: isCat ? COLORS.ink : COLORS.coral,
            color: isCat ? COLORS.white : COLORS.ink,
            fontFamily: FONT,
            fontSize: 23,
            lineHeight: 1,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {sample.label}
        </div>
      </div>
    </div>
  );
};

export const Scene2Examples: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const badgeEnter = spring({
    frame: frame - 13,
    fps,
    config: {damping: 13, stiffness: 160, mass: 0.75},
    durationInFrames: 23,
  });
  const stampEnter = spring({
    frame: frame - 20,
    fps,
    config: {damping: 11, stiffness: 190, mass: 0.63},
    durationInFrames: 20,
  });
  const count = Math.round(
    interpolate(frame, [10, 42], [0, 10000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <SceneBackground index="02">
      <TopBar chapter="02" label="LABELED EXAMPLES" />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 205,
          width: 760,
          fontFamily: FONT,
          color: COLORS.ink,
        }}
      >
        <EaseInText delay={0} distance={26}>
          <MonoTag background={COLORS.lime}>STEP 01 / DATA</MonoTag>
        </EaseInText>

        <div
          style={{
            marginTop: 31,
            fontSize: 106,
            lineHeight: 1.04,
            fontWeight: 800,
            letterSpacing: -3.5,
          }}
        >
          <EaseInText delay={3} distance={64}>
            <div>不靠规则，</div>
          </EaseInText>
          <EaseInText delay={7} distance={72}>
            <div style={{marginTop: 5}}>
              <span>靠</span>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: COLORS.blue,
                  color: COLORS.white,
                  border: `4px solid ${COLORS.ink}`,
                  borderRadius: 16,
                  padding: "1px 17px 8px",
                  margin: "0 5px",
                  boxShadow: `8px 9px 0 ${COLORS.ink}`,
                }}
              >
                大量例子
              </span>
              <span>。</span>
            </div>
          </EaseInText>
        </div>

        <EaseInText delay={12} distance={30}>
          <div
            style={{
              marginTop: 36,
              fontSize: 30,
              lineHeight: 1.48,
              fontWeight: 500,
              color: COLORS.muted,
              maxWidth: 690,
            }}
          >
            每张图片都带着答案：这是猫，或不是猫。
            <br />
            机器从成千上万个样本里，慢慢找出共同点。
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 121,
          top: 681,
          width: 672,
          height: 132,
          borderRadius: 18,
          border: `3px solid ${COLORS.ink}`,
          backgroundColor: COLORS.paper,
          boxShadow: `9px 10px 0 ${COLORS.ink}`,
          rotate: "-1.2deg",
          fontFamily: FONT,
          color: COLORS.ink,
          padding: "18px 22px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 1.8,
            color: COLORS.muted,
          }}
        >
          OLD WAY / HAND-WRITTEN RULE
        </div>
        <div
          style={{
            marginTop: 13,
            fontSize: 34,
            lineHeight: 1.1,
            fontWeight: 700,
          }}
        >
          猫 = 有耳朵 + 有胡须
        </div>
        <div
          style={{
            position: "absolute",
            left: 285,
            top: 66,
            width: 360,
            height: 6,
            borderRadius: 99,
            backgroundColor: COLORS.coral,
            rotate: "-2deg",
            scale: interpolate(stampEnter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 17,
            top: 15,
            width: 66,
            height: 66,
            borderRadius: "50%",
            backgroundColor: COLORS.coral,
            border: `3px solid ${COLORS.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: MONO,
            fontSize: 37,
            fontWeight: 900,
            rotate: "9deg",
            scale: interpolate(stampEnter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        >
          ×
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 926,
          top: 224,
          width: 842,
          height: 604,
        }}
      >
        {SAMPLES.map((sample, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          return (
            <SampleCard
              key={index}
              sample={sample}
              index={index}
              style={{left: col * 288, top: row * 315}}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          right: 104,
          top: 118,
          width: 240,
          height: 96,
          borderRadius: 14,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.coral,
          boxShadow: `8px 9px 0 ${COLORS.ink}`,
          fontFamily: FONT,
          color: COLORS.ink,
          rotate: "3deg",
          opacity: interpolate(badgeEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(badgeEnter, [0, 1], [0.2, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 45,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: -1.5,
          }}
        >
          × {count.toLocaleString("en-US")}
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
          LABELED SAMPLES
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 926,
          top: 850,
          width: 842,
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 15,
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 1.5,
          color: COLORS.ink,
        }}
      >
        <span>LOADING EXAMPLES</span>
        <div style={{display: "flex", gap: 7, flex: 1}}>
          {SAMPLES.map((_, index) => (
            <div
              key={index}
              style={{
                height: 9,
                flex: 1,
                borderRadius: 99,
                backgroundColor:
                  frame >= 7 + index * 3 ? COLORS.ink : `${COLORS.ink}1F`,
              }}
            />
          ))}
        </div>
        <span style={{color: COLORS.blue}}>6 / 6</span>
      </div>
    </SceneBackground>
  );
};


