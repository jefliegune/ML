# 公共样张项目清单

这里存放可以直接运行的公共样张描述，私有视频的 `video.project.json` 仍应留在 `local/projects/<name>/`。

新项目应在清单中配置 `cover`，并把固定 `1440×1080` 的封面 `Still` 注册到项目 Root。完整流水线会在视频质检后自动渲染封面。

| 项目 | Composition | 用途 |
|---|---|---|
| `packaging-system` | `PackagingSystem` | 通用包装系统 10 秒样张 |
| `stylelab` | `StyleLab` | 素材库与风格语法 10 秒样张 |
| `pixel-arcade` | `PixelArcadeShowcase` | 像素街机风格包 10 秒样张 |

```bash
npm run pipeline -- --project packaging-system
npm run pipeline -- --project stylelab --dry-run
npm run pipeline:pixel-arcade
```

字段和路径规则见 `docs/PROJECT_MANIFEST.md`。
