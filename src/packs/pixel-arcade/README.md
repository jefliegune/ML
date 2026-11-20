# Pixel Arcade / 像素街机

一个可复用的像素风视频风格包。它只包含通用视觉、动效和组件，不包含具体视频的文案、配音、时间轴或成片。

## 预览

```bash
npx remotion render PixelArcadeShowcase local/out/pixel-arcade-showcase.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p
```

## 最小用法

```tsx
import {
  PixelCaptionBar,
  PixelGuideActor,
  PixelHud,
  PixelStage,
  PixelWorkflowScene,
} from "../packs/pixel-arcade";

export const MyVideo = () => (
  <PixelStage>
    <PixelWorkflowScene
      tag="WORKFLOW / 03 STEPS"
      heading="三步完成"
      steps={steps}
    />
    <PixelHud
      chapters={["01 素材", "02 风格", "03 渲染"]}
      chapterStarts={[0, 90, 180]}
      totalFrames={300}
    />
    <PixelGuideActor pose="point" caption="PICK ONE" />
    <PixelCaptionBar cues={captions} />
  </PixelStage>
);
```

## 约束

- 文案、配音、时间轴放在 `local/projects/<project>/`，不要放进风格包。
- 新增组件先检查是否能换文案、换色板、换项目继续使用。
- 修改后运行 `npm run pack:check`。
