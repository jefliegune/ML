import {Audio} from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import {OpeningAudio, OpeningVisuals} from "../opening/Opening";
import {cue} from "../packaging/sound";
import {SectionWipe} from "../packaging/transitions";
import {COLORS} from "../theme";
import {FullCaptionBar} from "./FullCaptionBar";
import {SceneFeatures} from "./scenes/SceneFeatures";
import {SceneGeneralize} from "./scenes/SceneGeneralize";
import {SceneModel} from "./scenes/SceneModel";
import {SceneOutro} from "./scenes/SceneOutro";
import {ScenePixels} from "./scenes/ScenePixels";
import {SceneRules} from "./scenes/SceneRules";
import {SceneTraining} from "./scenes/SceneTraining";
import {VOICE_LINES} from "./voiceTimeline.generated";

const BGM_BASE = 0.225;
const BGM_DUCKED = 0.078;

const bgmVolume = (frame: number) => {
  let volume = BGM_BASE;

  for (const line of VOICE_LINES) {
    const ducked = interpolate(
      frame,
      [
        line.startFrame - 7,
        line.startFrame + 2,
        line.endFrame - 2,
        line.endFrame + 10,
      ],
      [volume, BGM_DUCKED, BGM_DUCKED, volume],
      {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
    );
    volume = Math.min(volume, ducked);
  }

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [3502, 3599], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return volume * fadeIn * fadeOut;
};

const SECTION_WIPES = [
  {boundary: 300, color: COLORS.blue},
  {boundary: 840, color: COLORS.lime},
  {boundary: 1320, color: COLORS.coral},
  {boundary: 1740, color: COLORS.blue},
  {boundary: 2280, color: COLORS.coral},
  {boundary: 2880, color: COLORS.lime},
  {boundary: 3300, color: COLORS.blue},
];

const DARK_SECTIONS = new Set(["features", "training", "outro"]);

const SFX = [
  cue(838, "whoosh", 0.3),
  cue(1318, "whoosh", 0.28),
  cue(1738, "whoosh", 0.28),
  cue(2174, "impact", 0.42),
  cue(2182, "click", 0.13),
  cue(2278, "whoosh", 0.28),
  cue(2408, "click", 0.1),
  cue(2428, "click", 0.09),
  cue(2448, "click", 0.08),
  cue(2606, "riser", 0.14),
  cue(2768, "impact", 0.16),
  cue(2772, "ding", 0.3),
  cue(2878, "whoosh", 0.3),
  cue(2974, "pop", 0.32),
  cue(3082, "impact", 0.16),
  cue(3172, "ding", 0.26),
  cue(3176, "pop", 0.18),
  cue(3298, "whoosh", 0.3),
  cue(3310, "impact", 0.2),
  cue(3472, "whoosh", 0.2),
  cue(3482, "ding", 0.18),
];
export const FullVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.cream}}>
      <Sequence durationInFrames={300}>
        <OpeningVisuals />
      </Sequence>

      <Sequence from={300} durationInFrames={540}>
        <SceneRules />
      </Sequence>
      <Sequence from={840} durationInFrames={480}>
        <ScenePixels />
      </Sequence>
      <Sequence from={1320} durationInFrames={420}>
        <SceneFeatures />
      </Sequence>
      <Sequence from={1740} durationInFrames={540}>
        <SceneModel />
      </Sequence>
      <Sequence from={2280} durationInFrames={600}>
        <SceneTraining />
      </Sequence>
      <Sequence from={2880} durationInFrames={420}>
        <SceneGeneralize />
      </Sequence>
      <Sequence from={3300} durationInFrames={300}>
        <SceneOutro />
      </Sequence>

      {VOICE_LINES.filter((line) => line.section !== "opening").map((line) => (
        <Sequence
          key={`caption-${line.id}`}
          from={line.captionStartFrame}
          durationInFrames={line.captionEndFrame - line.captionStartFrame}
        >
          <FullCaptionBar
            line={line}
            darkScene={DARK_SECTIONS.has(line.section)}
          />
        </Sequence>
      ))}

      {SECTION_WIPES.map((wipe) => (
        <Sequence
          key={`wipe-${wipe.boundary}`}
          from={wipe.boundary - 8}
          durationInFrames={16}
        >
          <SectionWipe color={wipe.color} />
        </Sequence>
      ))}

      <OpeningAudio />

      {VOICE_LINES.filter((line) => line.section !== "opening").map((line) => (
        <Sequence key={`voice-${line.id}`} from={line.startFrame}>
          <Audio src={staticFile(line.file)} volume={1} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/bgm-full.wav")} volume={bgmVolume} />

      {SFX.map((sfx, index) => (
        <Sequence key={`sfx-${index}`} from={sfx.frame}>
          <Audio src={staticFile(sfx.file)} volume={sfx.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
