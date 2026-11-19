# 素材库清单

素材库只收录会重复使用的视觉、动效和声音资产。一次性画出来的场景元素留在具体 Scene 中，不升级为公共资产。

> 下表中的 `NetworkGraph`、`CatPortrait`、`DogPortrait` 等组件来自内置示例片，只作为“如何封装领域图形”的案例，不代表项目领域。

风格、色板和动画语法的索引在 [参考库与设计资产](REFERENCE_LIBRARY.md)；本文件只记录已经封装成组件的资产。

## 背景

| 资产 | 代码 | 用途 | 约束 |
|---|---|---|---|
| 纸张底 | `PackagingBackground tone="paper"` | 解释、对比、数据段 | 默认底色，适合大量文字 |
| 墨黑底 | `PackagingBackground tone="ink"` | 深色论证、流程、结论段 | 需要提高亮色面积 |
| 信号蓝底 | `PackagingBackground tone="signal"` | 强转折、章节封面 | 一集最多 1–2 次 |
| 点阵纹理 | 内置于背景 | 纸感与科技感 | 不额外叠加相同点阵 |
| 斜线纹理 | 内置于背景 | 编辑设计感 | 只做低对比背景 |
| 半调圆点 | `backgroundImage` 组合 | 强调色块、资产卡 | 不覆盖正文 |
| 超大章节数字 | 内置于背景 | 系列识别 | 不参与信息表达 |
| 四角标记 | `CornerMarks` | 统一画面边界 | 颜色跟随前景色 |

## 形状与装饰

| 资产 | 代码 | 用途 |
|---|---|---|
| 贴纸 | `Sticker` | 重点结论、关键词、状态 |
| 胶带 | `TapeStrip` | 拼贴细节、卡片固定 |
| 星爆 | `Burst` | 结果、冲击、庆祝 |
| 编辑分隔线 | `EditorialRule` | 章节底栏、信息分组 |
| 进度轨道 | 现有场景内自绘 | 流程、进度、层级 |
| 印章 | `ImpactStamp` | 错误、命中、结论 |

## 内容组件

| 资产 | 代码 | 用途 |
|---|---|---|
| 标题 | `Headline` | display / h1 / h2 / h3 |
| 标签 | `Kicker` | 栏目、章节、资产分类 |
| 纸卡 | `PaperCard` | 信息卡、对比卡、数据卡 |
| 字幕条 | `FullCaptionBar` | 逐句旁白、关键词高亮 |
| 网络图 | `NetworkGraph` | 示例片的节点、传播和连接关系 |
| 角色 | `CatPortrait` / `DogPortrait` | 示例片的系列角色与例子 |
| 章节开场 | `ChapterOpener` | 新章节第一屏 |
| 结尾卡 | `EndSlate` | 结论、系列标识、下期预告 |

## 动效

| 资产 | 代码 | 使用场景 |
|---|---|---|
| 标准入场 | `RiseIn` | 标题、卡片、正文 |
| 弹出 | `PopIn` | 贴纸、数字、印章 |
| 线条生长 | `DrawRule` | 分隔线、流程线 |
| 色块擦除 | `SectionWipe` | 章节边界 |
| 冲击印章 | `ImpactStamp` | 错误、正确答案、结论 |
| 亮闪 | `CutFlash` | 强节奏切换 |
| 运镜 | `CameraRig` | 推、拉、左右平移、急推 |
| 词级字效 | `KineticType` | 标题、关键词、结论句 |
| 风格纹理 | `StyleTexture` | 纸纹、颗粒、半调、扫描线、孔版、暗角 |

## 声音

| 资产 | 文件 | 默认用途 |
|---|---|---|
| `whoosh` | `public/sfx/whoosh.wav` | 章节转场 |
| `pop` | `public/sfx/pop.wav` | 卡片/数字出现 |
| `click` | `public/sfx/click.wav` | 微交互、进度计数 |
| `ding` | `public/sfx/ding.wav` | 成功、命中、确认 |
| `impact` | `public/sfx/impact.wav` | 错误、盖章、结论 |
| `riser` | `public/sfx/riser.wav` | 揭示、结论出现前的蓄力 |

## 使用顺序

1. 先选背景和章节模板。
2. 再选一个内容组件承载信息。
3. 只增加一个强调资产：贴纸、印章或星爆。
4. 最后挂动效和声音。
5. 如果同屏需要两个以上强调资产，先拆镜头。
