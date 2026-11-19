import {Audio} from "@remotion/media";
import type {FC} from "react";
import {AbsoluteFill, interpolate, Sequence, staticFile} from "remotion";
import {FullCaptionBar} from "../full/FullCaptionBar";
import {cue} from "../packaging/sound";
import {SectionWipe} from "../packaging/transitions";
import {COLORS} from "../theme";
import {isDarkSection, PromoScene, SceneSubtitle, SceneTitle} from "./components";
import {AdvantagesScene} from "./scenes/AdvantagesScene";
import {AssetsScene} from "./scenes/AssetsScene";
import {HookScene} from "./scenes/HookScene";
import {OutroScene} from "./scenes/OutroScene";
import {ProblemScene} from "./scenes/ProblemScene";
import {SourcesScene} from "./scenes/SourcesScene";
import {SystemScene} from "./scenes/SystemScene";
import {UsageScene} from "./scenes/UsageScene";
import type {PromoProps, PromoSection} from "./types";

const SCENES: Record<string, FC<{section: PromoSection}>> = {
  hook: HookScene,
  problem: ProblemScene,
  system: SystemScene,
  sources: SourcesScene,
  advantages: AdvantagesScene,
  assets: AssetsScene,
  usage: UsageScene,
  outro: OutroScene,
};

const WIPE_COLORS = [
  COLORS.blue,
  COLORS.lime,
  COLORS.coral,
  COLORS.blue,
  COLORS.lime,
  COLORS.coral,
  COLORS.blue,
];

const FallbackScene: FC<{section: PromoSection}> = ({section}) => (
  <PromoScene section={section}>
    <div style={{marginTop: 40}}>
      <SceneTitle section={section} fontSize={92} />
      <SceneSubtitle section={section} dark={isDarkSection(section)} />
    </div>
  </PromoScene>
);

const makeBgmVolume = (lines: PromoProps["lines"], durationInFrames: number) => {
  const base = 0.21;
  const ducked = 0.068;
  return (frame: number) => {
    let volume = base;
    for (const line of lines) {
      const next = interpolate(
        frame,
        [line.startFrame - 7, line.startFrame + 2, line.endFrame - 2, line.endFrame + 10],
        [volume, ducked, ducked, volume],
        {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
      );
      volume = Math.min(volume, next);
    }
    const fadeIn = interpolate(frame, [0, 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(
      frame,
      [durationInFrames - 48, durationInFrames - 1],
      [1, 0],
      {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
    );
    return volume * fadeIn * fadeOut;
  };
};

export const PromoVideo: FC<PromoProps> = ({
  sections,
  lines,
  durationInFrames,
}) => {
  const darkIds = new Set(
    sections.filter((section) => isDarkSection(section)).map((section) => section.id),
  );
  const bgmVolume = makeBgmVolume(lines, durationInFrames);
  const sfx = sections.slice(1).map((section, index) =>
    cue(section.startFrame - 4, index % 3 === 2 ? "impact" : "whoosh", 0.24),
  );

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.cream}}>
      {sections.map((section) => {
        const Scene = SCENES[section.id] ?? FallbackScene;
        return (
          <Sequence
            key={section.id}
            from={section.startFrame}
            durationInFrames={section.endFrame - section.startFrame}
          >
            <Scene section={section} />
          </Sequence>
        );
      })}

      {lines.map((line) => (
        <Sequence
          key={"caption-" + line.id}
          from={line.captionStartFrame}
          durationInFrames={line.captionEndFrame - line.captionStartFrame}
        >
          <FullCaptionBar line={line} darkScene={darkIds.has(line.section)} />
        </Sequence>
      ))}

      {sections.slice(1).map((section, index) => (
        <Sequence
          key={"wipe-" + section.id}
          from={section.startFrame - 8}
          durationInFrames={16}
        >
          <SectionWipe color={WIPE_COLORS[index % WIPE_COLORS.length]} />
        </Sequence>
      ))}

      {lines.map((line) => (
        <Sequence key={"voice-" + line.id} from={line.startFrame}>
          <Audio src={staticFile(line.file)} volume={1} />
        </Sequence>
      ))}

      <Audio
        src={staticFile("audio/bgm-full.wav")}
        loop
        volume={bgmVolume}
        loopVolumeCurveBehavior="extend"
      />

      {sfx.map((item, index) => (
        <Sequence key={"sfx-" + index} from={item.frame}>
          <Audio src={staticFile(item.file)} volume={item.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
