# 新视频操作手册

## 1. 复制还是继续用当前工程

建议把当前工程复制成新目录，避免旧片和新片互相覆盖：

```text
ml-explainer-02/
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

- `local/out/`：旧成片与中间文件
- `public/audio/full/`：旧旁白
- `node_modules/`：可以在新目录重新安装

如果环境不能联网，可以复制 `node_modules`，但会多占约 866MB。

## 2. 先写内容，不做画面

编辑 `scripts/full-lines.json`：

- `voice`：沿用 `zh-CN-XiaoxiaoNeural` 或换成新音色
- `rate`：沿用 `+15%` 或按节奏调整
- `lines`：每句包含 `id`、`section`、`text`、`highlights`

建议：

- 单句不超过约 36 个汉字
- 每句 1–2 个高亮词
- 每个 section 3–5 句
- 先朗读一遍，检查是否绕口

## 3. 生成旁白和时间轴

```bash
node scripts/generate-full-voiceover.mjs
```

需要：

- Python 3，以及 `pip install edge-tts`
- 网络连接
- 可选：`EDGE_TTS_PYTHONPATH` 指向本地 edge-tts 目录，`PYTHON` 指定解释器

输出：

- `public/audio/full/vXX.mp3`
- `src/full/voiceTimeline.generated.ts`
- `scripts/full-lines.generated.json`

如果只想重算时间轴、不重新合成语音：

```text
不要设置 FORCE_TTS=1
```

脚本会跳过已存在的音频，只读取时长。

## 4. 拆场景

建议按 section 建立场景：

```text
src/full/scenes/SceneXxx.tsx
```

每个场景只负责一个视觉命题，例如：

- 对比两个概念
- 展示一个数字变化
- 拆解一张图
- 展示一个流程
- 展示一次成功/失败

优先使用：

- `src/packaging` 的 `PackagingBackground`
- `PaperCard`
- `Kicker`
- `Headline`
- `Sticker`
- `ImpactStamp`
- `RiseIn` / `PopIn`
- `SectionWipe`

只有现有资产不够时才新增组件，并且先判断它是否会被复用。

## 5. 总装

编辑 `src/full/FullVideo.tsx`：

- 按 `FULL_SECTIONS` 顺序挂载 `Sequence`
- 确保每个 `Sequence` 的 `durationInFrames` 等于段落长度
- 更新 `SECTION_WIPES`
- 更新 `SFX` 时间点
- 检查 `DARK_SECTIONS` 是否覆盖所有深色场景

编辑 `src/Composition.tsx`：

- 更新 `durationInFrames`
- 更新 composition id，例如 `MLExplainerFull02`

## 6. BGM

```bash
node scripts/generate-full-bgm.mjs
```

如果新片时长不是 120 秒，需要修改脚本中的时长参数或生成器输出长度。

BGM 的原则：

- 旁白期间自动 duck
- 结尾有收束
- 段落转折处有轻微节奏变化
- 同一系列可以沿用音色和节奏型，但不要直接复用同一条完整 BGM

## 7. 质检

先抽帧，再渲染：

```bash
npx remotion still MLExplainerFull local/out/qc/frame-0300.png --frame=300 --scale=0.5 --overwrite
```

至少检查：

- 章节标题
- 最长字幕
- 数字卡片
- 深色/浅色切换
- 对比卡片
- 片尾结论卡

渲染完成后：

```bash
npm run verify:video
```

## 8. 渲染和母带

```bash
npm run render:full
npm run master:full
npm run verify:video
```

新项目如果改了输出文件名，可以直接调用通用脚本：

```bash
node scripts/master-video.mjs local/out/input.mp4 local/out/output-final.mp4 -15.5
node scripts/verify-video.mjs local/out/output-final.mp4
```

母带目标：

- 响度约 -15.5 到 -16 LUFS
- True Peak ≤ -1.0 dBTP
- 48kHz stereo

如果源文件峰值过高，不要直接加增益，使用 loudnorm 或限幅方案。

## 9. 交付

最终保留：

- `local/out/ml-explainer-full-final.mp4`
- `local/out/ml-explainer-full-cover.png`
- `src/`
- `public/audio/`
- `public/sfx/`
- `scripts/`
- 配置文件

可删除：

- `local/out/ml-explainer-full.mp4`（母带前版本）
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
→ 转场不重复
→ 音效不抢旁白
→ 抽帧无遮挡
→ verify:video 通过
```

