# 视频清晰度与成片质检

“看起来不清楚”通常不是单一码率问题。先分清源帧、编码和设计三层，再决定改哪里。

## 成片与预览分流

| 场景 | CRF | scale | 中间帧 | 音频 | 用途 |
|---|---:|---:|---|---|---|
| 关键帧 / 段落预览 | 20–23 | 0.5 可用 | JPEG 85 | 192k | 调节奏、对字幕 |
| 成片 | 14–16 | 必须为 1 | JPEG 95 或 PNG | 320k | 发布、上传 |
| 母带交换（可选） | 更低或 ProRes | 1 | PNG | 320k | 再压分发版前的母带 |

默认值写在 `video.project.json` 的 `render` 中；草稿参数写在 `preview` 中。两套参数不会互相覆盖。

```json
{
  "render": {
    "codec": "h264",
    "crf": 14,
    "pixelFormat": "yuv420p",
    "audioCodec": "aac",
    "audioBitrate": "320k",
    "concurrency": 4,
    "imageFormat": "jpeg",
    "jpegQuality": 95,
    "x264Preset": "medium",
    "colorSpace": "bt709"
  },
  "preview": {
    "crf": 20,
    "scale": 0.5,
    "audioBitrate": "192k",
    "imageFormat": "jpeg",
    "jpegQuality": 85
  }
}
```

线条、小字和网格特别密的项目，可以只把该项目切成 PNG 中间帧：

```json
"render": {
  "crf": 14,
  "audioBitrate": "320k",
  "imageFormat": "png"
}
```

PNG 会明显增加磁盘占用和渲染时间。不要为了预览打开它。

成片默认写入 BT.709 有限范围，避免 JPEG 中间帧把编码流标成 `yuvj420p`。这样即使使用 JPEG 95，最终视频也应通过 `yuv420p` 质检。

## 命令

```bash
# 草稿：允许低分辨率、低码率
npm run preview:section -- --project <id|path> --section <section-id> --draft

# 成片：默认满分辨率，scale<1 会被拒绝
npm run pipeline -- --project <id|path>

# 只渲染，不母带、不质检
node scripts/render-project.mjs --project <id|path>

# 临时 QC 小样：必须显式承认这是草稿分辨率
node scripts/render-project.mjs --project <id|path> --scale 0.5 --allow-draft-scale
```

`pipeline.mjs` 在 `--scale < 1` 时默认失败。确实需要跑临时小样时，同时使用：

```bash
npm run pipeline -- --project <id|path> --scale 0.5 --allow-draft-scale --skip-master --skip-verify --skip-cover
```

## 质检

先看 still，再看运动：

1. 用 `preview:shots` 或 `remotion still` 导出关键帧。
2. 在 100% 像素下检查正文、2px 以上结构线、字幕和网格。
3. 若 still 就发虚，先改设计或中间帧格式。
4. 若 still 锐、运动才糊，再比较 CRF、x264 preset 和平台二次压缩。

同一画面只改 CRF 做 A/B：

```bash
node scripts/render-project.mjs --project <id|path> --crf 18 --out local/out/q-crf18.mp4
node scripts/render-project.mjs --project <id|path> --crf 14 --out local/out/q-crf14.mp4
```

若两版几乎一样，问题不在码率。优先检查：

- 是否误用了半分辨率成片。
- 背景纹理是否过重。
- 主结构线是否仍为 1px。
- 正文是否用了中灰或半透明颜色。
- 是否存在整屏缓慢漂移。

最终母带验收：

```bash
node scripts/verify-video.mjs local/out/<id>-final.mp4 \
  --width 1920 \
  --height 1080 \
  --fps 30 \
  --pixel-format yuv420p \
  --color-space bt709 \
  --audio-bitrate 320k
```

流水线会自动读取项目声明的宽高、帧率、帧数和像素格式。分辨率不是满分辨率时直接失败。

## 明亮制图风约束

- 结构线至少 2px，关键路径建议 4px。
- 全屏 `grain / paper / scanlines` 透明度保持在 0.12–0.18。
- 正文使用深墨色，不用中灰当主要字色。
- 字幕保持原有浅色地面渐变和逐词透明度效果，不改动既有的字幕层次。
- 镜头保持固定缩放；运动交给路由、令牌、展开和高亮。
- 小字使用实色，避免半透明描边和低对比阴影。

完整生产顺序仍然是：关键帧 → 段落草稿 → 满分辨率成片 → 母带 → 自动质检 → 人工 100% 像素复核。
