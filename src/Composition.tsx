import {Audio} from "@remotion/media";
import {AbsoluteFill, Composition, interpolate, staticFile} from "remotion";
import {SceneBackground} from "./components/Design";
import {FullVideo} from "./full/FullVideo";
import {OpeningAudio, OpeningVisuals} from "./opening/Opening";
import {PackagingShowcase} from "./packaging/PackagingShowcase";
import {COLORS} from "./theme";

const OPENING_VOICE_WINDOWS = [
  [9, 68],
  [77, 150],
  [157, 231],
  [235, 299],
];

const previewBgmVolume = (frame: number) => {
  let volume = 0.24;
  for (const [start, end] of OPENING_VOICE_WINDOWS) {
    const ducked = interpolate(
      frame,
      [start - 4, start + 1, end - 2, end + 4],
      [volume, 0.105, 0.105, volume],
      {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
    );
    volume = Math.min(volume, ducked);
  }
  return volume;
};

export const MLExplainerPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.cream}}>
      <OpeningVisuals />
      <OpeningAudio />
      <Audio
        src={staticFile("audio/bgm-preview.wav")}
        volume={previewBgmVolume}
      />
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="MLExplainerFull"
        component={FullVideo}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MLPackagingSystem"
        component={PackagingShowcase}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MLExplainerPreview"
        component={MLExplainerPreview}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MLExplainerBackgroundTest"
        component={() => <SceneBackground index="01" />}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

