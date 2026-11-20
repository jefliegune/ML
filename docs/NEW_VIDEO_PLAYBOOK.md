# 新视频操作手册

> 本文讲的是如何用这套通用框架生产一条新视频。仓库不包含任何具体视频项目的文案、配音、分镜和成片。

## 1. 准备独立工作区

建议为每条视频复制一份框架到新目录，避免不同项目的素材和时间轴互相覆盖：

```text
video-project-02/
```

复制时保留：

- `src/`
- `scripts/`
- `public/sfx/`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `remotion.config.ts`
- `eslint.config.mjs`

不要复制：

- `local/`：旧成片、QC 帧、私有内容和归档示例
- `out/`、`dist/`
- `node_modules/`：在新目录重新安装即可

## 2. 先写内容，不做画面

在项目工作区里建立自己的文案清单，例如 `local/project/lines.json`。每条 line 至少包含：

- `id`：稳定标识
- `text`：旁白文本
- `highlights`：需要强调的词
- `startFrame`：开场段落可以直接指定；后续段落由真实音频时长计算

建议：

- 单句不超过约 36 个汉字
- 每句 1–2 个高亮词
- 每个 section 3–5 句
- 先朗读一遍，检查是否绕口

## 3. 生成旁白和时间轴

使用你选择的 TTS 工具逐句生成音频，然后用 `ffprobe` 读取真实时长，计算每句的 `startFrame`、`endFrame`、`captionStartFrame` 和 `captionEndFrame`。

时间轴必须满足：

- 字幕和旁白读取同一组帧
- 场景 `Sequence` 的时长等于段落长度
- BGM ducking 和 SFX 使用同一组段落边界

如果需要参考实现，本地归档的示例脚本在 `local/examples/` 中，但它不属于公开框架，也不会随仓库发布。

## 4. 拆场景

建议每个 section 建立一个场景组件：

```text
src/scenes/SceneXxx.tsx
```

每个场景只负责一个视觉命题，例如：

- 对比两个概念
- 展示一个数字变化
- 拆解一张图
- 展示一个流程
- 展示一次成功/失败

优先使用：

- `src/packaging` 里的 `PackagingBackground`
- `PaperCard`
- `Kicker`
- `Headline`
- `Sticker`
- `ImpactStamp`
- `RiseIn` / `PopIn`
- `SectionWipe`

只有现有资产不够时才新增组件，并且先判断它是否会被复用。

## 5. 总装与注册

在项目工作区里编辑总装组件：

- 按 section 顺序挂载 `Sequence`
- 确保每个 `Sequence` 的 `durationInFrames` 等于段落长度
- 更新转场、SFX 和深色段落列表
- 在 `src/Composition.tsx` 注册自己的 Composition ID 和输出尺寸

通用框架默认只注册 `PackagingSystem`、`StyleLab` 和 `BackgroundTest`；具体视频项目在自己的副本里注册。

## 6. BGM 与音效

通用音效在 `public/sfx/`。BGM 可以使用自己的生成器或授权音乐，原则是：

- 旁白期间自动 duck
- 结尾有收束
- 段落转折处有轻微节奏变化
- 同一系列可以沿用音色和节奏型，但不要直接复用同一条完整 BGM

## 7. 质检

先抽帧，再渲染：

```bash
npx remotion still <CompositionId> local/out/qc/frame-0300.png --frame=300 --scale=0.5 --overwrite
```

至少检查：

- 章节标题
- 最长字幕
- 数字卡片
- 深色/浅色切换
- 对比卡片
- 片尾结论句

## 8. 渲染和母带

```bash
npx remotion render <CompositionId> local/out/video-project.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=192k
node scripts/master-video.mjs local/out/video-project.mp4 local/out/video-project-final.mp4 -15.5
node scripts/verify-video.mjs local/out/video-project-final.mp4
```

母带目标：

- 响度约 -15.5 至 -16 LUFS
- True Peak ≤ -1.0 dBTP
- 48kHz stereo

如果源文件峰值过高，不要直接加增益，使用 loudnorm 或限幅方案。

## 9. 交付

最终保留：

- `local/out/video-project-final.mp4`
- `local/out/video-project-cover.png`
- 项目源码与配置

可删除：

- `local/out/video-project.mp4`（母带前版本）
- `local/out/qc/`
- `local/out/frame-*.png`
- `node_modules/.cache/webpack`
- `node_modules/.remotion/chrome-headless-shell`（下次渲染会自动下载）

## 10. 一条新片的验收顺序

```text
脚本可读
→ 旁白时长正确
→ 字幕不溢出
→ 每段有一个视觉动作
→ 转场不重叠
→ 音效不抢旁白
→ 抽帧无遮挡
→ verify-video 通过
```
