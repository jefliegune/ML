import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {EaseInText, MonoTag, SceneBackground, TopBar} from "../../components/Design";
import {COLORS, FONT, MONO} from "../../theme";

const PIXEL_ROWS = [
  "0000000000000000",
  "0001100000110000",
  "0011110001111000",
  "0011111111111000",
  "0111111111111110",
  "0111101111011110",
  "0111101111011110",
  "0111111111111110",
  "0111111331111110",
  "0111113333111110",
  "0011111331111100",
  "0011111111111100",
  "0001111111111000",
  "0000111111110000",
  "0000000000000000",
  "0000000000000000",
];

const PIXEL_COLORS: Record<string, string> = {
  "0": "transparent",
  "1": COLORS.coral,
  "2": COLORS.ink,
  "3": COLORS.paper,
};

const MATRIX_VALUES = Array.from({length: 8}, (_, row) =>
  Array.from({length: 8}, (_, col) => {
    const value = (Math.sin(row * 3.1 + col * 1.7) + 1) / 2;
    return Number(value.toFixed(2));
  }),
);

const PixelCell: React.FC<{
  value: string;
  row: number;
  col: number;
}> = ({value, row, col}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - 2 - (row + col) * 1.1,
    fps,
    config: {damping: 15, stiffness: 170, mass: 0.6},
    durationInFrames: 15,
  });
  const color = PIXEL_COLORS[value];

  if (value === "0") {
    return (
      <div
        style={{
          border: `1px solid rgba(21,21,21,0.06)`,
          backgroundColor: "rgba(255,255,255,0.2)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: color,
        border:
          value === "2"
            ? `1.5px solid ${COLORS.ink}`
            : `1px solid ${COLORS.ink}22`,
        borderRadius: 2,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.2, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
      }}
    />
  );
};

