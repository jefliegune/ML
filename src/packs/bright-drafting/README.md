# 明亮制图台 `bright-drafting`

冷白网格、粗黑描边、正交路由线和词级字幕。适合系统解释、流程拆解、编排与结构说明类横板视频。

## 提供什么

| 组件 | 用途 |
|---|---|
| `BRIGHT_DRAFTING` / `BRIGHT_DRAFTING_PALETTE` | 六角色种子色与 Palette v2 token |
| `DraftingStage` | 冷白网格舞台，静态背景，不参与抖动 |
| `DraftingCamera` | 固定缩放与裁切，不承担整体位移 |
| `DraftingRoute` | 圆角正交路由线，可按进度生长 |
| `DraftingFlowDots` | 沿路径流动的圆点 |
| `DraftingToken` | 任务令牌 |
| `DraftingChip` / `DraftingPanel` | 标签与面板 |
| `DraftingGlyph` | 拆解、分派、合并、兜底、闸门、续跑、追踪、回归等线性图标 |
| `DraftingSectionTag` | 左上角章节标签 |
| `WordCaptionBar` | 词级字幕：逐词推进、关键词变色、浅色地面，无下划线 |
| `BrightDraftingShowcase` | 10 秒预览 Composition |

## 字幕用法

```tsx
import {WordCaptionBar, type CaptionLine} from "../../src/packs/bright-drafting";

const lines: CaptionLine[] = [
  {
    id: "l01",
    text: "每一步都能验收，交接写清楚。",
    highlights: ["验收", "交接"],
    startFrame: 0,
    endFrame: 90,
    captionStartFrame: 0,
    captionEndFrame: 90,
    words: [
      {text: "每一步", offset: 0.1, duration: 0.4},
      {text: "都能", offset: 0.6, duration: 0.3},
      {text: "验收", offset: 1.0, duration: 0.4},
      // 其余词...
    ],
  },
];

<WordCaptionBar lines={lines} accent={BRIGHT_DRAFTING.red} />
```

`words[].offset` 和 `duration` 以秒为单位，相对该句音频起点；`startFrame` 是该句在整片中的起始帧。没有词级时间戳时会自动退化为整句高亮。

## 镜头稳定性

`DraftingCamera` 只负责固定缩放与裁切，不提供整体位移。画面运动交给路由生长、流动点、令牌、展开和遮罩，避免整屏漂移让文字显得不稳定。

## 色板

| 角色 | 色值 |
|---|---|
| 背景 | `#E9EEF0` |
| 面板 | `#FFFFFF` |
| 正文 | `#10181D` |
| 次要文字 | `#53666F` |
| 强调 | `#D9482B` |
| 辅助 | `#2F6F7E` |
| 高亮 | `#F0B429` |

## 约束

- 画面内文字保持中文，不加入装饰编号和录制信息。
- 深色只用于小面积正文与强调，不把整块背景压暗。
- 字幕是底部浅色地面区，不覆盖主体内容；正文最低线保持在 894px 以上。
- 镜头保持固定，靠路径流动、令牌、展开和形变制造运动。

## 预览

```bash
npx remotion render src/index.ts BrightDraftingShowcase local/out/bright-drafting-showcase.mp4
```

或直接运行 `npm run dev` 在 Remotion Studio 里看 `BrightDraftingShowcase`。
