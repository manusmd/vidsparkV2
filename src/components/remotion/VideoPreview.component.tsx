"use client";

import { loadFont } from "@remotion/google-fonts/Inter";
import { useMemo } from "react";
import { VideoComposition } from "@/components/remotion/VideoComposition.component";
import type { Scene } from "@/app/types";
import { Player } from "@remotion/player";

const { fontFamily } = loadFont();

interface VideoPreviewProps {
  scenes: { [sceneIndex: number]: Scene };
  style?: string;
  genre?: string;
}

export function VideoPreview({ scenes, style, genre }: VideoPreviewProps) {
  // Calculate total duration in frames based on each scene.
  // If a scene has captionsWords, use the last word's end time (in seconds);
  // otherwise, default to 5 seconds.
  const durationInFrames = useMemo(() => {
    const fps = 30;
    return Object.values(scenes).reduce((total, scene) => {
      let sceneDurationSec = 5; // default duration
      if (scene.captionsWords && scene.captionsWords.length > 0) {
        sceneDurationSec =
          scene.captionsWords[scene.captionsWords.length - 1].end;
      }
      return total + Math.round(sceneDurationSec * fps);
    }, 0);
  }, [scenes]);

  // Memoize input props for the VideoComposition.
  const inputProps = useMemo(
    () => ({
      scenes,
      style,
      genre,
      fontFamily,
    }),
    [scenes, style, genre],
  );

  return (
    <div className="aspect-[9/16] w-full max-w-md mx-auto">
      <Player
        acknowledgeRemotionLicense
        component={VideoComposition}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        fps={30}
        compositionHeight={1920}
        compositionWidth={1080}
        style={{
          width: "100%",
          height: "100%",
        }}
        controls
        autoPlay={false}
        loop
      />
    </div>
  );
}
