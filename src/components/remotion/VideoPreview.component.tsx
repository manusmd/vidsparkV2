"use client";

import React, { useMemo, useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { VideoComposition } from "@/components/remotion/VideoComposition.component";
import type { Scene, VideoStyling } from "@/app/types";

interface VideoPreviewProps {
  scenes: { [sceneIndex: number]: Scene };
  styling: VideoStyling;
  textPosition: string;
  showTitle: boolean;
  title: string;
  musicVolume: number;
  musicUrl: string | undefined;
}

export function VideoPreview({
  scenes,
  styling,
  textPosition,
  showTitle,
  title,
  musicUrl,
  musicVolume,
}: VideoPreviewProps) {
  const playerRef = useRef<PlayerRef | null>(null);

  const durationInFramesComputed = useMemo(() => {
    const fps = 30;
    return Object.values(scenes).reduce((total, scene) => {
      let sceneDurationSec = 5;
      if (scene.captionsWords && scene.captionsWords.length > 0) {
        sceneDurationSec =
          scene.captionsWords[scene.captionsWords.length - 1].end;
      }
      return total + Math.round(sceneDurationSec * fps);
    }, 0);
  }, [scenes]);

  const durationInFrames =
    durationInFramesComputed > 0 ? durationInFramesComputed : 1;
  const stableStyling = useMemo(
    () => ({
      font: styling?.font,
      variant: styling?.variant,
    }),
    [styling?.font, styling?.variant],
  );

  const inputProps = useMemo(
    () => ({
      scenes,
      styling: stableStyling,
      textPosition,
      showTitle,
      title,
      musicUrl,
      musicVolume,
    }),
    [scenes, stableStyling, textPosition, showTitle, musicUrl, musicVolume],
  );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Player
        ref={playerRef}
        acknowledgeRemotionLicense
        component={VideoComposition}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        fps={30}
        compositionHeight={1280}
        compositionWidth={720}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "0",
        }}
        controls
        autoPlay={false}
        clickToPlay={true}
        spaceKeyToPlayOrPause
        doubleClickToFullscreen={false}
        allowFullscreen={false}
      />
    </div>
  );
}
