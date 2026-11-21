import type {FC} from "react";
import {staticFile} from "remotion";
import huashuJson from "./huashu.json";

const fontFace = (font: (typeof huashuJson.fonts)[number]) =>
  [
    "@font-face {",
    `  font-family: "${font.family}";`,
    `  src: url("${staticFile(font.url)}") format("woff");`,
    `  font-style: ${font.style};`,
    `  font-weight: ${font.weight};`,
    "  font-display: swap;",
    "}",
  ].join("\n");

export const HUASHU_FONT_CSS = huashuJson.fonts.map(fontFace).join("\n");

export const HuashuFonts: FC = () => <style>{HUASHU_FONT_CSS}</style>;
