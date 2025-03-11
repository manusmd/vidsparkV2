"use client";

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fitText } from "@remotion/layout-utils";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import type { TikTokPage } from "@remotion/captions";

import { robotoBold } from "./fonts";
import { latoBold } from "./fonts";
import { caveatBold } from "./fonts";
import { playfairDisplayBold } from "./fonts";
import { dancingScript } from "./fonts";

import { textDesignVariants, TextDesignVariant } from "./textDesigns";

export interface TextDesignProps {
  enterProgress: number;
  page: TikTokPage;
  highlightColor?: string;
  variant?: TextDesignVariant;
  textVariant?: "roboto" | "lato" | "caveat" | "playfair" | "dancingScript";
}

export const TextDesign: React.FC<TextDesignProps> = ({
  enterProgress,
  page,
  highlightColor,
  variant = "default",
  textVariant = "roboto",
}) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const fontMapping: Record<
    NonNullable<TextDesignProps["textVariant"]>,
    string
  > = {
    roboto: robotoBold,
    lato: latoBold,
    caveat: caveatBold,
    playfair: playfairDisplayBold,
    dancingScript: dancingScript,
  };
  const chosenFont = fontMapping[textVariant];

  const fittedText = fitText({
    fontFamily: chosenFont,
    text: page.text,
    withinWidth: width * 0.7,
    textTransform: "uppercase",
  });
  const fontSize = fittedText.fontSize;

  const fontWeightMapping: Record<
    NonNullable<TextDesignProps["textVariant"]>,
    number
  > = {
    roboto: 900,
    lato: 900,
    caveat: 700,
    playfair: 900,
    dancingScript: 700,
  };

  const commonStrokeWidth = "4px";

  const baseStyle: React.CSSProperties = {
    fontSize,
    width: "90%",
    padding: 0,
    fontFamily: chosenFont,
    fontWeight: fontWeightMapping[textVariant],
    textTransform: "uppercase",
    textAlign: "center",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0.2rem",
    transform: makeTransform([
      scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
      translateY(interpolate(enterProgress, [0, 1], [50, 0])),
    ]),
  };

  const currentVariant = textDesignVariants[variant];

  const variantHighlightMapping: Record<TextDesignVariant, string> = {
    default: "#00FF00",
    cool: "#00FFFF",
    retro: "#FF4500",
    classic: "#FFD700",
    vivid: "#FF69B4",
    fancy: "#FF8C00",
    comic: "#8B0000",
    tiktok: "#00FF00",
    horror: "#FFFFFF",
    futuristic: "#FF00FF",
  };

  const effectiveHighlightColor =
    highlightColor || variantHighlightMapping[variant];

  const defaultSoftShadow = "0 0 20px rgba(0, 0, 0, 0.95)";
  const combinedTextShadow = currentVariant.textShadow
    ? `${currentVariant.textShadow}, ${defaultSoftShadow}`
    : defaultSoftShadow;

  const tokenBaseStyle: React.CSSProperties = {
    display: "flex",
    whiteSpace: "normal",
    height: "fit-content",
    marginTop: "4rem",
    padding: "0.3rem 0.5rem",
    boxSizing: "border-box",
    WebkitTextStroke: `${commonStrokeWidth} ${currentVariant.stroke}`,
    textShadow: combinedTextShadow,
    background: currentVariant.background,
    borderRadius: "1.5rem",
    boxShadow: currentVariant.boxShadow,
    border: currentVariant.border,
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={baseStyle}>
      {page.tokens.map((t) => {
        const startRelative = t.fromMs - page.startMs;
        const endRelative = t.toMs - page.startMs;
        const active = startRelative <= timeInMs && endRelative > timeInMs;
        return (
          <span
            key={t.fromMs}
            style={{
              ...tokenBaseStyle,
              color: active ? effectiveHighlightColor : currentVariant.color,
            }}
          >
            {t.text}
          </span>
        );
      })}
    </div>
  );
};
