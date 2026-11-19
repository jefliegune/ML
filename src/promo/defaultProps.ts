import type {PromoProps, PromoSection} from "./types";

const section = (
  id: string,
  index: string,
  label: string,
  tone: PromoSection["tone"],
  startFrame: number,
  endFrame: number,
  title: string,
  subtitle: string,
): PromoSection => ({
  id,
  index,
  label,
  tone,
  startFrame,
  endFrame,
  title,
  subtitle,
});

export const DEFAULT_PROMO_PROPS: PromoProps = {
  title: "ML Video System",
  subtitle: "把视频制作变成一套可复用的系统",
  repo: "github.com/jefliegune/ML",
  voice: "zh-CN-XiaoxiaoNeural",
  fps: 30,
  durationInFrames: 7200,
  sections: [
    section("hook", "01", "OPEN / 01", "signal", 0, 510, "把视频制作|变成一套系统", "从脚本、配音、字幕，到包装、渲染、质检，全部由代码驱动。"),
    section("problem", "02", "PROBLEM / 02", "paper", 510, 1150, "每次，都从零开始", "不是能力问题，是系统问题。"),
    section("system", "03", "SYSTEM / 03", "ink", 1150, 2070, "三层结构|把视频变成工程", "设计语言、单一时间轴、风格资产，彼此咬合。"),
    section("sources", "04", "SOURCES / 04", "paper", 2070, 3150, "站在三个|开源项目上", "只取方法、目录与参数，不复制成片和媒体素材。"),
    section("advantages", "05", "EDGE / 05", "ink", 3150, 4294, "独到之处|不是多一个滤镜", "把审美变成参数，把流程变成可验证的系统。"),
    section("assets", "06", "ASSETS / 06", "paper", 4294, 5111, "素材，不再散落", "成片、质检帧、旁白、音效、文档素材，一个页面统一管理。"),
    section("usage", "07", "USAGE / 07", "ink", 5111, 6337, "四步，跑起来", "从安装到交付，所有命令都可复现。"),
    section("outro", "08", "END / 08", "signal", 6337, 7200, "下一条视频|不必从零开始", "风格可复用，素材可管理，质量可验证。"),
  ],
  lines: [],
};
