"use client";

import React, { useMemo, useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { VideoComposition } from "@/components/remotion/VideoComposition.component";
import type { Scene, VideoStyling } from "@/app/types";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className="w-full">
      <h2 className="text-lg font-semibold text-foreground mb-4 text-left">
        Video Preview
      </h2>
      <div className="relative aspect-[9/16] w-full max-w-md mx-auto">
        <div className="absolute top-2 right-2 z-10">
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-gray-500 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white p-2 rounded shadow-lg max-w-xs">
              <p className="text-xs whitespace-normal">
                Note: <br /> You may experience faltering audio during preview.
                <br /> This issue will not occur in the rendered video.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Player
          ref={playerRef}
          acknowledgeRemotionLicense
          component={VideoComposition}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={30}
          compositionHeight={1280}
          compositionWidth={720}
          style={{ width: "100%", height: "100%" }}
          controls
          autoPlay={false}
        />
      </div>
    </div>
  );
}
