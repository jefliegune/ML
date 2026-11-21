# 旁白与语音指南

## 默认音色

| 项目 | 值 |
|---|---|
| 引擎 | Edge TTS |
| 音色 | `zh-CN-XiaoxiaoNeural` |
| 语速 | `+15%` |
| 示例音频 | `public/audio/voice-sample.mp3` |
| 配置文件 | `src/audio/voiceProfiles.json` |

示例音频是一句中性文本，只用于试听音色和检查语速，不包含任何具体视频的文案。它由 Edge TTS 在本地生成；公开或商用前请确认 Microsoft 的服务条款。

之前机器学习示例片的 28 段旁白仍然只保存在历史示例目录 `local/examples/ml-explainer/`，不会进入仓库。保留的是**音色和生成能力**，不是那些具体文案。

## 准备环境

需要：

- Python
- `edge-tts`
- `ffprobe`

脚本会优先使用：

1. `EDGE_TTS_PYTHONPATH` 环境变量
2. 仓库同级目录下的 `.tools`

例如本机当前使用的是：

```text
C:\Users\13645\Documents\ChatGPT\remotion\.tools
```

## 文案清单

在 `local/projects/<name>/lines.json` 建立清单：

```json
{
  "project": "my-video",
  "fps": 30,
  "sections": [
    {
      "id": "hook",
      "leadFrames": 0,
      "gapFrames": 8,
      "tailFrames": 14,
      "lines": [
        {
          "id": "l01",
          "text": "这是一句旁白。",
          "highlights": ["旁白"]
        }
      ]
    }
  ]
}
```

可选字段：

- `targetFrames`：固定这一段的帧数，音频放不下时会直接报错
- `startFrame`：为某一句指定绝对起始帧
- `file`：自定义音频输出路径，默认是 `projects/<project>/audio/<id>.mp3`

## 生成

```bash
npm run voice -- --manifest local/projects/my-video/lines.json
```

强制重新生成：

```powershell
$env:FORCE_TTS="1"; npm run voice -- --manifest local/projects/my-video/lines.json
```

输出：

```text
public/projects/my-video/audio/*.mp3          # 旁白音频，已忽略
local/projects/my-video/timeline.generated.json
local/projects/my-video/timeline.generated.ts
```

时间轴包含：

- 每句的 `startFrame` / `endFrame`
- 字幕的 `captionStartFrame` / `captionEndFrame`
- 每个 section 的起止帧
- 总时长 `durationInFrames`

## 在场景里使用

```tsx
import {VOICE_LINES, VOICE_SECTIONS} from "../../../local/projects/my-video/timeline.generated";
```

场景、字幕、BGM ducking 和音效都应读取同一份时间轴，不要各自计算节奏。

## 隐私边界

- `public/projects/` 已加入 `.gitignore`
- 具体项目的文案、配音和时间轴留在 `local/`
- 公开仓库只保留默认音色配置和中性示例音频
