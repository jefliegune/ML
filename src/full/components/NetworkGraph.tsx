import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {COLORS} from "../../theme";

type Point = {x: number; y: number};

const NODES: Point[][] = [
  [
    {x: 62, y: 120},
    {x: 62, y: 220},
    {x: 62, y: 320},
    {x: 62, y: 420},
  ],
  [
    {x: 286, y: 78},
    {x: 286, y: 178},
    {x: 286, y: 278},
    {x: 286, y: 378},
    {x: 286, y: 478},
  ],
  [
    {x: 510, y: 143},
    {x: 510, y: 280},
    {x: 510, y: 417},
  ],
  [
    {x: 736, y: 205},
    {x: 736, y: 355},
  ],
];

const LAYER_COLORS = [
  [COLORS.cyan, COLORS.cyan, COLORS.cyan, COLORS.cyan],
  [COLORS.lilac, COLORS.lilac, COLORS.lilac, COLORS.lilac, COLORS.lilac],
  [COLORS.lime, COLORS.lime, COLORS.lime],
  [COLORS.lime, COLORS.coral],
];

const EDGES = NODES.flatMap((layer, layerIndex) => {
  if (layerIndex === NODES.length - 1) {
    return [];
  }
  return layer.flatMap((from, fromIndex) =>
    NODES[layerIndex + 1].map((to, toIndex) => ({
      from,
      to,
      layerIndex,
      fromIndex,
      toIndex,
      key: `${layerIndex}-${fromIndex}-${toIndex}`,
      delay: layerIndex * 13 + fromIndex * 2.4 + toIndex * 1.6,
    })),
  );
});

export const NetworkGraph: React.FC<{
  direction?: "forward" | "backward";
  pulseColor?: string;
  pulseStrength?: number;
}> = ({direction = "forward", pulseColor = COLORS.lime, pulseStrength = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const backward = direction === "backward";

  return (
    <svg
      viewBox="0 0 800 560"
      width="100%"
      height="100%"
      style={{overflow: "visible"}}
    >
      {EDGES.map((edge) => (
        <line
          key={edge.key}
          x1={edge.from.x}
          y1={edge.from.y}
          x2={edge.to.x}
          y2={edge.to.y}
          stroke={pulseColor}
          strokeWidth={1.6}
          opacity={backward ? 0.16 : 0.2}
        />
      ))}

      {EDGES.map((edge) => {
        const source = backward ? edge.to : edge.from;
        const target = backward ? edge.from : edge.to;
        const raw = (frame - edge.delay) / (backward ? 58 : 48);
        const progress = raw - Math.floor(raw);
        const visible = frame > edge.delay;
        const x = interpolate(progress, [0, 1], [source.x, target.x]);
        const y = interpolate(progress, [0, 1], [source.y, target.y]);
        const fade = Math.sin(progress * Math.PI);

        return visible ? (
          <circle
            key={`pulse-${edge.key}`}
            cx={x}
            cy={y}
            r={3.4 + fade * 2.2}
            fill={pulseColor}
            opacity={fade * 0.9 * pulseStrength}
          />
        ) : null;
      })}

      {NODES.map((layer, layerIndex) =>
        layer.map((node, nodeIndex) => {
          const enter = spring({
            frame: frame - (layerIndex * 9 + nodeIndex * 3),
            fps,
            config: {damping: 16, stiffness: 150, mass: 0.7},
            durationInFrames: 20,
          });
          const wave = Math.max(
            0,
            Math.sin((frame - layerIndex * 12) / 11),
          );
          const color = LAYER_COLORS[layerIndex][nodeIndex] ?? COLORS.lime;
          const scale = interpolate(enter, [0, 1], [0.3, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          });

          return (
            <g
              key={`node-${layerIndex}-${nodeIndex}`}
              opacity={interpolate(enter, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
              transform={`translate(${node.x} ${node.y}) scale(${scale})`}
            >
              <circle
                r={24 + wave * 5}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.18 + wave * 0.24}
              />
              <circle
                r={16}
                fill={color}
                stroke="rgba(255,255,255,0.72)"
                strokeWidth={1.8}
              />
              <circle r={4} fill={COLORS.ink} opacity={0.28} />
            </g>
          );
        }),
      )}

      {[
        {x: 62, label: "INPUT"},
        {x: 286, label: "HIDDEN 1"},
        {x: 510, label: "HIDDEN 2"},
        {x: 736, label: "OUTPUT"},
      ].map((label) => (
        <text
          key={label.label}
          x={label.x}
          y={24}
          textAnchor="middle"
          fill={COLORS.white}
          opacity={0.42}
          fontFamily='"Arial Narrow", Arial, sans-serif'
          fontSize={13}
          fontWeight={800}
          letterSpacing={1.4}
        >
          {label.label}
        </text>
      ))}
    </svg>
  );
};

export const NetworkLayerLabels: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: 710,
        margin: "0 auto",
        color: COLORS.white,
        fontFamily: '"Arial Narrow", Arial, sans-serif',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 1.4,
        opacity: 0.48,
      }}
    >
      <span>4 × PIXELS</span>
      <span>WEIGHTS</span>
      <span>FEATURES</span>
      <span>2 × CLASSES</span>
    </div>
  );
};
