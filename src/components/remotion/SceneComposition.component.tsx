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

  // Enhanced slow scaling animation that lasts the entire scene duration
  // Scale from 1 to 1.1 with a smooth easing function
  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1.1],
    {
      extrapolateRight: "clamp",
      // Use a cubic bezier curve for smoother, more natural motion
      easing: (t) => {
        // Slow start, slow end cubic easing
        return t * t * (3 - 2 * t);
      }
    }
  );

  // Add a subtle horizontal pan effect
  const xOffset = interpolate(
    frame,
    [0, durationInFrames],
    [0, -5],
    {
      extrapolateRight: "clamp",
      easing: (t) => t * t,
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
          objectFit: "cover", // Changed from contain to cover for better visual impact
          transform: `scale(${scale}) translateX(${xOffset}px)`,
          transformOrigin: "center center",
          transition: "transform 0.5s ease-out",
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
