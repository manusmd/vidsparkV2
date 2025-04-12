"use client";

import type React from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion";
import { Scene } from "@/app/types";

interface SceneCompositionProps {
  scene: Scene;
  index: number;
  durationInFrames: number;
}

export const SceneComposition: React.FC<SceneCompositionProps> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Simple linear zoom from start to end
  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1.4],
    {
      extrapolateRight: "clamp",
      easing: (t) => t, // Linear easing
    }
  );

  return (
    <AbsoluteFill>
      <Img
        crossOrigin="anonymous"
        src={scene.imageUrl ?? ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

