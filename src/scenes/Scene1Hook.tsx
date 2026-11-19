import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CatPortrait,
  EaseInText,
  MonoTag,
  SceneBackground,
  TopBar,
} from "../components/Design";
import {COLORS, FONT, MONO} from "../theme";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const cardEnter = spring({
    frame: frame - 4,
    fps,
    config: {damping: 16, stiffness: 115, mass: 0.9},
    durationInFrames: 28,
  });

  const stickerEnter = spring({
    frame: frame - 17,
    fps,
    config: {damping: 10, stiffness: 180, mass: 0.65},
    durationInFrames: 22,
  });

  const scanY = interpolate((frame + 4) % 62, [0, 62], [26, 342], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cornerStyle = {
    position: "absolute" as const,
    width: 36,
    height: 36,
    borderColor: COLORS.ink,
    borderStyle: "solid",
  };

  return (
    <SceneBackground index="01">
      <TopBar chapter="01" label="HOW MACHINES LEARN" />

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 202,
          width: 1100,
          fontFamily: FONT,
          color: COLORS.ink,
        }}
      >
        <EaseInText delay={0} distance={28}>
          <MonoTag background={COLORS.paper}>OPENING / 00—02 SEC</MonoTag>
        </EaseInText>

        <div
          style={{
            marginTop: 30,
            fontSize: 148,
            lineHeight: 0.96,
            fontWeight: 800,
            letterSpacing: -5,
          }}
        >
          <EaseInText delay={2} distance={70}>
            <span style={{color: COLORS.blue}}>AI</span>
            <span> </span>
            <span>怎么</span>
          </EaseInText>
          <EaseInText delay={7} distance={80}>
            <span>学会</span>
            <span
              style={{
                display: "inline-block",
                backgroundColor: COLORS.lime,
                border: `4px solid ${COLORS.ink}`,
                borderRadius: 18,
                padding: "0 15px 8px",
                margin: "4px 8px 0 2px",
                rotate: "-1.4deg",
                boxShadow: `8px 9px 0 ${COLORS.ink}`,
              }}
            >
              认猫
            </span>
            <span>？</span>
          </EaseInText>
        </div>

        <EaseInText delay={16} distance={34}>
          <div
            style={{
              marginTop: 44,
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 31,
              lineHeight: 1.35,
              fontWeight: 500,
              color: COLORS.muted,
            }}
          >
            <div
              style={{
                width: 82,
                height: 5,
                borderRadius: 4,
                backgroundColor: COLORS.coral,
              }}
            />
            从例子里找规律，而不是背答案。
          </div>
        </EaseInText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 925,
          top: 160,
          width: 108,
          height: 108,
          borderRadius: "50%",
          backgroundColor: COLORS.coral,
          border: `5px solid ${COLORS.ink}`,
          boxShadow: `9px 10px 0 ${COLORS.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.paper,
          fontFamily: FONT,
          fontSize: 61,
          fontWeight: 800,
          rotate: `${interpolate(stickerEnter, [0, 1], [28, 9])}deg`,
          scale: interpolate(stickerEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          opacity: interpolate(stickerEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          zIndex: 5,
        }}
      >
        ?
      </div>

      <div
        style={{
          position: "absolute",
          left: 1212,
          top: 218,
          width: 572,
          height: 626,
          fontFamily: FONT,
          rotate: `${-2.4 + interpolate(cardEnter, [0, 1], [5, 0])}deg`,
          scale: interpolate(cardEnter, [0, 1], [0.78, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          translate: `0px ${Math.sin(frame / 19) * 7}px`,
          opacity: interpolate(cardEnter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 26,
            border: `5px solid ${COLORS.ink}`,
            backgroundColor: COLORS.paper,
            boxShadow: `18px 20px 0 ${COLORS.ink}`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: 68,
              borderBottom: `4px solid ${COLORS.ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 21px",
              fontFamily: MONO,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 1.7,
            }}
          >
            <span>INPUT / IMAGE_042</span>
            <span style={{color: COLORS.blue}}>RGB 224×224</span>
          </div>

          <div
            style={{
              height: 426,
              position: "relative",
              backgroundColor: COLORS.lime,
              backgroundImage:
                "radial-gradient(rgba(21,21,21,0.2) 1.2px, transparent 1.3px)",
              backgroundSize: "22px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 355,
                height: 355,
                borderRadius: "50%",
                backgroundColor: COLORS.paper,
                border: `4px solid ${COLORS.ink}`,
              }}
            />
            <CatPortrait
              size={325}
              color={COLORS.coral}
              variant={0}
              style={{position: "relative", zIndex: 2}}
            />

            <div
              style={{
                position: "absolute",
                left: 70,
                right: 70,
                top: scanY,
                height: 5,
                backgroundColor: COLORS.blue,
                boxShadow: `0 0 18px ${COLORS.blue}`,
                opacity: 0.88,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 70,
                right: 70,
                top: scanY - 22,
                height: 22,
                background: `linear-gradient(${COLORS.blue}33, transparent)`,
                opacity: 0.8,
              }}
            />

            <div
              style={{
                ...cornerStyle,
                left: 30,
                top: 26,
                borderWidth: "5px 0 0 5px",
              }}
            />
            <div
              style={{
                ...cornerStyle,
                right: 30,
                top: 26,
                borderWidth: "5px 5px 0 0",
              }}
            />
            <div
              style={{
                ...cornerStyle,
                left: 30,
                bottom: 26,
                borderWidth: "0 0 5px 5px",
              }}
            />
            <div
              style={{
                ...cornerStyle,
                right: 30,
                bottom: 26,
                borderWidth: "0 5px 5px 0",
              }}
            />
          </div>

          <div
            style={{
              height: 126,
              backgroundColor: COLORS.ink,
              color: COLORS.white,
              padding: "18px 22px 0",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 15,
                  letterSpacing: 2.2,
                  color: COLORS.lime,
                  fontWeight: 800,
                }}
              >
                MODEL OUTPUT
              </div>
              <div
                style={{
                  marginTop: 7,
                  fontSize: 52,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: -1,
                }}
              >
                这是猫？<span style={{color: COLORS.lime}}> 98%</span>
              </div>
            </div>
            <div
              style={{
                marginTop: 8,
                width: 17,
                height: 17,
                borderRadius: 99,
                backgroundColor: COLORS.lime,
                boxShadow: `0 0 0 7px ${COLORS.lime}24`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: -44,
            top: -70,
            width: 156,
            height: 74,
            borderRadius: 13,
            border: `4px solid ${COLORS.ink}`,
            backgroundColor: COLORS.coral,
            boxShadow: `7px 8px 0 ${COLORS.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: MONO,
            fontSize: 23,
            fontWeight: 900,
            letterSpacing: 0.6,
            rotate: "7deg",
            scale: interpolate(stickerEnter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        >
          GOT IT!
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 102,
          bottom: 144,
          display: "flex",
          alignItems: "center",
          gap: 15,
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: 2.2,
          color: COLORS.ink,
          opacity: 0.58,
        }}
      >
        <span>01</span>
        <span style={{width: 70, height: 2, backgroundColor: COLORS.ink}} />
        <span>CAT OR NOT?</span>
      </div>
    </SceneBackground>
  );
};