const FeatureBox: React.FC<{
  label: string;
  delay: number;
  style: React.CSSProperties;
  color: string;
}> = ({label, delay, style, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 12, stiffness: 180, mass: 0.65},
    durationInFrames: 16,
  });

  return (
    <div
      style={{
        position: "absolute",
        border: `4px dashed ${color}`,
        borderRadius: 6,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.75, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -3,
          top: -30,
          padding: "4px 8px 3px",
          backgroundColor: color,
          color: color === COLORS.lime ? COLORS.ink : COLORS.white,
          borderRadius: 5,
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const ScenePixels: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const labelEnter = spring({
    frame: frame - 220,
    fps,
    config: {damping: 11, stiffness: 170, mass: 0.7},
    durationInFrames: 20,
  });
  const highlightPulse = 0.55 + Math.sin(frame / 8) * 0.35;

  return (
    <SceneBackground index="06">
      <TopBar chapter="06" label="SEEING NUMBERS" />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 190,
          width: 770,
          fontFamily: FONT,
          color: COLORS.ink,
        }}
      >
        <EaseInText delay={0}>
          <MonoTag background={COLORS.lime}>COMPUTER VISION / INPUT</MonoTag>
        </EaseInText>
        <EaseInText delay={3} distance={58}>
          <div
            style={{
              marginTop: 28,
              fontSize: 82,
              lineHeight: 1.07,
              fontWeight: 800,
              letterSpacing: -2.8,
            }}
          >
            机器眼里的猫，
            <br />
            是一堆
            <span style={{color: COLORS.blue}}>数字</span>。
          </div>
        </EaseInText>
        <EaseInText delay={10} distance={30}>
          <div
            style={{
              marginTop: 31,
              maxWidth: 680,
              fontSize: 29,
              lineHeight: 1.5,
              color: COLORS.muted,
              fontWeight: 500,
            }}
          >
            图片不是“猫”，而是一张像素矩阵。
            <br />
            每个格子，都有自己的明暗和颜色。
          </div>
        </EaseInText>

        <EaseInText delay={17} distance={25}>
          <div
            style={{
              marginTop: 42,
              display: "flex",
              flexDirection: "column",
              gap: 15,
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 1.7,
              color: COLORS.ink,
              opacity: 0.62,
            }}
          >
            <div style={{display: "flex", alignItems: "center", gap: 12}}>
              <span style={{width: 58, height: 4, background: COLORS.coral}} />
              INPUT TENSOR / 224 × 224 × 3
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 12}}>
              <span style={{width: 58, height: 4, background: COLORS.blue}} />
              VALUES 0.00 → 1.00
            </div>
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 888,
          top: 202,
          width: 906,
          height: 660,
          borderRadius: 25,
          border: `4px solid ${COLORS.ink}`,
          backgroundColor: COLORS.ink,
          boxShadow: `16px 18px 0 ${COLORS.blue}`,
          overflow: "hidden",
          fontFamily: MONO,
          color: COLORS.white,
        }}
      >
        <div
          style={{
            height: 58,
            padding: "0 21px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${COLORS.white}20`,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 1.8,
          }}
        >
          <span style={{color: COLORS.lime}}>PIXEL MAP / 16 × 16</span>
          <span style={{opacity: 0.48}}>CHANNEL R G B</span>
        </div>

        <div
          style={{
            position: "absolute",
            left: 22,
            top: 82,
            width: 464,
            height: 464,
            padding: 12,
            borderRadius: 12,
            backgroundColor: COLORS.paper,
            border: `3px solid ${COLORS.white}55`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(16, 1fr)",
              gridTemplateRows: "repeat(16, 1fr)",
              gap: 1,
            }}
          >
            {PIXEL_ROWS.map((row, rowIndex) =>
              row
                .padEnd(16, "0")
                .slice(0, 16)
                .split("")
                .map((value, colIndex) => (
                  <PixelCell
                    key={`${rowIndex}-${colIndex}`}
                    value={value}
                    row={rowIndex}
                    col={colIndex}
                  />
                )),
            )}
          </div>

          <div
            style={{
              position: "absolute",
              left: 188,
              top: 206,
              width: 34,
              height: 34,
              border: `4px solid ${COLORS.blue}`,
              borderRadius: 4,
              boxShadow: `0 0 0 4px ${COLORS.blue}22`,
              opacity: highlightPulse,
            }}
          />

          <div
            style={{
              position: "absolute",
              right: -152,
              top: 264,
              width: 206,
              padding: "13px 14px 12px",
              borderRadius: 9,
              backgroundColor: COLORS.paper,
              border: `3px solid ${COLORS.ink}`,
              color: COLORS.ink,
              fontFamily: MONO,
              boxShadow: `5px 6px 0 ${COLORS.ink}`,
              rotate: "2deg",
            }}
          >
            <div style={{fontSize: 11, fontWeight: 900, letterSpacing: 1}}>
              ONE PIXEL
            </div>
            <div style={{marginTop: 6, fontSize: 15, fontWeight: 800}}>
              x:7 y:7
            </div>
            <div style={{marginTop: 4, fontSize: 13, color: COLORS.coral}}>
              RGB(255, 91, 72)
            </div>
          </div>

          <FeatureBox
            label="EAR / EDGE"
            delay={330}
            color={COLORS.blue}
            style={{left: 61, top: 75, width: 104, height: 94}}
          />
          <FeatureBox
            label="EYE / TEXTURE"
            delay={352}
            color={COLORS.coral}
            style={{left: 164, top: 147, width: 130, height: 86}}
          />
          <FeatureBox
            label="SHAPE"
            delay={374}
            color={COLORS.lime}
            style={{left: 111, top: 250, width: 238, height: 139}}
          />
        </div>

        <div
          style={{
            position: "absolute",
            right: 22,
            top: 85,
            width: 366,
            height: 460,
            borderRadius: 10,
            border: `2px solid ${COLORS.white}22`,
            backgroundColor: "rgba(255,255,255,0.035)",
            padding: "15px 14px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.3,
              color: COLORS.white,
              opacity: 0.48,
            }}
          >
            PIXEL VALUES
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 7,
              marginTop: 13,
            }}
          >
            {MATRIX_VALUES.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    height: 42,
                    borderRadius: 4,
                    backgroundColor:
                      value > 0.66
                        ? COLORS.coral
                        : value > 0.33
                          ? COLORS.blue
                          : COLORS.ink,
                    border: `1px solid ${COLORS.white}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.white,
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 800,
                    opacity: interpolate(frame, [70 + rowIndex * 3, 88 + rowIndex * 3], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  {value.toFixed(2)}
                </div>
              )),
            )}
          </div>
          <div
            style={{
              marginTop: 19,
              fontFamily: MONO,
              fontSize: 12,
              lineHeight: 1.6,
              fontWeight: 700,
              letterSpacing: 0.9,
              color: "rgba(255,255,255,0.42)",
            }}
          >
            IMAGE = A BIG MATRIX.
            <br />
            NO MAGIC. JUST NUMBERS.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 29,
            bottom: 34,
            width: 292,
            height: 98,
            borderRadius: 14,
            border: `4px solid ${COLORS.ink}`,
            backgroundColor: COLORS.lime,
            color: COLORS.ink,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            rotate: "2deg",
            boxShadow: `7px 8px 0 ${COLORS.ink}`,
            opacity: interpolate(labelEnter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(labelEnter, [0, 1], [0.3, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.5,
              opacity: 0.54,
            }}
          >
            LABEL / GROUND TRUTH
          </div>
          <div style={{marginTop: 6, fontSize: 43, lineHeight: 1, fontWeight: 900}}>
            这是猫
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 93,
          top: 826,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 1.7,
          color: COLORS.ink,
          opacity: 0.55,
        }}
      >
        <span>THE MODEL DOES NOT SEE A CAT. IT SEES A TENSOR.</span>
        <span style={{width: 78, height: 2, background: COLORS.blue}} />
      </div>
    </SceneBackground>
  );
};



