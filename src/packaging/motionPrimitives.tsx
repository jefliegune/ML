import type {CSSProperties, ReactNode} from "react";
import {useReveal, usePop, type SpringConfig} from "./motion";

export const RiseIn: React.FC<{
  children: ReactNode;
  delay?: number;
  distance?: number;
  fromScale?: number;
  durationInFrames?: number;
  springConfig?: SpringConfig;
  style?: CSSProperties;
}> = ({
  children,
  delay = 0,
  distance = 46,
  fromScale = 0.98,
  durationInFrames = 26,
  springConfig,
  style,
}) => {
  const motion = useReveal({
    delay,
    distance,
    fromScale,
    durationInFrames,
    springConfig,
  });

  return (
    <div
      style={{
        opacity: motion.opacity,
        translate: `0px ${motion.translateY}px`,
        scale: motion.scale,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const PopIn: React.FC<{
  children: ReactNode;
  delay?: number;
  fromScale?: number;
  durationInFrames?: number;
  style?: CSSProperties;
}> = ({children, delay = 0, fromScale = 0.2, durationInFrames = 18, style}) => {
  const motion = usePop({delay, fromScale, durationInFrames});

  return (
    <div
      style={{
        opacity: motion.opacity,
        scale: motion.scale,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const DrawRule: React.FC<{
  delay?: number;
  color?: string;
  style?: CSSProperties;
}> = ({delay = 0, color = "#151515", style}) => {
  const motion = useReveal({
    delay,
    distance: 0,
    fromScale: 1,
    durationInFrames: 28,
  });

  return (
    <div
      style={{
        height: 2,
        backgroundColor: color,
        transformOrigin: "left center",
        scale: `${motion.progress} 1`,
        opacity: 0.34,
        ...style,
      }}
    />
  );
};
