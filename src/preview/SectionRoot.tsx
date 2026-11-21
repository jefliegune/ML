import type {FC, PropsWithChildren} from "react";
import {Sequence} from "remotion";

type SectionRootProps = PropsWithChildren<{
  startFrame: number;
  endFrame: number;
}>;

/**
 * Replays a section of the full film inside its own composition.
 *
 * The negative `from` shifts the child timeline forward so that local frame 0
 * maps to the section's global start frame. `durationInFrames` must cover the
 * whole local range, which is why it uses the global `endFrame`.
 */
export const SectionRoot: FC<SectionRootProps> = ({
  startFrame,
  endFrame,
  children,
}) => (
  <Sequence
    from={-startFrame}
    durationInFrames={endFrame}
    layout="none"
  >
    {children}
  </Sequence>
);
