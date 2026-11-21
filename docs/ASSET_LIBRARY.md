# 素材库清单

素材库收录会重复使用的视觉、动效、声音、参考文档和字体。一次性画出来的场景元素留在具体 Scene 中，不升级为公共资产。

风格、色板和动画语法的索引在 [参考库与设计资产](REFERENCE_LIBRARY.md)；本文件只记录已经封装成组件的资产。导入资产和原创风格包分开登记，避免把上游方法说成本仓库原创。

## 背景

| 资产 | 代码 | 用途 | 约束 |
|---|---|---|---|
| 纸张底 | `PackagingBackground tone="paper"` | 解释、对比、数据段 | 默认底色，适合大量文字 |
| 墨黑底 | `PackagingBackground tone="ink"` | 深色论证、流程、结论段 | 需要提高亮色面积 |
| 信号蓝底 | `PackagingBackground tone="signal"` | 强转折、章节封面 | 一集最多 1–2 次 |
| 点阵纹理 | 内置于背景 | 纸感与科技感 | 不额外叠加相同点阵 |
| 斜线纹理 | 内置于背景 | 编辑设计感 | 只做低对比背景 |
| 半调圆点 | `backgroundImage` 组合 | 强调色块、资产卡 | 不覆盖正文 |
| 超大章节数字 | 内置于背景 | 系列识别 | 不参与信息表达 |
| 四角标记 | `CornerMarks` | 统一画面边界 | 颜色跟随前景色 |

## 形状与装饰

| 资产 | 代码 | 用途 |
|---|---|---|
| 贴纸 | `Sticker` | 重点结论、关键词、状态 |
| 胶带 | `TapeStrip` | 拼贴细节、卡片固定 |
| 星爆 | `Burst` | 结果、冲击、庆祝 |
| 编辑分隔线 | `EditorialRule` | 章节底栏、信息分组 |
| 进度轨道 | 现有场景内自绘 | 流程、进度、层级 |
| 印章 | `ImpactStamp` | 错误、命中、结论 |

## 内容组件

| 资产 | 代码 | 用途 |
|---|---|---|
| 标题 | `Headline` | display / h1 / h2 / h3 |
| 标签 | `Kicker` | 栏目、章节、资产分类 |
| 纸卡 | `PaperCard` | 信息卡、对比卡、数据卡 |
| 章节开场 | `ChapterOpener` | 新章节第一屏 |
| 结尾卡 | `EndSlate` | 结论、系列标识、下期预告 |

## 动效

| 资产 | 代码 | 使用场景 |
|---|---|---|
| 标准入场 | `RiseIn` | 标题、卡片、正文 |
| 弹出 | `PopIn` | 贴纸、数字、印章 |
| 线条生长 | `DrawRule` | 分隔线、流程线 |
| 色块擦除 | `SectionWipe` | 章节边界 |
| 冲击印章 | `ImpactStamp` | 错误、正确答案、结论 |
| 亮闪 | `CutFlash` | 强节奏切换 |
| 运镜 | `CameraRig` | 推、拉、左右平移、急推 |
| 词级字效 | `KineticType` | 标题、关键词、结论句 |
| 风格纹理 | `StyleTexture` | 纸纹、颗粒、半调、扫描线、孔版、暗角 |

## 原创风格包

原创风格包放在 `src/packs/<pack-id>/`，每个包都有自己的 `pack.json`、统一出口、用法说明和 10 秒预览 Composition。它们不是“参考配方”，而是可以直接挂进新片的代码组件。

| 风格包 | 入口 | 预览 Composition | 提供什么 |
|---|---|---|---|
| 像素街机 `pixel-arcade` | `src/packs/pixel-arcade/index.ts` | `PixelArcadeShowcase` | `PixelStage`、`PixelHud`、`PixelCaptionBar`、`PixelGuideActor`、`PixelHookScene`、`PixelWorkflowScene`、`PixelPipelineScene`、`PixelGlitch` |

像素街机包的核心能力：

- 深色 CRT 舞台、扫描线、硬边像素卡片。
- 像素讲解员，支持 `idle`、`wave`、`point` 三种姿态和配色。
- 像素字幕条，支持关键词高亮和逐字入场。
- 三步工作流卡、终端流水线、故障转场。
- 10 秒预览样张，用来在改动后快速验收。

使用方式见 [像素街机 README](../src/packs/pixel-arcade/README.md)。

## 参考文档与字体

| 资产 | 位置 | 用途 |
|---|---|---|
| Huashu 完整风格卡 | `docs/reference/huashu/风格配方/` | 36 张实做风格卡，包含笔法、材质、运动与短板 |
| Huashu 完整语法卡 | `docs/reference/huashu/动画语法/` | 9 种解说语法的镜头、节奏和信息结构 |
| Huashu 方法文档 | `docs/reference/huashu/` | 拆解、机制、镜头语言、角色、长卷、风格迁移等方法 |
| Huashu 色板说明 | `docs/reference/huashu/色板.md` | 8 套色板的完整角色色与适用题材 |
| Huashu OFL 字体 | `public/fonts/huashu/` | 45 个 WOFF 文件；`HuashuFonts` 组件负责注册 @font-face |
| 机器可读清单 | `src/library/huashu.json` | 卡路径、来源提交、字体 URL、许可和排除项 |

这些是参考资产，不是已经封装的 React 组件。使用时先把选中的卡提炼成 `src/packs/` 或具体 Scene，再把通用部分沉淀为代码。

## 声音

| 资产 | 文件 | 默认用途 |
|---|---|---|
| `whoosh` | `public/sfx/whoosh.wav` | 章节转场 |
| `pop` | `public/sfx/pop.wav` | 卡片/数字出现 |
| `click` | `public/sfx/click.wav` | 微交互、进度计数 |
| `ding` | `public/sfx/ding.wav` | 成功、命中、确认 |
| `impact` | `public/sfx/impact.wav` | 错误、盖章、结论 |
| `riser` | `public/sfx/riser.wav` | 揭示、结论出现前的蓄力 |
| 默认旁白示例 | `public/audio/voice-sample.mp3` | 试听默认音色、检查语速与停顿 |

## 沉淀规则

一条新片交付后，按下面的标准决定哪些资产进入素材库：

| 会进入 | 不会进入 |
|---|---|
| 换文案还能用的组件 | 只服务这一条片的画面 |
| 换色板还能用的版式 | 写死品牌色和产品名的卡片 |
| 换项目还能用的场景骨架 | 具体台词、口号、分镜 |
| 可配置的动效和声音规则 | TTS 音频、精确时间轴、成片 |

晋升后必须更新：

- `src/packs/<pack-id>/pack.json`
- `src/library/original-packs.json`
- `src/Composition.tsx`
- 本文件的原创风格包表

最后运行：

```bash
npm run pack:check
npm run lint
```

`pack:check` 会拦住 manifest 缺字段、预览未注册、组件未导出、色板/风格未登记，以及包里误放私有媒体或引用 `local/` 的情况。

## 使用顺序

1. 先选背景和章节模板。
2. 再选一个内容组件承载信息。
3. 只增加一个强调资产：贴纸、印章或星爆。
4. 最后挂动效和声音。
5. 如果同屏需要两个以上强调资产，先拆镜头。
