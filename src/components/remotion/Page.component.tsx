"use client";

import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import type { TikTokPage } from "@remotion/captions";
import { TextDesign } from "@/components/remotion/TextDesign.component";
import { useTextDesign } from "@/hooks/useTextDesign";

export const Page: React.FC<{ enterProgress: number; page: TikTokPage }> = ({
  enterProgress,
  page,
}) => {
  const { variant, font } = useTextDesign();
  return (
    <AbsoluteFill>
      <Sequence className={"items-start"} from={0} durationInFrames={Infinity}>
        <TextDesign
          enterProgress={enterProgress}
          page={page}
          textVariant={font}
          variant={variant}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
