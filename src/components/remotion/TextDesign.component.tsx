"use client";

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fitText } from "@remotion/layout-utils";
import { makeTransform, translateY } from "@remotion/animation-utils";
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
  isTitle?: boolean;
}

export const TextDesign: React.FC<TextDesignProps> = ({
  enterProgress,
  page,
  highlightColor,
  variant = "default",
  textVariant = "roboto",
  isTitle = false,
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

  // Calculate available width considering container width and padding
  // Use different width percentages for title vs regular text
  const containerWidth = width * (isTitle ? 0.95 : 0.9); // Increased width for better readability

  // Account for token-level horizontal padding (0.5rem on each side) and gap between tokens (0.3rem)
  // Assuming 1rem = 16px and an average of 5 tokens per line
  const tokenPadding = 16; // 0.5rem * 2 sides * 16px
  const tokenGaps = 5; // 0.3rem * 16px

  // Calculate available width for text
  const availableWidth = containerWidth - tokenPadding - tokenGaps; // Removed extra safety margin

  // Use a scaling factor to ensure the font size is not too large
  // This helps prevent long words from overflowing the container
  const scalingFactor = 0.95; // Reduce font size by only 5% as a safety measure

  const fittedText = fitText({
    fontFamily: chosenFont,
    text: page.text,
    // Use a slightly conservative width value (95% of available width)
    withinWidth: availableWidth * scalingFactor,
    textTransform: "uppercase",
  });

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

  // Calculate a maximum font size based on the video width
  // This prevents text from becoming too large, especially for short texts or titles
  const maxFontSize = isTitle ? width * 0.1 : width * 0.07; // 10% of width for title, 7% for regular text

  const baseStyle: React.CSSProperties = {
    // Limit the font size to the maximum value, then increase by 1.5x
    fontSize: Math.min(fittedText.fontSize, maxFontSize) * 1.5,
    width: `${containerWidth}px`, // Use the calculated container width
    paddingTop: 150,
    paddingBottom: 150,
    fontFamily: chosenFont,
    fontWeight: fontWeightMapping[textVariant],
    textTransform: variant === "fancy" ? "none" : "uppercase", // Only uppercase for certain styles
    textAlign: "center",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0.3rem", // Increased gap for better spacing
    transform: makeTransform([
      translateY(interpolate(enterProgress, [0, 1], [20, 0])), // Subtle movement from bottom
    ]),
    opacity: interpolate(enterProgress, [0, 1], [0.7, 1]), // Fade in effect
    transition: "all 0.5s ease-out",
    maxWidth: "100%", // Ensure container doesn't exceed video width
    overflowWrap: "break-word", // Break long words if necessary
    wordWrap: "break-word", // Legacy property for IE support
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
    padding: "0.3rem 0.5rem", // Reduced padding to make text less obtrusive
    boxSizing: "border-box",
    WebkitTextStroke: "none", // Remove borders on text as per requirement
    textShadow: combinedTextShadow, // Enhanced text shadow for better readability
    background: "transparent", // Always transparent background to remove the box
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease-out", // Smooth transition for all property changes
    transform: "translateZ(0)", // Hardware acceleration
    backfaceVisibility: "hidden", // Prevent flickering during animations
    letterSpacing: variant === "futuristic" ? "1px" : "normal", // Special letter spacing for futuristic style
    maxWidth: "100%", // Ensure token doesn't exceed container width
    overflowWrap: "break-word", // Break long words if necessary
    wordWrap: "break-word", // Legacy property for IE support
    wordBreak: "keep-all", // Prevent breaking within words
    hyphens: "none", // Disable hyphenation to prevent word breaking
  };

  return (
    <div style={baseStyle}>
      {page.tokens.map((t, index) => {
        const startRelative = t.fromMs - page.startMs;
        const endRelative = t.toMs - page.startMs;
        const active = startRelative <= timeInMs && endRelative > timeInMs;

        // Calculate how far into the active period we are (0 to 1)
        const activeProgress = active
          ? Math.min(
              1,
              (timeInMs - startRelative) / (endRelative - startRelative),
            )
          : 0;

        // Subtle floating animation for all tokens
        // Each token gets a slightly different animation based on its index
        const floatOffset = Math.sin((frame / fps) * 0.5 + index * 0.5) * 2;

        // Enhanced active token effects
        const activeStyles: React.CSSProperties = active
          ? {
              color: effectiveHighlightColor,
              transform: `scale(${1 + activeProgress * 0.05}) translateY(${floatOffset * 0.5}px)`, // Combine scale with reduced floating
              textShadow: `0 0 10px rgba(0, 0, 0, 0.8), 0 0 ${Math.round(activeProgress * 12)}px ${effectiveHighlightColor}60`, // Enhanced text shadow for active words
              WebkitTextStroke: "none", // No border for active words as per requirement
            }
          : {
              color: currentVariant.color,
              transform: `translateY(${floatOffset}px)`, // Just floating for inactive tokens
            };

        return (
          <span
            key={`${t.fromMs}${t.toMs}-${index}`}
            style={{
              ...tokenBaseStyle,
              ...activeStyles,
              transition: "color 0.2s ease-out, box-shadow 0.2s ease-out", // Only transition color and box-shadow, not transform (for smooth animation)
            }}
          >
            {t.text}
          </span>
        );
      })}
    </div>
  );
};
