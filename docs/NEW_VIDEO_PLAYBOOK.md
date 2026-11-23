# 新视频操作手册

> 本文讲的是如何用这套通用框架生产一条新视频。仓库不包含任何具体视频项目的文案、配音、分镜和成片。

核心原则：**同一个仓库、公共资产、私有项目**。不要为每条视频复制一份框架；复制会让风格和组件永远沉淀不下来。

## 0. 开工前先检索

先花 5 分钟看一遍现成资产，避免重新造轮子：

```bash
npm run assets
```

在设计资产页里确认：

- 有没有可用的色板、风格和动画语法。
- 有没有现成风格包，例如 `pixel-arcade`。
- 现有 HUD、字幕条、流程场景、终端场景能不能直接换文案使用。

只有现有资产不够时，才新增组件。新增前先问一句：**它会不会在下一个项目里继续用？**

## 1. 建立本地项目目录

在同一个仓库里建立私有项目：

```text
local/projects/<project-name>/
├─ lines.json                  # 旁白清单，私有
├─ timeline.generated.json     # 脚本生成的精确时间轴，私有
├─ timeline.generated.ts       # 场景读取的时间轴，私有
├─ video.project.json          # 入口、Composition、输出与质检规格，私有
├─ Cover.tsx                   # 固定 1440×1080 的 4:3 封面 Composition
├─ SceneXxx.tsx                # 这一条片专用的场景，私有
├─ Root.tsx                    # 这一条片的 Composition 入口，私有
└─ README.md                   # 项目说明，可选
```

旁白输出到：

```text
public/projects/<project-name>/audio/
```

公共与私有的边界：

| 位置 | 内容 | 是否进 Git |
|---|---|---|
| `src/packs/` | 可复用风格包、组件、动效、预览 Composition | 是 |
| `src/packaging/` | 通用视觉包装系统 | 是 |
| `src/library/` | 设计资产索引 | 是 |
| `local/projects/` | 文案、时间轴、项目专用场景、Root | 否 |
| `public/projects/` | 项目旁白、项目 BGM | 否 |
| `local/out/` | 成片、母带、QC 帧、封面 | 否 |

需要并行开发时，用 Git branch 或 worktree：

```bash
git worktree add ../video-production-system-next -b video/next-project
```

不要复制整个仓库，也不要把 `node_modules`、`local/` 和 `public/projects/` 带过去。

## 2. 先写内容，不做画面

在 `local/projects/<project-name>/lines.json` 建立旁白清单。每条 line 至少包含：

- `id`：稳定标识
- `text`：旁白文本
- `highlights`：需要强调的词
- `startFrame`：开场段落可以直接指定；后续段落由真实音频时长计算

建议：

- 单句不超过约 36 个汉字。
- 每句 1–2 个高亮词。
- 每个 section 3–5 句。
- 先朗读一遍，检查是否绕口。

格式参考 [旁白与语音指南](VOICE_GUIDE.md)。

## 3. 生成旁白和时间轴

```bash
npm run voice -- --manifest local/projects/<project-name>/lines.json
```

脚本会用默认音色逐句生成音频，再用 `ffprobe` 读取真实时长，计算每句的 `startFrame`、`endFrame`、`captionStartFrame` 和 `captionEndFrame`。

时间轴必须满足：

- 字幕和旁白读取同一组帧。
- 场景 `Sequence` 的时长等于段落长度。
- BGM ducking 和 SFX 使用同一组段落边界。

需要强制重新生成：

```powershell
$env:FORCE_TTS="1"; npm run voice -- --manifest local/projects/<project-name>/lines.json
```

## 4. 先选风格，再拆场景

选型顺序：

1. **语法**：这条片是概念可视化、数据解释、产品演示、白板解说还是动态文字。
2. **色板**：从 9 套里选一套，保证正文、背景、强调色对比足够。
3. **风格包或配方**：优先用现成风格包；没有合适的，再从 52 个风格配方里取运动逻辑。
4. **声音规则**：转场、点击、成功、错误各自只保留一个主音效。

每个 section 建立一个场景组件，放在 `local/projects/<project-name>/`：

