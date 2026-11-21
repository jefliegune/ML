# 参考库与设计资产

项目的参考库现在只保留 **Huashu Art Motion**。它负责提供风格卡、动画语法、颜色、方法和字体；具体视频仍然由本项目的 Remotion 组件和场景代码实现。

## 上游

| 项目 | 作者 | 取用的内容 | 没有取用的内容 |
|---|---|---|---|
| [Huashu Art Motion](https://github.com/alchaincyf/huashu-art-motion) | alchaincyf（花叔） | 36 张实做风格卡、9 张语法卡、8 套色板、方法文档、OFL 字体 | 角色图、总览图、示范视频、Canvas 引擎、研究配方 |

代码和文档是 MIT；字体是 SIL OFL 1.1，单独保留许可。完整声明见 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。

## 已入库数量

| 类别 | 数量 | 位置 |
|---|---:|---|
| 完整风格卡 | 36 | `docs/reference/huashu/风格配方/` |
| 完整语法卡 | 9 | `docs/reference/huashu/动画语法/` |
| 核心方法文档 | 19 | `docs/reference/huashu/` |
| 可选能力文档 | 4 | `docs/reference/huashu/optional/` |
| 色板说明 | 8 | `docs/reference/huashu/色板.md` |
| OFL 字体 | 45 | `public/fonts/huashu/` |
| 原创风格包 | 1 | `src/packs/pixel-arcade/` |

机器可读清单：

- `src/library/catalog.json`：可检索的色板、风格摘要、语法摘要和完整卡路径。
- `src/library/huashu.json`：完整素材的来源提交、路径、字体 URL、许可证和排除项。
- `src/library/original-packs.json`：本仓库自己沉淀的原创风格包。

## 导入流程

源仓库放在本地，不进入 Git：

```text
local/reference/huashu-art-motion/
├─ references/色板.md
├─ references/风格配方/
├─ references/动画语法/
├─ references/*.md
└─ scripts/engine/lib/fonts/
```

生成索引：

```bash
npm run library:import
```

导入完整素材：

```bash
npm run library:huashu
npm run library:check
```

`library:import` 生成 `catalog.json`；`library:huashu` 复制完整卡、方法文档和字体，并生成 `huashu.json`。`library:check` 校验文件、数量、许可和排除项。

## 数据结构

`src/library/index.ts` 把 JSON 转成有类型的只读数据：

```ts
import {
  PALETTES,
  STYLES,
  GRAMMARS,
  HUASHU_LIBRARY,
  getPalette,
  getStyle,
  getHuashuStyleCard,
  getHuashuGrammarCard,
} from "./library";

const style = getStyle("hs-09-postimp");
const palette = getPalette("paper");
const styleCard = getHuashuStyleCard("hs-09-postimp");
const grammarCard = getHuashuGrammarCard("t1-3b1b");
```

主要字段：

| 字段 | 用途 |
|---|---|
| `palettes[].colors` | `bg / surface / ink / sub / accent / accent2` 六个角色色 |
| `palettes[].docPath` | 色板完整说明路径 |
| `styles[].family` | `huashu` 或 `original` |
| `styles[].quality` | 参考库星级，只用于排序 |
| `styles[].technique` | 核心画法或渲染器 |
| `styles[].motion / transition` | 母题动作和签名转场 |
| `styles[].weakness` | 当前实现的短板 |
| `styles[].cardPath` | 完整风格卡路径 |
| `grammars[].oneLiner` | 一句话语法 |
| `grammars[].cardPath` | 完整语法卡路径 |
| `HUASHU_LIBRARY.fonts` | 字体文件、family、字重和 `staticFile` URL |

## 在 Remotion 里使用

先选语法，再选风格，再从 8 套色板里选一套。选中的卡需要被翻译成 Remotion 组件、参数和场景代码，不能直接当成现成模板。

```tsx
import {AbsoluteFill} from "remotion";
import {CameraRig, KineticType, StyleTexture} from "./packaging";
import {HuashuFonts, getPalette, getStyle} from "./library";

const style = getStyle("hs-09-postimp");
const palette = getPalette("paper");

export const Scene = () => (
  <>
    <HuashuFonts />
    <AbsoluteFill style={{background: palette.colors.bg}}>
      <CameraRig move="push" amount={1.06} durationInFrames={90}>
        <KineticType
          tokens={["一个颜色", "一个概念"]}
          accent={[1]}
          color={palette.colors.ink}
        />
        <StyleTexture variant="paper" opacity={0.18} />
      </CameraRig>
    </AbsoluteFill>
  </>
);
```

`HuashuFonts` 会注册 `public/fonts/huashu/` 里的全部字体。字体 family 可以通过 `getHuashuFont()` 查询。

## 选型顺序

1. **定语法。** 从 9 张语法卡里选一种叙事方式。
2. **定画法。** 从 36 张风格卡里选一张，读它的渲染器、母题动作、转场和短板。
3. **定色板。** 从 8 套色板里选一套，保证正文、背景和强调色对比足够。
4. **写镜头表。** 每镜写清画面里的物、动作、镜头、屏上字和实现方式。
5. **写代码。** 用现有包装组件和具体场景实现，不照搬上游示范构图。
6. **验收。** 跑渲染、母带、QC，并抽帧检查画面和字体。

## 边界

- 仓库只分发 MIT 方法文档、风格卡、语法卡、派生元数据和本项目原创代码。
- OFL 字体单独放在 `public/fonts/huashu/`，保留原许可，不并入 MIT。
- 不包含上游 MP4、GIF、总览图、角色图、角色音频或 Canvas 引擎。
- 38–55 研究配方没有进入实做库；原因见 `docs/reference/huashu/NOT_IMPORTED.md`。
- 如果以后要加入新素材库，按同样的清单、许可和排除项流程单独导入。

## StyleLab

`StyleLab` 展示 3 张 Huashu 特色风格卡、36 个 Huashu 风格 chip 和 9 张 Huashu 语法卡：

```bash
npm run render:stylelab
npm run master:stylelab
```
