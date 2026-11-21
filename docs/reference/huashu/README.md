# Huashu 通用素材库

这是从 [Huashu Art Motion](https://github.com/alchaincyf/huashu-art-motion) 导入的完整参考素材，而不是 `catalog.json` 里的一行摘要。

- 来源提交：`a97c45018d46e950d56d61981138e08f4e092909`（2026-11-17T20:14:06-10:00）
- 代码与文档许可：MIT，见 `LICENSE-MIT.txt`
- 字体许可：SIL OFL 1.1，见 `../../../public/fonts/huashu/LICENSES.md`

## 包含

- `风格配方/`：36 张完整风格卡和索引
- `动画语法/`：9 张完整语法卡和索引
- `色板.md`：8 套色板的完整说明
- `METHODS.md`：19 份核心方法与 4 份可选能力文档
- `字体.md`：45 个 OFL 字体文件清单

## 使用顺序

1. 先读 `动画语法/INDEX.md`，按题材选一种叙事语法。
2. 再读 `风格配方/INDEX.md`，按画法和质量选一张完整卡。
3. 从 `色板.md` 选一套色板，保持全片一致。
4. 只把选中的卡提炼成 Remotion 组件和参数，不照搬示范构图。
5. 字体通过 `staticFile("fonts/huashu/<file>")` 使用，并保留 OFL 许可。

## 未导入

角色图、总览图、示范 GIF/视频、上游 Canvas 引擎和研究配方没有导入。原因见 `NOT_IMPORTED.md`。
