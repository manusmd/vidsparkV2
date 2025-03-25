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

interface SubtitlePageProps {
  page: TikTokPage;
  styling?: VideoStyling;
  textPosition?: string;
}

const SubtitlePage: React.FC<SubtitlePageProps> = ({
  page,
  styling,
  textPosition = "top",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 3, // Reduced from 5 to 3 for faster animation
  });

  const alignmentClass =
    textPosition === "top"
      ? "items-start"
      : textPosition === "center"
        ? "items-center"
        : textPosition === "bottom"
          ? "items-end"
          : "items-start";

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={Infinity} className={alignmentClass}>
        <TextDesign
          enterProgress={enter}
          page={page}
          textVariant={styling?.font}
          variant={styling?.variant}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default SubtitlePage;