```text
SceneHook.tsx
SceneWorkflow.tsx
SceneProof.tsx
SceneOutro.tsx
```

每个场景只负责一个视觉命题：

- 对比两个概念
- 展示一个数字变化
- 拆解一张图
- 展示一个流程
- 展示一次成功/失败

优先使用 `src/packs/` 和 `src/packaging/` 里的现成组件。场景里不要复制一份公共组件再改；需要变体就给公共组件加 props。

## 5. 总装与本地注册

在私有项目里建立 `Root.tsx`，按 section 顺序挂载 `Sequence`：

```tsx
import {Composition, registerRoot} from "remotion";
import {MyProjectVideo} from "./MyProjectVideo";

const LocalRoot = () => (
  <Composition
    id="MyProjectVideo"
    component={MyProjectVideo}
    durationInFrames={7200}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(LocalRoot);
```

检查：

- 每个 `Sequence` 的 `durationInFrames` 等于段落长度。
- 转场不重叠，不吞掉字幕。
- 深色段落列表、SFX 和 BGM ducking 与时间轴一致。

公共风格包的预览 Composition 才注册到 `src/Composition.tsx`。私有视频的 Composition 留在 `local/`。

## 6. BGM 与音效

通用音效在 `public/sfx/`。BGM 可以使用自己的生成器或授权音乐，原则是：

- 旁白期间自动 duck。
- 结尾有收束。
- 段落转折处有轻微节奏变化。
- 同一系列可以沿用音色和节奏型，但不要直接复用同一条完整 BGM。

新增音效先判断是不是通用：转场、点击、成功、错误可以进 `public/sfx/`；只服务某条片的旋律和人声不进仓库。

## 7. 先抽帧，再渲染

改完场景先跑关键帧画廊，不要直接整片渲染：

```bash
npm run preview:shots -- --project local/projects/<project-name> --section <section-id>
npm run preview:shots -- --project local/projects/<project-name> --section <section-id> --frames 30,120,300
```

脚本会打包一次、渲染 3–4 帧，并生成 `local/preview/<project-name>/index.html`。画廊带字幕安全区参考线，适合逐段检查叠字、残影、空镜和越界。

至少检查：

- 第一屏和章节标题
- 最长字幕句
- 数字卡片
- 深色/浅色切换处
- 对比卡片和贴纸边缘
- 片尾结论句
- 最后一帧

抽帧通过后再渲染完整视频，避免花几分钟渲染才发现字幕溢出。

需要确认动效节奏、转场和音画同步时，再渲染单个段落草稿：

```bash
npm run preview:section -- --project local/projects/<project-name> --section <section-id> --draft
```

底层仍可直接使用 `remotion still` 渲染单帧，但优先用上面的脚本，避免每帧重复 bundle。

## 8. 渲染、母带和质检

先在 `video.project.json` 声明项目规格和 4:3 封面 Composition，再运行统一流水线：

```bash
npm run check:timeline -- --project local/projects/<project-name>
npm run pipeline -- --project local/projects/<project-name> --dry-run
npm run pipeline -- --project local/projects/<project-name>
```

流水线会先检查公共目录边界和时间轴，再依次执行渲染、母带、质检和 4:3 封面。字段说明见 [项目清单与统一流水线](PROJECT_MANIFEST.md)。

封面 Composition 必须是 `1440×1080`，并在清单中通过 `cover.composition` 注册。默认输出为 `local/out/<project-name>-cover-4x3.png`；也可以单独执行：

```bash
npm run cover -- --project <id|path>
```

需要单独调试时，三步仍可手动执行，后一步依赖前一步：

```bash
npx remotion render local/projects/<project-name>/Root.tsx <CompositionId> local/out/<project-name>.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=192k
node scripts/master-video.mjs local/out/<project-name>.mp4 local/out/<project-name>-final.mp4 -15.5
node scripts/verify-video.mjs local/out/<project-name>-final.mp4
```

母带目标：

- 响度约 -15.5 至 -16 LUFS
- True Peak ≤ -1.0 dBTP
- 48kHz stereo

如果源文件峰值过高，不要直接加增益，使用 loudnorm 或限幅方案。

