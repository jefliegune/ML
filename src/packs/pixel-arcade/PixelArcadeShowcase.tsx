import type {FC} from "react";
import {Audio} from "@remotion/media";
import {AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {PIXEL_ARCADE as C} from "./tokens";
import {PixelCaptionBar, type PixelCaptionCue} from "./PixelCaption";
import {PixelGlitch, PixelHud, PixelStage} from "./PixelChrome";
import {PixelGuideActor} from "./PixelGuide";
import {PixelHookScene} from "./PixelGuide";
import {PixelPipelineScene, type PixelPipelineStep} from "./PixelPipeline";
import {PixelWorkflowScene, type PixelStep} from "./PixelStepUI";

const STEPS: PixelStep[] = [
  {
    index: "01",
    key: "assets",
    title: "选素材",
    english: "ASSETS",
    command: "npm run assets",
    detail: "先打开素材库，挑现成的组件与镜头语言。",
    accent: C.mint,
  },
  {
    index: "02",
    key: "style",
    title: "定风格",
    english: "STYLE",
    command: "pixel-arcade",
    detail: "选色板、动效和版式，让整条片子说同一种话。",
    accent: C.yellow,
  },
  {
    index: "03",
    key: "render",
    title: "再渲染",
    english: "RENDER",
    command: "npm run pipeline",
    detail: "一条命令跑完画面、母带和自动质检。",
    accent: C.blue,
  },
];

const PIPELINE_STEPS: PixelPipelineStep[] = [
  {label: "RENDER", detail: "ENCODING", color: C.blue},
  {label: "MASTER", detail: "LOUDNESS", color: C.yellow},
  {label: "QC", detail: "CHECKING", color: C.coral},
];

const CUES: PixelCaptionCue[] = [
  {from: 0, to: 111, text: "一套像素风教程模板，三步完成。", highlights: ["三步"], label: "VOICE / 01"},
  {from: 111, to: 198, text: "选素材，定风格，再渲染。", highlights: ["选素材", "定风格", "渲染"], label: "VOICE / 02"},
  {from: 198, to: 300, text: "剩下的，交给项目自动完成。", highlights: ["自动完成"], label: "VOICE / 03"},
];

const SoundCue: FC<{from: number; file: string; volume: number}> = ({from, file, volume}) => (
  <Sequence from={from} durationInFrames={60} layout="none">
    <Audio src={staticFile(file)} volume={volume} />
  </Sequence>
);

export const PixelArcadeShowcase: FC = () => {
  const frame = useCurrentFrame();
  const pose: "idle" | "wave" | "point" =
    frame < 92 ? "wave" : frame < 198 ? "point" : frame < 258 ? "idle" : "wave";
  const guideCaption = frame < 111 ? "3 STEPS" : frame < 198 ? "PICK ONE" : "AUTO RUN";

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PixelStage indexText="03">
        <Sequence durationInFrames={111} premountFor={10}>
          <PixelHookScene
            badge="START HERE / PROJECT TUTORIAL"
            titleLead="想快速做一条视频？"
            titleMain="先记住这"
            titleAccent="3"
            titleSuffix="步"
            flow={["ASSETS", "STYLE", "RENDER"]}
            steps={STEPS}
          />
        </Sequence>
        <Sequence from={111} durationInFrames={87} premountFor={30}>
          <PixelWorkflowScene
            tag="WORKFLOW / 03 STEPS"
            heading="一套流程，三步开工"
            steps={STEPS}
          />
        </Sequence>
        <Sequence from={198} durationInFrames={102} premountFor={30}>
          <PixelPipelineScene
            tag="AUTO PIPELINE"
            heading="剩下的，交给项目"
            command="npm run pipeline"
            steps={PIPELINE_STEPS}
          />
        </Sequence>
        <PixelHud
          brand="PIXEL ARCADE / STYLE PACK"
          subtitle="REUSABLE COMPONENTS · 10S SHOWCASE"
          chapters={["01 素材", "02 风格", "03 渲染"]}
          chapterStarts={[0, 140, 169]}
          totalFrames={300}
        />
        <PixelGuideActor
          pose={pose}
          caption={guideCaption}
          accent={frame < 111 ? C.mint : frame < 198 ? C.yellow : C.mint}
        />
        <PixelCaptionBar cues={CUES} accent={C.mint} />
        <PixelGlitch windows={[[106, 115], [193, 203]]} />
      </PixelStage>
      <Audio
        src={staticFile("audio/bgm-preview.wav")}
        volume={(frame) => interpolate(frame, [0, 10, 284, 299], [0, 0.19, 0.19, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
      <SoundCue from={0} file="sfx/whoosh.wav" volume={0.28} />
      <SoundCue from={46} file="sfx/pop.wav" volume={0.12} />
      <SoundCue from={53} file="sfx/pop.wav" volume={0.12} />
      <SoundCue from={60} file="sfx/click.wav" volume={0.14} />
      <SoundCue from={106} file="sfx/riser.wav" volume={0.2} />
      <SoundCue from={140} file="sfx/click.wav" volume={0.13} />
      <SoundCue from={169} file="sfx/click.wav" volume={0.16} />
      <SoundCue from={193} file="sfx/whoosh.wav" volume={0.24} />
      <SoundCue from={207} file="sfx/click.wav" volume={0.11} />
      <SoundCue from={221} file="sfx/click.wav" volume={0.1} />
      <SoundCue from={271} file="sfx/ding.wav" volume={0.26} />
    </AbsoluteFill>
  );
};
