import type {FC} from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {BRIGHT_DRAFTING as C} from "./tokens";
import {alphaHex} from "../../color-system";

export const WORD_CAPTION_HEIGHT = 186;

export type CaptionWord = {
  text: string;
  offset: number;
  duration: number;
};

export type CaptionLine = {
  id: string;
  text: string;
  highlights?: string[];
  /** Frame where this line's audio starts. */
  startFrame: number;
  /** Optional frame where the line's audio ends. */
  endFrame?: number;
  captionStartFrame?: number;
  captionEndFrame?: number;
  /** Word boundaries relative to the line audio start, in seconds. */
  words?: CaptionWord[];
};

type Range = {
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const buildWordRanges = (
  text: string,
  line: CaptionLine,
  fps: number,
): Range[] => {
  const ranges: Range[] = [];
  let cursor = 0;
  for (const word of line.words ?? []) {
    const clean = word.text.replace(/\s+/g, "");
    if (!clean) continue;
    let index = text.indexOf(clean, cursor);
    if (index < 0 && clean.length > 1) {
      index = text.indexOf(clean.slice(0, 1), cursor);
    }
    if (index < 0) continue;
    const end = Math.min(text.length, index + clean.length);
    ranges.push({
      start: index,
      end,
      startFrame: line.startFrame + Math.round(word.offset * fps),
      endFrame: line.startFrame + Math.round((word.offset + word.duration) * fps),
    });
    cursor = end;
  }
  if (ranges.length === 0) {
    ranges.push({
      start: 0,
      end: text.length,
      startFrame: line.startFrame,
      endFrame:
        line.endFrame ??
        line.captionEndFrame ??
        line.startFrame + Math.round(2 * fps),
    });
  }
  return ranges;
};

const buildHighlightRanges = (text: string, highlights: string[] = []) => {
  const ranges: {start: number; end: number}[] = [];
  let cursor = 0;
  for (const phrase of highlights) {
    if (!phrase) continue;
    const index = text.indexOf(phrase, cursor);
    if (index < 0) continue;
    ranges.push({start: index, end: index + phrase.length});
    cursor = index + phrase.length;
  }
  return ranges;
};

export const WordCaptionBar: FC<{
  lines: CaptionLine[];
  accent?: string;
  height?: number;
  showProgress?: boolean;
}> = ({lines, accent = C.red, height = WORD_CAPTION_HEIGHT, showProgress = true}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const windowOf = (line: CaptionLine) => ({
    start: line.captionStartFrame ?? line.startFrame - 2,
    end:
      line.captionEndFrame ??
      line.endFrame ??
      line.captionStartFrame ??
      line.startFrame + Math.round(2 * fps),
  });

  const active =
    lines.find((line) => {
      const window = windowOf(line);
      return frame >= window.start && frame < window.end;
    }) ??
    [...lines]
      .reverse()
      .find((line) => frame >= windowOf(line).end);

  if (!active) {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height,
          pointerEvents: "none",
        }}
      />
    );
  }

  const window = windowOf(active);
  const enter = clamp01((frame - window.start) / 6);
  const text = active.text;
  const chars = Array.from(text);
  const words = buildWordRanges(text, active, fps);
  const highlights = buildHighlightRanges(text, active.highlights);
  const progress = clamp01(frame / Math.max(1, durationInFrames - 1));

  const charWord = chars.map((_, index) => {
    let found = -1;
    for (let rangeIndex = 0; rangeIndex < words.length; rangeIndex++) {
      const range = words[rangeIndex];
      const next = words[rangeIndex + 1];
      if (
        index >= range.start &&
        (index < range.end || (next && index < next.start))
      ) {
        found = rangeIndex;
        break;
      }
    }
    if (found < 0 && words.length > 0) {
      found = index < words[0].start ? 0 : words.length - 1;
    }
    return found;
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height,
        zIndex: 40,
        pointerEvents: "none",
        background:
          `linear-gradient(to top, ${alphaHex(C.bg, 0.985)} 0%, ${alphaHex(C.bg, 0.94)} 52%, ${alphaHex(C.bg, 0.55)} 82%, ${alphaHex(C.bg, 0)} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          bottom: 44,
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          opacity: Math.max(0.85, enter),
          transform: `translateY(${(1 - enter) * 12}px)`,
        }}
      >
        <div
          style={{
            width: 10,
            height: 56,
            background: accent,
            marginTop: 8,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontSize: 50,
            lineHeight: 1.34,
            fontWeight: 500,
            letterSpacing: 1,
            color: C.ink,
            textShadow: `0 1px 0 ${alphaHex(C.surface, 0.9)}`,
          }}
        >
          {chars.map((char, index) => {
            const word = words[charWord[index]];
            const isCurrent =
              word && frame >= word.startFrame && frame < word.endFrame;
            const isPast = word && frame >= word.endFrame;
            const inHighlight = highlights.some(
              (range) => index >= range.start && index < range.end,
            );
            return (
              <span
                key={index}
                style={{
                  color: inHighlight ? accent : C.ink,
                  fontWeight: inHighlight ? 800 : 500,
                  opacity: isCurrent
                    ? 1
                    : isPast
                      ? inHighlight
                        ? 0.75
                        : 0.62
                      : inHighlight
                        ? 0.88
                        : 0.8,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>
      {showProgress ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            background: alphaHex(C.ink, 0.07),
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: accent,
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
