import type {FC} from "react";
import {useCurrentFrame} from "remotion";
import {BRIGHT_DRAFTING as C} from "./tokens";
import {
  clamp01,
  DraftingCamera,
  DraftingChip,
  DraftingFlowDots,
  DraftingRoute,
  DraftingSectionTag,
  DraftingStage,
  DraftingToken,
  pointAlong,
  springIn,
  type Point,
} from "./primitives";
import {WordCaptionBar, type CaptionLine} from "./WordCaption";

const HUB: Point = [960, 380];

const NODES = [
  {label: "拆解", x: 620, y: 380},
  {label: "交付", x: 1300, y: 380},
  {label: "兜底", x: 960, y: 640},
];

const LINES: CaptionLine[] = [
  {
    id: "demo-1",
    text: "把大任务拆开，再收拢成一份。",
    highlights: ["拆开", "收拢"],
    startFrame: 0,
    endFrame: 100,
    captionStartFrame: 0,
    captionEndFrame: 100,
    words: [
      {text: "把", offset: 0.1, duration: 0.2},
      {text: "大任务", offset: 0.3, duration: 0.5},
      {text: "拆开", offset: 0.8, duration: 0.4},
      {text: "再", offset: 1.3, duration: 0.2},
      {text: "收拢", offset: 1.5, duration: 0.4},
      {text: "成", offset: 1.9, duration: 0.2},
      {text: "一份", offset: 2.1, duration: 0.4},
    ],
  },
  {
    id: "demo-2",
    text: "每一步都能验收，交接写清楚。",
    highlights: ["验收", "交接"],
    startFrame: 100,
    endFrame: 200,
    captionStartFrame: 100,
    captionEndFrame: 200,
    words: [
      {text: "每", offset: 0.1, duration: 0.2},
      {text: "一步", offset: 0.3, duration: 0.5},
      {text: "都能", offset: 0.8, duration: 0.4},
      {text: "验收", offset: 1.2, duration: 0.4},
      {text: "交接", offset: 1.7, duration: 0.4},
      {text: "写", offset: 2.1, duration: 0.2},
      {text: "清楚", offset: 2.3, duration: 0.4},
    ],
  },
  {
    id: "demo-3",
    text: "先可控，再聪明。",
    highlights: ["可控", "聪明"],
    startFrame: 200,
    endFrame: 300,
    captionStartFrame: 200,
    captionEndFrame: 300,
    words: [
      {text: "先", offset: 0.1, duration: 0.2},
      {text: "可控", offset: 0.3, duration: 0.6},
      {text: "再", offset: 0.9, duration: 0.2},
      {text: "聪明", offset: 1.1, duration: 0.6},
    ],
  },
];

export const BrightDraftingShowcase: FC = () => {
  const frame = useCurrentFrame();
  const routeProgress = springIn(frame, 6, 24);
  const tokenProgress = clamp01((frame - 24) / 190);
  const tokenPath: Point[] = [
    [620, 380],
    [960, 380],
    [1300, 380],
  ];
  const [tokenX, tokenY] = pointAlong(tokenPath, tokenProgress);

  return (
    <DraftingStage accent={C.teal}>
      <DraftingSectionTag label="明亮制图台" accent={C.teal} />
      <DraftingCamera scale={1.03}>
        <div
          style={{
            position: "absolute",
            right: -20,
            top: 120,
            fontSize: 500,
            fontWeight: 900,
            lineHeight: 0.8,
            color: "transparent",
            WebkitTextStroke: "2px rgba(16,24,29,0.055)",
          }}
        >
          图
        </div>

        <div
          style={{
            position: "absolute",
            left: 330,
            top: 180,
            width: 1260,
            height: 560,
            background: C.paper,
            border: `4px solid ${C.ink}`,
            borderRadius: 10,
          }}
        />

        <svg
          width={1920}
          height={1080}
          style={{position: "absolute", inset: 0}}
          viewBox="0 0 1920 1080"
        >
          {NODES.map((node) => (
            <DraftingRoute
              key={node.label}
              points={[
                HUB,
                [node.x, HUB[1]],
                [node.x, node.y],
              ]}
              progress={routeProgress}
              color={C.teal}
              width={5}
            />
          ))}
        </svg>

        {NODES.map((node) => (
          <DraftingFlowDots
            key={`flow-${node.label}`}
            points={[
              HUB,
              [node.x, HUB[1]],
              [node.x, node.y],
            ]}
            count={1}
            phase={node.label === "拆解" ? 0 : node.label === "交付" ? 0.35 : 0.68}
            speed={0.006}
            color={C.teal}
            size={7}
            progress={routeProgress}
          />
        ))}

        <div
          style={{
            position: "absolute",
            left: HUB[0] - 70,
            top: HUB[1] - 70,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: C.ink,
            color: C.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            fontWeight: 800,
            transform: `scale(${springIn(frame, 0, 18)})`,
          }}
        >
          编排
        </div>

        {NODES.map((node, index) => (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: node.x - 70,
              top: node.y - 38,
              transform: `scale(${springIn(frame, 8 + index * 4, 18)})`,
            }}
          >
            <DraftingChip tone={index === 2 ? "gold" : "paper"} size={40}>
              {node.label}
            </DraftingChip>
          </div>
        ))}

        <DraftingToken x={tokenX} y={tokenY} size={50} />
      </DraftingCamera>

      <WordCaptionBar lines={LINES} accent={C.red} />
    </DraftingStage>
  );
};
