"use client";

import type React from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion";
import { Scene } from "@/app/types";

interface SceneCompositionProps {
  scene: Scene;
  index: number;
  durationInFrames?: number;
}

export const SceneComposition: React.FC<SceneCompositionProps> = ({
  scene,
  durationInFrames = 150,
}) => {
  const frame = useCurrentFrame();
  // Only zoom in: linearly scale from 1 to 1.2 over the entire duration.
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.2], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Img
        crossOrigin="anonymous"
        src={scene.imageUrl ?? ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
