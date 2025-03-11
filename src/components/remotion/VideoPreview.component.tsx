"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { VideoComposition } from "@/components/remotion/VideoComposition.component";
import type { Scene } from "@/app/types";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoPreviewProps {
  scenes: { [sceneIndex: number]: Scene };
  style?: string;
  genre?: string;
}

export function VideoPreview({ scenes, style, genre }: VideoPreviewProps) {
  const playerRef = useRef<PlayerRef | null>(null);

  // Memoize duration calculation based on scenes.
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

  // Memoize inputProps to prevent unnecessary re-renders.
  const inputProps = useMemo(
    () => ({
      scenes,
      style,
      genre,
    }),
    [scenes, style, genre],
  );

  return (
    <div className="relative aspect-[9/16] w-full max-w-md mx-auto">
      <div className="absolute top-2 right-2 z-10">
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-5 h-5 text-gray-500 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white p-2 rounded shadow-lg max-w-xs">
            <p className="text-xs whitespace-normal">
              Note: <br /> You may experience faltering audio during preview.
              <br />
              This issue will not occur in the rendered video.
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
        compositionHeight={1920}
        compositionWidth={1080}
        style={{ width: "100%", height: "100%" }}
        controls
        autoPlay={false}
      />
    </div>
  );
}
