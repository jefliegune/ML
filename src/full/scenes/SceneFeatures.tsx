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

const EdgeCat: React.FC<{size: number}> = ({size}) => {
  return (
    <svg viewBox="0 0 300 300" width={size} height={size}>
      <path
        d="M57 101 L77 29 L128 68 Q150 58 172 68 L223 29 L243 101 Q260 139 250 184 Q236 258 150 267 Q64 258 50 184 Q40 139 57 101 Z"
        fill="none"
        stroke={COLORS.white}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <ellipse cx={108} cy={158} rx={17} ry={23} fill="none" stroke={COLORS.cyan} strokeWidth={6} />
      <ellipse cx={192} cy={158} rx={17} ry={23} fill="none" stroke={COLORS.cyan} strokeWidth={6} />
      <path
        d="M141 193 Q150 184 159 193 Q156 207 150 209 Q144 207 141 193 Z"
        fill="none"
        stroke={COLORS.coral}
        strokeWidth={6}
      />
      <path
        d="M132 207 L80 197 M132 216 L77 220 M168 207 L220 197 M168 216 L223 220"
        stroke={COLORS.lime}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
};

const EarIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" width={90} height={90}>
    <path d="M18 82 L30 18 L82 61 Z" fill={COLORS.coral} stroke={COLORS.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M33 66 L38 38 L60 59 Z" fill={COLORS.paper} stroke={COLORS.ink} strokeWidth={4} />
  </svg>
);

const EyeIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" width={90} height={90}>
    <ellipse cx={50} cy={50} rx={30} ry={40} fill={COLORS.lime} stroke={COLORS.ink} strokeWidth={6} />
    <ellipse cx={52} cy={50} rx={14} ry={28} fill={COLORS.ink} />
    <circle cx={59} cy={39} r={6} fill={COLORS.white} />
  </svg>
);

const WhiskerIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" width={90} height={90}>
    <path
      d="M12 34 L77 49 M10 56 L79 56 M15 78 L77 64"
      stroke={COLORS.blue}
      strokeWidth={8}
      strokeLinecap="round"
    />
    <circle cx={79} cy={56} r={7} fill={COLORS.coral} stroke={COLORS.ink} strokeWidth={4} />
  </svg>
);

type LayerSpec = {
  label: string;
  title: string;
  color: string;
  shadow: string;
};

const LAYERS: LayerSpec[] = [
  {label: "L1 / INPUT", title: "原图", color: COLORS.paper, shadow: COLORS.blue},
  {label: "L2 / EDGE", title: "线条", color: "#222222", shadow: COLORS.cyan},
  {label: "L3 / PART", title: "局部", color: COLORS.lilac, shadow: COLORS.blue},
  {label: "L4 / OBJECT", title: "整体", color: COLORS.lime, shadow: COLORS.coral},
];