## 9. 交付

最终保留：

- `local/out/<project-name>-final.mp4`
- `local/out/<project-name>-cover-4x3.png`
- 私有项目源码与配置

可删除：

- `local/out/<project-name>.mp4`（母带前版本）
- `local/out/qc/`
- `local/out/frame-*.png`
- `node_modules/.cache/webpack`
- `node_modules/.remotion/chrome-headless-shell`（下次渲染会自动下载）

## 10. 沉淀：把这一条片变成下一条片的起跑线

交付后先别关项目。用 15 分钟做一次资产复盘。

### 10.1 列出候选

把这次新做的东西分成四类：

| 类型 | 例子 |
|---|---|
| 视觉组件 | HUD、字幕条、步骤卡、终端窗口、讲解员 |
| 动效 | 像素弹入、故障转场、进度条、扫描线 |
| 声音 | 成功音、错误音、转场音、BGM 节奏型 |
| 结构 | 三步工作流、前后对比、流程流水线、结论卡 |

### 10.2 判定能不能晋升

只保留满足以下条件的资产：

- 换文案还能用。
- 换色板还能用。
- 换项目还能用。
- 通过 props 配置，而不是改内部代码。
- 不依赖某一条片的音频、时间轴或文件名。

以下内容一律不晋升：

- 具体产品名、台词、口号。
- TTS 音频、精确 `startFrame` / `endFrame`。
- 成片、QC 帧、封面。
- 只出现一次的项目专用画面。

判断标准只有一句：**下一个项目能不能只改 props 和文案就用起来。**

### 10.3 晋升成风格包

目录：

```text
src/packs/<pack-id>/
├─ pack.json          # manifest：id、入口、预览、色板、组件
├─ index.ts           # 统一出口
├─ tokens.ts          # 色板、字体、常量
├─ README.md          # 用法和约束
├─ <Component>.tsx    # 通用组件
└─ <Pack>Showcase.tsx # 10 秒预览 Composition
```

`pack.json` 至少包含：

```json
{
  "id": "your-pack",
  "name": "风格包名称",
  "version": "1.0.0",
  "status": "stable",
  "entry": "./index.ts",
  "previewComposition": "YourPackShowcase",
  "palette": "your-palette",
  "description": "一句话说明",
  "bestFor": "适合的视频类型",
  "tags": ["tag"],
  "components": ["YourComponent"]
}
```

同时更新：

1. `src/library/original-packs.json`：登记 palette、style、pack。
2. `src/Composition.tsx`：注册 `<Pack>Showcase`。
3. `src/packs/<pack-id>/README.md`：写清最小用法和约束。
4. `docs/ASSET_LIBRARY.md`：补一行资产说明。

### 10.4 验收沉淀结果

```bash
npm run pack:check
npm run lint
```

`pack:check` 会检查：

- manifest 必填字段和状态。
- 入口文件是否存在、是否在包内。
- 预览 Composition 是否注册。
- 色板、风格、pack 是否在 `original-packs.json` 里对应。
- 组件是否真的从包内导出。
- 包里是否误放音频、视频等私有媒体。
- 代码里是否引用 `local/`、`public/projects/` 等私有路径。

最后渲染 10 秒预览并抽两帧确认：

```bash
npx remotion render <Pack>Showcase local/out/<pack-id>-showcase.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p
```

### 10.5 提交边界

可以提交：

- `src/packs/` 下的代码、manifest、README。
- `src/library/original-packs.json`。
- `src/Composition.tsx` 里的公共预览注册。
- `public/sfx/` 里新沉淀的通用音效。

不要提交：

- `local/` 下的任何内容。
- `public/projects/` 下的项目旁白和 BGM。
- 具体文案、时间轴、成片、QC 帧、封面。

## 11. 一条新片的验收顺序

```text
现成资产检索
→ 脚本可读
→ 旁白时长正确
→ 字幕不溢出
→ 每段有一个视觉动作
→ 转场不重叠
→ 音效不抢旁白
→ 抽帧无遮挡
→ verify-video 通过
→ 可复用资产晋升
→ pack:check + lint 通过
```
