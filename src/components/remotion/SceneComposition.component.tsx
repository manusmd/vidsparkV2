"use client";

import type React from "react";
import { AbsoluteFill, Img } from "remotion";
import { Scene } from "@/app/types";

interface SceneCompositionProps {
  scene: Scene;
  index: number;
  isTitle?: boolean;
}

export const SceneComposition: React.FC<SceneCompositionProps> = ({
  scene,
  index,
}) => {
  if (!scene.imageUrl) {
    console.error(`Missing image URL for scene ${index}`);
    return null;
  }

  return (
    <AbsoluteFill>
      <Img
        src={scene.imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
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
