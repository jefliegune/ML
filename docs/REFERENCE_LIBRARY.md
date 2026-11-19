# 参考库与设计资产

这个仓库把三个开源项目的**方法、目录和可检验参数**整理成了本地设计资产，而不是把它们的成片当成滤镜模板。

目标很简单：下一条视频不再从空白画布开始，而是先选语法、再选色板、再选画法，最后才写具体画面。

## 三条上游项目

| 项目 | 作者 | 取用的东西 | 没有取用的东西 |
|---|---|---|---|
| [Vibe Knowledge Film](https://github.com/HeyChengC/vibe-knowledge-film) | HeyChengC | 无旁白知识片的讲解方法、字幕写法、画面语法、验收思路 | 成片、GIF、示例场景、引擎源码 |
| [Huashu Art Motion](https://github.com/alchaincyf/huashu-art-motion) | alchaincyf（花叔） | 8 套色板、36 条风格配方、9 张动画语法卡 | 样片、插画、角色、上游渲染器 |
| [MG Styles 15](https://github.com/Vincentwei1021/mg-styles-15) | Vincentwei1021 | 15 种 MG 风格、提示词要点、cue 时间轴格式、评审维度 | 555 MB 的完整仓库、demo 视频、音频、工程文件 |

三个项目都是 MIT 许可。完整的版权声明和许可文本见仓库根目录的 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。

### 关于 MG Styles 15 的说明

完整仓库约 555 MB，包含大量 demo 视频和工程素材。本次只下载了可复用的文本部分，放在本地的 `local/reference/mg-notes/`：

- `README.md`
- `prompts/01-*.md` 到 `prompts/22-*.md` 中的 15 份提示词
- `cues-01.json`
- `template.md`
- `LICENSE`

没有把 demo 视频、音频或工程文件复制进本仓库。`local/` 整个目录都被 `.gitignore` 忽略。

## Vibe 8 条

下面是根据 Vibe Knowledge Film 的 `references/visual-grammar.md`、`references/visualization.md` 和 `references/script.md` 整理出的八条操作规则。它们是本项目的执行摘要，不是上游原文的逐字复制。

1. **字幕说什么，屏上就发生什么。** 不是配一张相关的图，而是让句子里的名词、动词、数量真的出现并变化。
2. **一屏只讲一件事。** 同一时刻只有一个主体、一个焦点；其余元素退到三成亮度以下或直接离场。
3. **先找形象，再写画面。** 抽象概念要落到一个外行一眼认得的物：蛋、硬币、计数器、折线、门、天平。
4. **写不出动作的句子就删。** 分镜表里每一句都必须能填出“谁、怎么动、停在哪”；填不出来，说明这句话是议论，不是画面。
5. **颜色是词汇。** 每种颜色全片只表达一个意思，第一次出现时定好，后面不许破例。
6. **数字要长出来。** 数字从 0 数上去，进度条逐格亮，比例真的被切开；不要只把结果印在屏幕上。
7. **转场从旧画面里长出来。** 默认用溶解、变形、留一个点、推近穿过；硬切只留给真正的段落断裂。
8. **留白和回扣。** 全片 25%–40% 的时间没有字幕，让画面自己演；结尾回到开场的同一个画面，只改一处。

这八条现在用于两处：

- 新视频的脚本和分镜评审。
- 素材管理器的“设计资产”与“来源与许可”页面，提醒每个风格参数的来路。

## 目录是怎么生成的

源文件只放在本地，不进入仓库：

```text
local/reference/
├─ vibe-knowledge-film/      # 方法参考，不参与 catalog 生成
├─ huashu-art-motion/        # 色板、36 条风格配方、9 张语法卡
└─ mg-notes/                 # 15 份 MG 提示词、cue 示例、模板
```

生成命令：

```bash
npm run library:import
```

脚本是 `scripts/import-reference-libraries.mjs`，输出 `src/library/catalog.json`。它做四件事：

1. 从 `huashu-art-motion/references/色板.md` 解析 8 套色板。
2. 从 `huashu-art-motion/references/风格配方/INDEX.md` 解析 36 条风格配方。
3. 从 `huashu-art-motion/references/动画语法/*.md` 解析 9 张语法卡的一句话定义。
4. 从 `mg-notes/prompts/*.md` 解析 15 种 MG 风格的视觉特征、关键技法和原片信息，并读取 `cues-01.json` 作为时间轴示例。

生成结果是可提交的派生索引，不包含上游原文全文，也不包含任何媒体文件。没有 `local/reference/` 的克隆者仍然可以直接使用已提交的 `catalog.json`。

当前数量：

| 类别 | 数量 |
|---|---:|
| 色板 | 8 |
| MG 风格 | 15 |
| 花叔风格配方 | 36 |
| 动画语法 | 9 |

## 目录的数据结构

`src/library/index.ts` 把 JSON 转成有类型的只读数据：

```ts
import {PALETTES, STYLES, GRAMMARS, getPalette, getStyle} from "./library";

const style = getStyle("mg-01-flat-vector");
const palette = getPalette(style?.palette);
```

主要字段：

| 字段 | 用途 |
|---|---|
| `palettes[].colors` | `bg / surface / ink / sub / accent / accent2` 六个角色色 |
| `styles[].family` | `mg` 或 `huashu` |
| `styles[].quality` | 参考库里的星级，只用于排序，不代表本项目验收结果 |
| `styles[].visual` | MG 风格的视觉特征 |
| `styles[].techniques` | 最多四条关键技法 |
| `styles[].motion / transition` | 花叔配方的运动与转场摘要 |
| `grammars[].oneLiner` | 一句话语法，用来快速判断这条片该用什么讲法 |
| `cueSchema.example` | 以帧为单位的节拍表示例 |

## 在 Remotion 里怎么用

先选语法，再选色板，再选风格，最后才写场景。一个最小组合：

```tsx
import {CameraRig, KineticType, StyleTexture} from "./packaging";
import {getPalette, getStyle} from "./library";

const style = getStyle("mg-01-flat-vector");
const palette = getPalette(style?.palette);

<CameraRig move="push" amount={1.06} durationInFrames={90}>
  <KineticType
    tokens={["风格", "不是", "贴纸"]}
    accent={[2]}
    fontSize={140}
    highlight="marker"
  />
  <StyleTexture variant="grain" opacity={0.18} />
</CameraRig>;
```

新增的三个包装组件都是本项目自己实现的：

- `CameraRig`：`still / push / pull / pan-left / pan-right / snap` 六种运镜。
- `KineticType`：词级错峰入场，支持 `marker / block / none` 三种关键词高亮。
- `StyleTexture`：`paper / grain / halftone / scanlines / riso / vignette` 六种纹理叠层。

`MLStyleLab` 是这些资产的动态样张，展示 3 张 MG 风格卡、15 个风格 chip 和 9 张语法卡：

```bash
npm run render:stylelab
npm run master:stylelab
```

## Cue 时间轴

MG 的 cue 示例不是“感觉上的节奏”，而是一张以帧为单位的节拍表：

```json
{
  "fps": 30,
  "bpm": 120,
  "key": "F",
  "mode": "major",
  "build": 4,
  "drop": 6,
  "outro": 8,
  "frames": {
    "impact1": 15,
    "buildStart": 44,
    "hero": 84,
    "wipe": 150,
    "logo": 240
  }
}
```

用法是**先算一次，再传给场景**：

1. 用 `fps` 和 `bpm` 把小节换算成帧。
2. 把关键动作写进 `frames`，例如第一下冲击、主体入场、转场、logo 落位。
3. 场景只读具名事件帧，不在组件内部各自计算节奏。
4. 改 BPM 或段落长度时，只改 cue，不改每个场景。

这和本项目完整版的 `voiceTimeline.generated.ts` 是同一个思路：字幕、BGM ducking、音效和场景共享一条时间轴，避免各算各的。

## 新视频的选型顺序

1. **定语法。** 先问这条片是概念可视化、数据解释、产品演示、白板解说还是动态文字。语法决定镜头和信息密度。
2. **定色板。** 从 8 套里选一套，先保证正文、背景、强调色三者对比足够。
3. **定画法。** 从 15 种 MG 或 36 条花叔配方里选一条，只取它的运动逻辑，不照搬样片构图。
4. **定 cue。** 用 BPM 和段落长度排出冲击、铺陈、转折、落版。
5. **写分镜。** 每句字幕补上“屏上动作”，填不出来就改句子。
6. **做静帧 QC。** 先看主体大小、字幕安全区、颜色语义，再渲动态。

## 边界

- 仓库只分发**派生的元数据、术语和本项目原创代码**。
- 不包含上游 MP4、GIF、图片、字体、角色、音频或工程文件。
- 不把上游项目的品牌、作者署名或样片风格说成自己的原创。
- 如果要使用上游的媒体素材，必须回到对应仓库，按它的许可和署名要求单独处理。

