# 暖阳制图台 `bright-drafting`

暖纸黄网格、粗黑描边、五层语义色、正交路由线和词级字幕。适合系统解释、流程拆解、编排与结构说明类横板视频。

## 提供什么

| 组件 | 用途 |
|---|---|
| `BRIGHT_DRAFTING` / `BRIGHT_DRAFTING_PALETTE` | 六角色种子色与 Palette v2 token |
| `DraftingStage` | 暖纸黄网格舞台，静态背景，不参与抖动 |
| `DraftingCamera` | 固定缩放与裁切，不承担整体位移 |
| `DraftingRoute` | 圆角正交路由线，可按进度生长 |
| `DraftingFlowDots` | 沿路径流动的圆点 |
| `DraftingToken` | 任务令牌 |
| `DraftingChip` / `DraftingPanel` | 标签与面板，支持珊瑚、青、蓝、紫、绿、粉、琥珀等色调 |
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

## 成片清晰度约束

- 结构线至少 2px；路由和关键路径使用 4px，避免 1px 线在 H.264 色度抽样后发灰。
- 网格保持低对比，但不能靠高透明度颗粒制造“纸感”。全屏 `grain / paper / scanlines` 的透明度控制在 0.12–0.18。
- 正文使用深墨色，不用中灰作为主要字色。
- 镜头固定；只由路由生长、令牌移动、面板展开和词级高亮承担运动。
- 细线和小字密集型项目可在 `video.project.json` 中设置 `"render": {"imageFormat": "png"}`。日常预览保持 JPEG。

预览与成片参数必须分开：`preview:section --draft` 可以使用低分辨率和 CRF 20–23，成片使用 `CRF 14–16`、`scale=1`。完整规则见 [视频清晰度与成片质检](../../../docs/VIDEO_QUALITY.md)。

## 色板

| 角色 | 色值 |
|---|---|
| 背景 | `#F2E3B6` |
| 面板 | `#FFFDF7` |
| 正文 | `#1B1710` |
| 次要文字 | `#5F5644` |
| 任务 / 风险 | `#D94A33` |
| 轨迹 | `#12737F` |
| 指标 / 架构 | `#2357D9` |
| 判定 | `#6A45D8` |
| 实验 / 通过 | `#2C7D52` |
| 人工审计 | `#C94E7E` |
| 警告 | `#B77600` |

## 约束

- 画面内文字保持中文，不加入装饰编号和录制信息。
- 暖黄只做舞台底色，内容放在暖白面板上；彩色只编码层级和状态，不把整块背景压暗。
- 字幕是底部浅色地面区，不覆盖主体内容；正文最低线保持在 894px 以上。
- 镜头保持固定，靠路径流动、令牌、展开和形变制造运动。

## 预览

```bash
npx remotion render src/index.ts BrightDraftingShowcase local/out/bright-drafting-showcase.mp4
```

或直接运行 `npm run dev` 在 Remotion Studio 里看 `BrightDraftingShowcase`。
