# 视频项目清单与统一流水线

每条视频用一个 `video.project.json` 描述入口、Composition、输出路径、4:3 封面和质检规格。渲染、母带、质检、封面与时间轴检查都读取同一份清单，避免在多个命令里重复手写参数。

## 清单位置

支持三种查找方式：

```bash
npm run pipeline -- --project local/projects/my-video
npm run pipeline -- --project local/projects/my-video/video.project.json
npm run pipeline -- --project my-video
```

最后一种会依次查找：

```text
projects/my-video.json
projects/my-video/video.project.json
local/projects/my-video/video.project.json
```

公共样张的清单放在 `projects/`；私有项目建议放在自己的项目目录内。

`npm run pipeline:packaging`、`npm run pipeline:stylelab` 和 `npm run pipeline:pixel-arcade` 是公共样张的快捷别名，实际仍调用同一套 `scripts/pipeline.mjs`。

## 私有项目示例

```json
{
  "id": "my-video",
  "root": "local/projects/my-video",
  "entry": "Root.tsx",
  "composition": "MyVideo",
  "timeline": "timeline.generated.json",
  "timelineTypes": "timeline.generated.ts",
  "output": "local/out/my-video.mp4",
  "master": "local/out/my-video-final.mp4",
  "cover": {
    "composition": "MyVideoCover",
    "output": "local/out/my-video-cover-4x3.png",
    "frame": 0
  },
  "video": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationInFrames": 7200
  },
  "audio": {
    "targetLufs": -16
  },
  "render": {
    "crf": 18,
    "concurrency": 8
  }
}
```

路径规则：

- `root` 相对仓库根目录。
- `entry`、`timeline`、`timelineTypes` 相对 `root`。
- `output`、`master` 相对仓库根目录，并限制在 `local/out/` 或 `out/` 下。
- `cover.output` 相对仓库根目录，并限制在 `local/out/` 或 `out/` 下；省略时默认输出 `<output>-cover-4x3.png`。
- `entry` 必须是调用 `registerRoot()` 的文件。

完整字段定义见 `schemas/video.project.schema.json`。

## 4:3 封面

完整流水线在母带和成片质检之后自动渲染封面。封面必须注册为独立的 Remotion `Still` Composition，并固定为：

```text
1440 × 1080（4:3）
```

项目清单通过 `cover.composition` 指向该 Composition。`render-cover.mjs` 会检查实际 Composition 尺寸，尺寸不是 `1440×1080` 时直接失败。

也可以单独重渲封面：

```bash
npm run cover -- --project my-video
```

如果当前流程只渲染局部片段，或暂时不需要封面：

```bash
npm run pipeline -- --project my-video --skip-cover
```

## 常用命令

```bash
# 只检查公共目录边界
npm run check:boundaries

# 检查时间轴连续性、音频文件、字幕窗口和项目规格
npm run check:timeline -- --project my-video

# 查看将执行的完整命令，不真正渲染
npm run pipeline -- --project my-video --dry-run

# 检查 → 渲染 → 母带 → 质检 → 4:3 封面
npm run pipeline -- --project my-video
```

调试时可以只跑其中几步：

```bash
npm run pipeline -- --project my-video --skip-render
npm run pipeline -- --project my-video --skip-master --skip-verify
npm run pipeline -- --project my-video --skip-cover
```

预览局部分段：

```bash
npm run pipeline -- --project my-video --frames=0-120 --skip-master --skip-verify
```

## 时间轴检查

`check:timeline` 会验证：

- section 从 0 开始、首尾连续，并填满 `durationInFrames`。
- 每个 section 的音频不重叠。
- 每句字幕窗口位于 section 内，且前后字幕不重叠。
- 每个旁白文件位于 `public/` 内并真实存在。
- 时间轴 fps、总帧数与项目清单一致。

时间轴生成器也会直接拒绝字幕窗口不足的配置。出现错误时优先调整 `gapFrames` 或 `targetFrames`，不要手改生成文件。

## 公共目录边界

`check:boundaries` 扫描 `src/`，禁止公共代码引用：

- `local/`
- `public/projects/`
- `staticFile("projects/...")`
- `timeline.generated`

私有项目可以引用公共组件；公共组件不能反向依赖私有项目。
