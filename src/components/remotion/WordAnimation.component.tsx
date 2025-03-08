"use client";

import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface WordAnimationProps {
  word: string;
  start: number;
  isActive: boolean;
}

export function WordAnimation({ word, start, isActive }: WordAnimationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timing
  const entryDuration = Math.round(0.3 * fps); // 0.3 seconds for entry
  const exitDuration = Math.round(0.2 * fps); // 0.2 seconds for exit

  // Spring animation for entry
  const springAnimation = spring({
    frame: frame - start,
    fps,
    config: {
      damping: 15,
      stiffness: 400,
      mass: 0.5,
    },
  });

  // Opacity animation with clear entry and exit
  const opacity = interpolate(
    frame - start,
    [0, entryDuration, exitDuration],
    [0, 1, isActive ? 1 : 0.3],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const scale = interpolate(springAnimation, [0, 1], [0.8, 1]);
  const y = interpolate(springAnimation, [0, 1], [10, 0]);

  return (
    <>
      <span
        style={{
          opacity,
          transform: `scale(${scale}) translateY(${y}px)`,
          display: "inline-block",
          maxWidth: "90%",
          whiteSpace: "normal", // allow line breaks
          overflowWrap: "break-word",
          fontSize: "3rem", // reduced font size
          fontWeight: 800,
          fontFamily: "Inter, system-ui, sans-serif",
          textShadow: `
            -4px -4px 0 #000,  
             4px -4px 0 #000,
            -4px  4px 0 #000,
             4px  4px 0 #000,
             0 0 12px rgba(0,0,0,0.6)
          `,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
        }}
      >
        {word}
      </span>
      <span
        style={{
          display: "inline-block",
          whiteSpace: "normal",
          width: "0.5em",
        }}
      >
        {" "}
      </span>
    </>
  );
}
