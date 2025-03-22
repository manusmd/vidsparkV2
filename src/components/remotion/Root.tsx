// RemotionRoot.tsx
import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "@/components/remotion/VideoComposition.component";
import type { Scene } from "@/app/types";
import { CompositionProps } from "@/components/remotion/types/constants";
import { getAudioDurationInSeconds } from "@remotion/media-utils";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoComposition"
      schema={CompositionProps}
      component={VideoComposition}
      fps={30}
      width={608}
      height={1080}
      defaultProps={{
        scenes: {} as { [sceneIndex: number]: Scene },
        styling: {
          font: undefined,
          variant: undefined,
        },
      }}
      calculateMetadata={async ({ props }) => {
        const scenes = props.scenes;
        let totalDurationInSeconds = 0;

        if (scenes) {
          const durations = await Promise.all(
            Object.values(scenes).map(async (scene: Scene) => {
              if (scene.voiceUrl) {
                try {
                  const durationInSeconds = await getAudioDurationInSeconds(
                    scene.voiceUrl,
                  );
                  return durationInSeconds || 0;
                } catch (err) {
                  console.error("Error parsing audio:", err);
                  return 0;
                }
              }
              return 0;
            }),
          );
          totalDurationInSeconds = durations.reduce(
            (acc, curr) => acc + curr,
            0,
          );
        }
        return {
          durationInFrames: Math.floor(totalDurationInSeconds * 30),
        };
      }}
    />
  );
};
