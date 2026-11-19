import {Audio} from "@remotion/media";
import type {CaptionSegment} from "../components/Design";
import {CaptionBar} from "../components/Design";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {Scene1Hook} from "../scenes/Scene1Hook";
import {Scene2Examples} from "../scenes/Scene2Examples";
import {Scene3Feedback} from "../scenes/Scene3Feedback";
import {Scene4Outro} from "../scenes/Scene4Outro";
import {COLORS} from "../theme";

const OPENING_CAPTIONS: {
  from: number;
  duration: number;
  segments: CaptionSegment[];
}[] = [
  {
    from: 2,
    duration: 70,
    segments: [
      {text: "AI "},
      {text: "怎么学会", weight: 700},
      {text: "认猫", color: COLORS.lime, weight: 800},
      {text: "？"},
    ],
  },
  {
    from: 73,
    duration: 80,
    segments: [
      {text: "不靠"},
      {text: "规则", color: COLORS.coral, weight: 800},
      {text: "，靠"},
      {text: "大量例子", color: COLORS.lime, weight: 800},
      {text: "。"},
    ],
  },
  {
    from: 154,
    duration: 80,
    segments: [
      {text: "猜错一次", color: COLORS.coral, weight: 800},
      {text: "，就"},
      {text: "修正一点", color: COLORS.lime, weight: 800},
      {text: "。"},
    ],
  },
  {
    from: 235,
    duration: 65,
    segments: [
      {text: "这，就是"},
      {text: "机器学习", color: COLORS.lime, weight: 800},
      {text: "。"},
    ],
  },
];

const OPENING_WIPES = [
  {start: 68, end: 77, color: COLORS.blue},
  {start: 149, end: 158, color: COLORS.lime},
  {start: 230, end: 239, color: COLORS.coral},
];

const OpeningWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = OPENING_WIPES.find(
    (item) => frame >= item.start && frame < item.end,
  );

  if (!wipe) {
    return null;
  }

  const progress = interpolate(frame, [wipe.start, wipe.end], [0, 1], {
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
          backgroundColor: wipe.color,
          rotate: "-5deg",
          translate: `${interpolate(progress, [0, 1], [-118, 118])}% 0px`,
          borderRight: `18px solid ${COLORS.ink}`,
          borderLeft: `18px solid ${COLORS.ink}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 88px, rgba(21,21,21,0.08) 88px 92px)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const OpeningVisuals: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={72}>
        <Scene1Hook />
      </Sequence>
      <Sequence from={72} durationInFrames={81}>
        <Scene2Examples />
      </Sequence>
      <Sequence from={153} durationInFrames={81}>
        <Scene3Feedback />
      </Sequence>
      <Sequence from={234} durationInFrames={66}>
        <Scene4Outro />
      </Sequence>

      {OPENING_CAPTIONS.map((caption) => (
        <Sequence
          key={caption.from}
          from={caption.from}
          durationInFrames={caption.duration}
        >
          <CaptionBar
            segments={caption.segments}
            tone={
              caption.from >= 153 && caption.from < 234 ? "dark" : "light"
            }
          />
        </Sequence>
      ))}

      <OpeningWipe />
    </AbsoluteFill>
  );
};

export const OpeningAudio: React.FC = () => {
  return (
    <>
      <Sequence from={9}>
        <Audio src={staticFile("audio/voice_01.mp3")} volume={1} />
      </Sequence>
      <Sequence from={77}>
        <Audio src={staticFile("audio/voice_02.mp3")} volume={1} />
      </Sequence>
      <Sequence from={157}>
        <Audio src={staticFile("audio/voice_03.mp3")} volume={1} />
      </Sequence>
      <Sequence from={235}>
        <Audio src={staticFile("audio/voice_04.mp3")} volume={1} />
      </Sequence>

      <Sequence from={4}>
        <Audio src={staticFile("sfx/click.wav")} volume={0.22} />
      </Sequence>
      <Sequence from={17}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={69}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.52} />
      </Sequence>
      {[77, 80, 83, 86, 89, 92].map((frame) => (
        <Sequence key={frame} from={frame}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.19} />
        </Sequence>
      ))}
      <Sequence from={150}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.52} />
      </Sequence>
      <Sequence from={225}>
        <Audio src={staticFile("sfx/riser.wav")} volume={0.21} />
      </Sequence>
      <Sequence from={231}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.52} />
      </Sequence>
      <Sequence from={236}>
        <Audio src={staticFile("sfx/impact.wav")} volume={0.47} />
      </Sequence>
      <Sequence from={242}>
        <Audio src={staticFile("sfx/ding.wav")} volume={0.27} />
      </Sequence>
    </>
  );
};
