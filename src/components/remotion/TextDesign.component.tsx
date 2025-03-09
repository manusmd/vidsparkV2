"use client";

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fitText } from "@remotion/layout-utils";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import type { TikTokPage } from "@remotion/captions";

// Import fonts (all at weight 900 except Dancing Script at 700)
import { robotoBold } from "./fonts";
import { latoBold } from "./fonts";
import { pacifico } from "./fonts";
import { playfairDisplayBold } from "./fonts";
import { dancingScript } from "./fonts";

export interface TextDesignProps {
  enterProgress: number;
  page: TikTokPage;
  highlightColor?: string;
  variant?:
    | "default"
    | "cool"
    | "retro"
    | "minimal"
    | "vivid"
    | "fancy"
    | "comic"
    | "tiktok"
    | "horror"
    | "futuristic";
  /**
   * Determines which font to use. Options:
   * "inter" | "roboto" | "lato" | "pacifico" | "playfair" | "dancingScript"
   */
  textVariant?: "roboto" | "lato" | "pacifico" | "playfair" | "dancingScript";
}

export const TextDesign: React.FC<TextDesignProps> = ({
  enterProgress,
  page,
  highlightColor = "#39E508",
  variant = "default",
  textVariant = "roboto",
}) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  // Map available fonts.
  const fontMapping: Record<
    NonNullable<TextDesignProps["textVariant"]>,
    string
  > = {
    roboto: robotoBold,
    lato: latoBold,
    pacifico: pacifico,
    playfair: playfairDisplayBold,
    dancingScript: dancingScript,
  };
  const chosenFont = fontMapping[textVariant];

  // Calculate a font size that fits within 70% of available width.
  const fittedText = fitText({
    fontFamily: chosenFont,
    text: page.text,
    withinWidth: width * 0.7,
    textTransform: "uppercase",
  });
  const fontSize = fittedText.fontSize;

  // Define a common stroke width.
  const commonStrokeWidth = "4px";

  // Base container style: no background.
  const baseStyle: React.CSSProperties = {
    fontSize,
    width: "90%",
    padding: 0,
    fontFamily: chosenFont,
    textTransform: "uppercase",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    wordBreak: "break-word",
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

  // Variant-specific styles for tokens.
  const variantStyles: {
    [key in NonNullable<TextDesignProps["variant"]>]: {
      color: string;
      background: string;
      stroke: string;
      textShadow?: string;
      animation?: string;
      boxShadow?: string;
      border?: string;
    };
  } = {
    default: {
      color: "white",
      stroke: "black",
      background: "transparent",
      textShadow: "none",
    },
    cool: {
      color: "#a0e0ff",
      stroke: "#007acc",
      background: "linear-gradient(45deg, #001f3f, #003f5f)",
      textShadow: "1px 1px 3px #000",
      boxShadow: "0 0 6px rgba(0, 0, 255, 0.3)",
      animation: "popIn 0.6s ease-out",
    },
    retro: {
      color: "#ffcc66",
      stroke: "#663300",
      background: "linear-gradient(45deg, #222, #333)",
      textShadow: "1px 1px 2px black",
      border: "1px solid #663300",
      animation: "popIn 0.8s ease-out",
    },
    minimal: {
      color: "white",
      stroke: "transparent",
      background: "#000",
      textShadow: "none",
    },
    vivid: {
      color: "#ff0055",
      stroke: "#ffcc00",
      background: "linear-gradient(45deg, #330033, #660066)",
      textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
      boxShadow: "0 0 6px #ff0055",
      animation: "gentlePulse 1s infinite alternate",
    },
    fancy: {
      color: "#ffe0b3",
      stroke: "#b36b00",
      background: "linear-gradient(45deg, #4d2600, #663300)",
      textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
      border: "1px solid rgba(255, 224, 179, 0.4)",
    },
    comic: {
      color: "#ffff66",
      stroke: "#000",
      background: "linear-gradient(45deg, #cc0000, #ff3333)",
      textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
      animation: "popIn 0.7s ease-out",
    },
    tiktok: {
      color: "#fff",
      stroke: "#000",
      background: "linear-gradient(45deg, #000, #111)",
      boxShadow: "0 0 6px rgba(255,255,255,0.2)",
    },
    horror: {
      color: "#a80000",
      stroke: "#000",
      background: "linear-gradient(45deg, #330000, #000)",
      textShadow: "1px 1px 4px rgba(0, 0, 0, 0.9)",
      animation: "slightShake 1s infinite",
      boxShadow: "0 0 8px rgba(255, 0, 0, 0.3)",
    },
    futuristic: {
      color: "#00ffe0",
      stroke: "#00ffe0",
      background: "linear-gradient(45deg, #000, #001a33)",
      textShadow: "0 0 6px #00ffe0, 0 0 12px #00ffe0",
      animation: "gentlePulse 1.2s infinite alternate",
    },
  };

  const currentVariant = variantStyles[variant];

  // Base style for each token (word) with boxSizing.
  const tokenBaseStyle: React.CSSProperties = {
    display: "flex", // inline-flex ensures tokens shrink to content and wrap if needed.
    whiteSpace: "normal",
    height: "fit-content",
    marginTop: "4rem",
    padding: "0.3rem 0.5rem",
    boxSizing: "border-box",
    WebkitTextStroke: `${commonStrokeWidth} ${currentVariant.stroke}`,
    textShadow: currentVariant.textShadow,
    background: currentVariant.background,
    borderRadius: "1.5rem",
    boxShadow: currentVariant.boxShadow,
    border: currentVariant.border,
    animation: currentVariant.animation,
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
              color: active ? highlightColor : currentVariant.color,
            }}
          >
            {t.text}
          </span>
        );
      })}
    </div>
  );
};
