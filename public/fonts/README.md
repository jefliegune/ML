# Fonts

字体文件不随仓库分发，避免把商业字体的再分发权限带进开源仓库。

当前字体回退链：

```text
"HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif
```

- macOS / Windows：安装 HarmonyOS Sans SC 或 Noto Sans SC 后即可获得设计稿效果。
- Linux / CI：建议安装 Noto Sans SC，`fc-cache -f` 后重新渲染。
- 英文标签使用 Arial Narrow，未安装时回退到 Arial。

如果你确认字体许可允许再分发，可以把 `.woff2` 放在本目录，并在 `src/packaging/tokens.ts` 或 `src/theme.ts` 中补充 `@font-face`。