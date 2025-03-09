"use client";

import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import type { TikTokPage } from "@remotion/captions";
import { TextDesign } from "@/components/remotion/TextDesign.component";

export const Page: React.FC<{ enterProgress: number; page: TikTokPage }> = ({
  enterProgress,
  page,
}) => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={Infinity}>
        <TextDesign enterProgress={enterProgress} page={page} />
      </Sequence>
    </AbsoluteFill>
  );
};