const LayerCard: React.FC<{
  layer: LayerSpec;
  index: number;
}> = ({layer, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - 4 - index * 14,
    fps,
    config: {damping: 14, stiffness: 145, mass: 0.8},
    durationInFrames: 24,
  });
  const active = frame > 34 + index * 24;
  const glow = active ? 0.35 + Math.sin(frame / 7 + index) * 0.2 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 132 + index * 422,
        top: 334,
        width: 390,
        height: 470,
        borderRadius: 22,
        border: `4px solid ${COLORS.white}`,
        backgroundColor: layer.color,
        color: layer.color === "#222222" ? COLORS.white : COLORS.ink,
        boxShadow: `13px 15px 0 ${layer.shadow}`,
        overflow: "hidden",
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [0.78, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        translate: `0px ${interpolate(enter, [0, 1], [70, 0])}px`,
        outline: active ? `2px solid ${layer.shadow}${Math.round(glow * 255).toString(16).padStart(2, "0")}` : "none",
      }}
    >
      <div
        style={{
          height: 60,
          borderBottom: `2px solid ${layer.color === "#222222" ? COLORS.white : COLORS.ink}33`,
          padding: "0 17px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 1.3,
        }}
      >
        <span>{layer.label}</span>
        <span style={{opacity: 0.45}}>0{index + 1}</span>
      </div>

      <div
        style={{
          height: 332,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {index === 0 ? (
          <div
            style={{
              width: 274,
              height: 274,
              borderRadius: "50%",
              backgroundColor: COLORS.lime,
              border: `3px solid ${COLORS.ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CatPortrait size={230} color={COLORS.coral} variant={0} />
          </div>
        ) : null}
        {index === 1 ? <EdgeCat size={242} /> : null}
        {index === 2 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              placeItems: "center",
            }}
          >
            <div style={{width: 132, height: 132, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.paper, border: `3px solid ${COLORS.ink}`, borderRadius: 14}}>
              <EarIcon />
            </div>
            <div style={{width: 132, height: 132, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.paper, border: `3px solid ${COLORS.ink}`, borderRadius: 14}}>
              <EyeIcon />
            </div>
            <div style={{gridColumn: "1 / span 2", width: 278, height: 102, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.paper, border: `3px solid ${COLORS.ink}`, borderRadius: 14}}>
              <WhiskerIcon />
            </div>
          </div>
        ) : null}
        {index === 3 ? (
          <div style={{position: "relative", width: 300, height: 300}}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CatPortrait size={250} color={COLORS.coral} variant={3} />
            </div>
            <div
              style={{
                position: "absolute",
                right: -8,
                top: 23,
                padding: "8px 13px 7px",
                borderRadius: 8,
                backgroundColor: COLORS.ink,
                color: COLORS.lime,
                border: `3px solid ${COLORS.ink}`,
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 900,
                rotate: "4deg",
              }}
            >
              CAT 98%
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          height: 78,
          borderTop: `2px solid ${layer.color === "#222222" ? COLORS.white : COLORS.ink}33`,
          display: "flex",
          alignItems: "center",
          padding: "0 19px",
          justifyContent: "space-between",
          fontFamily: FONT,
        }}
      >
        <span style={{fontSize: 34, fontWeight: 800, letterSpacing: -0.5}}>{layer.title}</span>
        <span style={{fontFamily: MONO, fontSize: 12, fontWeight: 800, opacity: 0.48}}>
          {index === 0 ? "PIXELS" : index === 1 ? "EDGES" : index === 2 ? "PARTS" : "OBJECT"}
        </span>
      </div>
    </div>
  );
};

export const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const pulseX = 132 + ((frame * 2.6) % 1656);
  const closing = frame > 300;

  return (
    <SceneBackground tone="dark" index="07">
      <TopBar chapter="07" label="FEATURE HIERARCHY" dark />

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 168,
          width: 990,
          color: COLORS.white,
          fontFamily: FONT,
        }}
      >
        <EaseInText delay={0}>
          <MonoTag background={COLORS.lime}>NEURAL FEATURES / LAYERS</MonoTag>
        </EaseInText>
        <EaseInText delay={3} distance={56}>
          <div
            style={{
              marginTop: 26,
              fontSize: 76,
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: -3,
            }}
          >
            先看<span style={{color: COLORS.cyan}}>线条</span>，
            再拼出<span style={{color: COLORS.lime}}>整体</span>。
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          right: 104,
          top: 192,
          width: 360,
          textAlign: "right",
          color: "rgba(255,255,255,0.46)",
          fontFamily: MONO,
          fontSize: 14,
          lineHeight: 1.6,
          fontWeight: 700,
          letterSpacing: 1.7,
        }}
      >
        SIMPLE → COMPLEX
        <br />
        EDGE → PART → OBJECT
      </div>

      <div
        style={{
          position: "absolute",
          left: 132,
          top: 306,
          width: 1656,
          height: 3,
          backgroundColor: "rgba(255,255,255,0.13)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: pulseX - 8,
            top: -6,
            width: 17,
            height: 17,
            borderRadius: 99,
            backgroundColor: COLORS.lime,
            boxShadow: `0 0 18px ${COLORS.lime}`,
          }}
        />
      </div>

      {LAYERS.map((layer, index) => (
        <LayerCard key={layer.label} layer={layer} index={index} />
      ))}

      <AbsoluteFill
        style={{
          left: 132,
          top: 842,
          right: 132,
          bottom: "auto",
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: COLORS.white,
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 1.7,
          opacity: interpolate(frame, [250, 280], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span>PIXELS</span>
        <span style={{color: COLORS.cyan}}>EDGE DETECTORS</span>
        <span style={{color: COLORS.lilac}}>PART DETECTORS</span>
        <span style={{color: COLORS.lime}}>CAT</span>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 1000,
          top: 830,
          width: 520,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 600,
          color: COLORS.white,
          opacity: closing ? 0.62 : 0,
        }}
      >
        简单特征，逐层组合成复杂概念。
      </div>
    </SceneBackground>
  );
};


