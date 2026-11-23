import {Composition} from "remotion";
import {SceneBackground} from "./components/Design";
import {StyleLab} from "./library/StyleLab";
import {PackagingShowcase} from "./packaging/PackagingShowcase";
import {PixelArcadeShowcase} from "./packs/pixel-arcade";
import {BrightDraftingShowcase} from "./packs/bright-drafting";

export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="PackagingSystem"
        component={PackagingShowcase}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StyleLab"
        component={StyleLab}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BackgroundTest"
        component={() => <SceneBackground index="01" />}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PixelArcadeShowcase"
        component={PixelArcadeShowcase}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BrightDraftingShowcase"
        component={BrightDraftingShowcase}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
