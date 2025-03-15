"use client";

import type React from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TikTokPage } from "@remotion/captions";
import { TextDesign } from "@/components/remotion/TextDesign.component";
import { VideoStyling } from "@/app/types";

const SubtitlePage: React.FC<{
  page: TikTokPage;
  styling?: VideoStyling;
}> = ({ page, styling }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Sequence
          className={"items-start"}
          from={0}
          durationInFrames={Infinity}
        >
          <TextDesign
            enterProgress={enter}
            page={page}
            textVariant={styling?.font}
            variant={styling?.variant}
          />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default SubtitlePage;
