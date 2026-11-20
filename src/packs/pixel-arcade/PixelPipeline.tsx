import type {FC} from "react";
import {interpolate, spring, useCurrentFrame} from "remotion";
import {PixelPanel} from "./PixelChrome";
import {PIXEL_ARCADE as C, PIXEL_FONT, PIXEL_MONO} from "./tokens";

export type PixelPipelineStep = {
  label: string;
  detail: string;
  color: string;
};

const typeIn = (text: string, frame: number, start: number, speed = 1.4) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((frame - start) * speed))));

export const PixelPipelineRow: FC<{
  label: string;
  detail: string;
  color: string;
  progress: number;
  done: boolean;
}> = ({label, detail, color, progress, done}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 13,
      height: 54,
      opacity: Math.max(0.35, progress > 0 ? 1 : 0.28),
    }}
  >
    <div
      style={{
        width: 86,
        fontFamily: PIXEL_MONO,
        fontSize: 13,
        fontWeight: 900,
        color,
        letterSpacing: 1.1,
      }}
    >
      {label}
    </div>
    <div style={{flex: 1, height: 16, backgroundColor: "#FFFFFF12", position: "relative"}}>
      <div
        style={{
          width: `${Math.min(1, progress) * 100}%`,
          height: "100%",
          backgroundColor: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 22px, rgba(13,16,32,0.4) 22px 24px)",
        }}
      />
    </div>
    <div
      style={{
        width: 150,
        fontFamily: PIXEL_MONO,
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 1,
        color: done ? C.mint : C.muted,
        textAlign: "right",
      }}
    >
      {done ? "PASS ✓" : detail}
    </div>
  </div>
);

export const PixelPipelineScene: FC<{
  tag: string;
  heading: string;
  command: string;
  steps: PixelPipelineStep[];
  nextTitle?: string;
  nextDetail?: string;
}> = ({
  tag,
  heading,
  command,
  steps,
  nextTitle = "NEXT / FULL GUIDE",
  nextDetail = "README.md → npm run dev",
}) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [1, 13], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const typed = typeIn(command, frame, 8, 1.55);
  const progress = steps.map((_, index) =>
    interpolate(frame, [17 + index * 14, 43 + index * 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const allDone = progress.length > 0 && progress.every((value) => value >= 1);
  const statusIn = spring({
    frame: frame - 57,
    fps: 30,
    config: {damping: 15, stiffness: 190, mass: 0.65},
    durationInFrames: 18,
  });
  const finalIn = spring({
    frame: frame - 74,
    fps: 30,
    config: {damping: 12, stiffness: 210, mass: 0.6},
    durationInFrames: 18,
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 94,
          top: 144,
          display: "flex",
          alignItems: "center",
          gap: 17,
          opacity: headingOpacity,
          translate: `0px ${(1 - headingOpacity) * 28}px`,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: C.mint,
            color: C.ink,
            fontFamily: PIXEL_MONO,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.7,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          {tag}
        </div>
        <div style={{fontFamily: PIXEL_FONT, fontSize: 45, fontWeight: 900, color: C.cream}}>
          {heading}
        </div>
      </div>

      <PixelPanel
        accent={C.cream}
        style={{
          position: "absolute",
          left: 94,
          top: 238,
          width: 1260,
          height: 470,
          boxShadow: `11px 11px 0 ${C.ink}`,
        }}
      >
        <div
          style={{
            height: 48,
            padding: "0 17px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: C.panel2,
            borderBottom: `2px solid ${C.cream}30`,
            fontFamily: PIXEL_MONO,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: C.muted,
          }}
        >
          <span>TERMINAL / code-driven-video-system</span>
          <span style={{color: C.mint}}>● READY</span>
        </div>

        <div style={{padding: "23px 26px", fontFamily: PIXEL_MONO}}>
          <div style={{fontSize: 21, fontWeight: 900, color: C.cream}}>
            <span style={{color: C.mint}}>$ </span>
            {typed}
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 20,
                marginLeft: 3,
                backgroundColor: C.yellow,
                verticalAlign: -3,
                opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0,
              }}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: `2px dashed ${C.cream}24`,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {steps.map((step, index) => (
              <PixelPipelineRow
                key={step.label}
                label={step.label}
                detail={step.detail}
                color={step.color}
                progress={progress[index] ?? 0}
                done={(progress[index] ?? 0) >= 1}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 19,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: PIXEL_MONO,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.2,
                color: allDone ? C.mint : C.muted,
              }}
            >
              {allDone ? "> ALL CHECKS PASSED / EXPORT READY" : "> PROCESSING FRAMES..."}
            </div>
            <div
              style={{
                padding: "7px 10px",
                border: `2px solid ${allDone ? C.mint : C.cream + "24"}`,
                backgroundColor: allDone ? C.mint : "transparent",
                color: allDone ? C.ink : C.muted,
                fontFamily: PIXEL_MONO,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.2,
                opacity: allDone ? 1 : 0.5,
              }}
            >
              {progress.filter((value) => value >= 1).length} / {steps.length} COMPLETE
            </div>
          </div>
        </div>
      </PixelPanel>

      <div
        style={{
          position: "absolute",
          right: 90,
          top: 270,
          width: 346,
          height: 296,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: `4px solid ${allDone ? C.mint : C.cream + "25"}`,
          backgroundColor: allDone ? C.mint : C.panel,
          color: allDone ? C.ink : C.muted,
          boxShadow: allDone ? `10px 10px 0 ${C.ink}` : `7px 7px 0 ${C.ink}`,
          opacity: statusIn,
          scale: interpolate(statusIn, [0, 1], [0.86, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          translate: `0px ${(1 - statusIn) * 16}px`,
        }}
      >
        <div style={{fontFamily: PIXEL_MONO, fontSize: 12, fontWeight: 900, letterSpacing: 1.7}}>
          PIPELINE STATUS
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: PIXEL_MONO,
            fontSize: allDone ? 74 : 54,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          {allDone ? "PASS" : "AUTO"}
        </div>
        <div
          style={{
            marginTop: 14,
            width: 58,
            height: 4,
            backgroundColor: allDone ? C.ink : C.cream + "24",
          }}
        />
        <div style={{marginTop: 18, fontFamily: PIXEL_FONT, fontSize: 20, fontWeight: 900}}>
          {allDone ? "一条命令，全部交付" : "自动跑完三步"}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 90,
          top: 610,
          width: 346,
          padding: "14px 17px",
          border: `2px solid ${C.cream}30`,
          backgroundColor: C.ink,
          fontFamily: PIXEL_MONO,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.1,
          lineHeight: 1.7,
          color: C.muted,
          opacity: Math.max(0, finalIn),
          translate: `0px ${(1 - finalIn) * 12}px`,
        }}
      >
        <div style={{color: C.yellow}}>{nextTitle}</div>
        <div style={{color: C.cream, marginTop: 4}}>{nextDetail}</div>
      </div>
    </>
  );
};
