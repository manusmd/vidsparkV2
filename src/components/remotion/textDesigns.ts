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
    stroke: "#000000",
    background: "transparent",
    textShadow: "none",
  },
  cool: {
    color: "#c1f5ff",
    stroke: "#0099cc",
    background: "transparent",
    textShadow: "0 0 4px #0099cc",
  },
  retro: {
    color: "#ffdd99",
    stroke: "#663300",
    background: "transparent",
    textShadow: "2px 2px 2px #000",
  },
  classic: {
    color: "#FFFFFF",
    stroke: "transparent",
    background: "linear-gradient(180deg, #2A2A2A, #1E1E1E)", // the only background
    textShadow: "none",
  },
  vivid: {
    color: "#ff0088",
    stroke: "#ffd700",
    background: "transparent",
    textShadow: "2px 2px 5px rgba(255, 0, 136, 0.6)",
  },
  fancy: {
    color: "#fff2cc",
    stroke: "#8b4513",
    background: "transparent",
    textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
  },
  comic: {
    // Comic style: yellow text with a red outline and red tinted shadow.
    color: "#FFFF00", // bright yellow text
    stroke: "#FF0000", // red stroke
    background: "transparent",
    textShadow: "2px 2px 3px rgba(255,0,0,0.8)",
  },
  tiktok: {
    // TikTok style: white text with a subtle outline/shadow.
    color: "#FFFFFF",
    stroke: "#000000",
    background: "transparent",
    textShadow: "0 0 2px rgba(0,0,0,0.5)",
  },
  horror: {
    color: "#ff1a1a",
    stroke: "#000000",
    background: "transparent",
    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.9)",
  },
  futuristic: {
    color: "#00faff",
    stroke: "#00faff",
    background: "transparent",
    textShadow: "0 0 6px #00faff, 0 0 12px #00faff",
  },
};
