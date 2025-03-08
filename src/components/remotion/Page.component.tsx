"use client";

import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fitText } from "@remotion/layout-utils";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import type { TikTokPage } from "@remotion/captions";
import { boldFontFamily } from "./fonts";

const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  top: undefined,
  bottom: 250, // Moved up slightly for better positioning
  height: 200, // Increased height for larger text
};

const DESIRED_FONT_SIZE = 150; // Increased from 120
const HIGHLIGHT_COLOR = "#39E508";

export const Page: React.FC<{
  enterProgress: number;
  page: TikTokPage;
}> = ({ enterProgress, page }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const fittedText = fitText({
    fontFamily: boldFontFamily,
    text: page.text,
    withinWidth: width * 0.9,
    textTransform: "uppercase",
  });

  const fontSize = Math.min(DESIRED_FONT_SIZE, fittedText.fontSize);

  return (
    <AbsoluteFill style={container}>
      <div
        style={{
          fontSize,
          color: "white",
          WebkitTextStroke: "25px black", // Increased stroke width
          paintOrder: "stroke",
          transform: makeTransform([
            scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
            translateY(interpolate(enterProgress, [0, 1], [50, 0])),
          ]),
          fontFamily: boldFontFamily,
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            transform: makeTransform([
              scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
              translateY(interpolate(enterProgress, [0, 1], [50, 0])),
            ]),
          }}
        >
          {page.tokens.map((t) => {
            const startRelativeToSequence = t.fromMs - page.startMs;
            const endRelativeToSequence = t.toMs - page.startMs;
            const active =
              startRelativeToSequence <= timeInMs &&
              endRelativeToSequence > timeInMs;

            return (
              <span
                key={t.fromMs}
                style={{
                  display: "inline",
                  whiteSpace: "pre",
                  color: active ? HIGHLIGHT_COLOR : "white",
                }}
              >
                {t.text}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};
