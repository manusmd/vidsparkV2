// textDesigns.ts

export type TextDesignVariant =
  | "default"
  | "cool"
  | "retro"
  | "classic" // formerly "minimal", now the only variant with a background
  | "vivid"
  | "fancy"
  | "comic"
  | "tiktok"
  | "horror"
  | "futuristic";

export type TextDesignFontsType =
  | TextDesignFonts.ROBOTO
  | TextDesignFonts.LATO
  | TextDesignFonts.CAVEAT
  | TextDesignFonts.PLAYFAIR
  | TextDesignFonts.DANCINGSCRIPT
  | undefined;

export enum TextDesignFonts {
  ROBOTO = "roboto",
  LATO = "lato",
  CAVEAT = "caveat", // new cool font replacing pacifico
  PLAYFAIR = "playfair",
  DANCINGSCRIPT = "dancingScript",
}

export interface TextDesignStyle {
  color: string;
  background: string;
  stroke: string;
  textShadow?: string;
  boxShadow?: string;
  border?: string;
}

export const textDesignVariants: Record<TextDesignVariant, TextDesignStyle> = {
  default: {
    color: "#FFFFFF",
    stroke: "#000000", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 1), 0 0 6px rgba(0, 0, 0, 0.9), 0 0 3px rgba(0, 0, 0, 0.9)", // Enhanced shadow for better readability without borders
  },
  cool: {
    color: "#E0FFFF", // Lighter cyan for better contrast
    stroke: "#006699", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.8), 0 0 4px #006699", // Enhanced shadow for better readability without borders
  },
  retro: {
    color: "#FFE0A0", // Slightly adjusted warm color
    stroke: "#663300", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.8), 2px 2px 3px #663300", // Enhanced shadow for better readability without borders
  },
  classic: {
    color: "#FFFFFF",
    stroke: "#333333", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent", // Changed to transparent as per requirement
    textShadow: "0 0 12px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.8), 0 0 3px rgba(0, 0, 0, 0.7)", // Enhanced shadow for better readability without borders
  },
  vivid: {
    color: "#FF3399", // Brighter pink
    stroke: "#990066", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.8), 2px 2px 5px rgba(255, 51, 153, 0.7)", // Enhanced shadow for better readability without borders
  },
  fancy: {
    color: "#FFF8E0", // Slightly warmer white
    stroke: "#8B4513", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(139,69,19,0.7)", // Enhanced shadow for better readability without borders
  },
  comic: {
    // Comic style with better matching colors
    color: "#FFFF66", // Slightly softer yellow
    stroke: "#CC0000", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.8), 2px 2px 3px rgba(204,0,0,0.8)", // Enhanced shadow for better readability without borders
  },
  tiktok: {
    // Modern TikTok style with enhanced readability
    color: "#FFFFFF",
    stroke: "#000000", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 15px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.9), 0 0 3px rgba(0, 0, 0, 0.9)", // Enhanced shadow for better readability without borders
  },
  horror: {
    color: "#FF3333", // Brighter red
    stroke: "#000000", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 1), 2px 2px 5px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 0, 0, 0.7)", // Enhanced shadow with red glow for better readability without borders
  },
  futuristic: {
    color: "#80FFFF", // Slightly softer cyan
    stroke: "#00CCCC", // Kept for compatibility, but not used due to WebkitTextStroke: none
    background: "transparent",
    textShadow: "0 0 12px rgba(0, 0, 0, 0.9), 0 0 8px #00CCCC, 0 0 15px #00CCCC", // Enhanced shadow for better readability without borders
  },
};
