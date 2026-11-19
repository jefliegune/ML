# 视觉包装系统 V1

这套系统的目标不是“给视频加装饰”，而是把颜色、字体、图形、动效、声音和质检变成可复用的生产工具。新视频应该从组件库开始组合，而不是每个镜头重新设计。

## 1. 分层结构

### L0 工程层

- Remotion 4.0.545 / React 19 / TypeScript
- 1920×1080 / 30fps / H.264 + AAC
- `npm run lint` 保证类型与代码质量
- `scripts/verify-video.mjs` 检查成片参数

### L1 识别层

文件：`src/packaging/tokens.ts`

- 颜色：奶油纸、墨黑、荧光绿、钴蓝、珊瑚红、青色、淡紫
- 字体：中文粗体标题 + Arial Narrow 风格英文标签
- 字号：136 / 88 / 64 / 42 / 24 / 18 / 13 / 10
- 间距：4 的倍数
- 圆角：8 / 14 / 20 / 28 / pill
- 描边：1 / 2 / 4 / 6
- 阴影：micro / card / hero / float
- 安全区：左右 86px，底部字幕 34px

### L2 素材层

文件：`src/packaging/primitives.tsx`

- `PackagingBackground`：纸张、墨黑、信号蓝三种底
- `Kicker`：栏目标签、章节标签
- `Headline`：显示级/一级/二级/三级标题
- `PaperCard`：信息卡片、对比卡片、数据卡
- `Sticker`：重点贴纸、结论贴纸
- `TapeStrip`：胶带、拼贴细节
- `EditorialRule`：编辑设计分隔线
- `CornerMarks`：四角定位标记

### L3 动效层

文件：`src/packaging/motion.ts`、`motionPrimitives.tsx`

- `useReveal`：标准的淡入 + 上移 + 轻微缩放
- `usePop`：贴纸/数字的弹出
- `useFloat`：背景元素的低速漂浮
- `RiseIn`：内容入场
- `PopIn`：重点元素入场
- `DrawRule`：线条生长

动效原则：

1. 每个元素只承担一个动作：进入、强调或退出。
2. 同一屏最多两个焦点，不让所有元素同时运动。
3. 不使用 CSS transition；所有动画由 `frame`、`spring`、`interpolate` 驱动。
4. 章节边界用一次强转场，镜头内部用轻动作。

### L4 模板层

文件：`src/packaging/templates.tsx`

- `ChapterOpener`：章节开场
- `EndSlate`：结尾结论卡

模板只负责结构和节奏，不负责具体文案。新视频优先复用模板，再替换内容。

### L5 转场层

文件：`src/packaging/transitions.tsx`

- `SectionWipe`：斜切色块擦除
- `ImpactStamp`：结论/错误/印章冲击
- `CutFlash`：短促亮闪

转场使用频率：

- 章节边界：一次完整 wipe
- 重要转折：impact stamp
- 普通镜头切换：硬切或轻推，不连续使用 wipe

### L6 声音层

文件：`src/packaging/sound.ts`

- `whoosh`：转场
- `pop`：元素出现
- `click`：微交互
- `ding`：确认/成功
- `impact`：错误/盖章/结论
- `riser`：训练/揭示前的蓄力

声音层级：

1. 旁白始终最高优先级。
2. BGM 在旁白期间自动 duck。
3. 转场音效低于旁白，不抢字。
4. 同屏最多一个主要音效，避免堆叠。

### L7 质检层

- `npm run lint`
- `npm run verify:video`
- 关键帧抽检
- 字幕长度与遮挡检查
- 响度/峰值检查

## 2. 视觉规则

- 一个镜头只讲一个视觉命题。
- 主色不超过三种；同时只让一个强调色占主导。
- 背景、内容、界面层分开：背景负责氛围，内容负责信息，角标负责系列识别。
- 标题、数字、标签使用不同字体角色，不靠字号硬撑层级。
- 卡片必须有明确边框或硬阴影；同一画面不混用多种阴影语言。
- 贴纸和印章只用于结论、错误、重点，不用于普通说明。
- 图案是资产，不是随机装饰：点阵、斜线、半调点、胶带、角标都要有固定用法。
- 所有内容避开左右 86px、底部 34px 字幕安全区。
- 移动端优先检查：缩小到手机尺寸后，主标题仍要在 2 秒内读懂。

## 3. 如何新增一个可复用资产

1. 先判断它是否会在至少 2 条视频里出现。只出现一次的元素不要进素材库。
2. 在 `tokens.ts` 中补充必要的颜色、字号、间距或阴影。
3. 在 `primitives.tsx` 或新文件中实现组件，props 负责内容与少量变化。
4. 在 `MLPackagingSystem` 组合里加入一个样张。
5. 在 `docs/ASSET_LIBRARY.md` 登记用途、尺寸、层级和使用场景。
6. 跑 `npm run lint`，并抽帧检查。

## 4. 命名规范

- 组件：PascalCase，例如 `PaperCard`、`SectionWipe`
- 颜色：语义名，例如 `signal`、`accent`、`ink`，避免 `red2`
- 动效：动作 + 对象，例如 `RiseIn`、`DrawRule`
- 声音：事件名，例如 `cut`、`reveal`、`confirm`
- 场景：`SceneTopic.tsx`，例如 `SceneTraining.tsx`

## 5. 新视频的默认路径

```text
脚本
→ 时间轴
→ 章节模板
→ 素材组合
→ 场景专属图形
→ 字幕高亮
→ 声音落点
→ 抽帧质检
→ 渲染母带
→ verify-video
```

如果新视频和当前系列一致，优先复用 `src/packaging`，只重做内容层。若新视频要换风格，先改 tokens，再改 primitives，最后才改具体场景，避免在场景里堆一次性样式。
