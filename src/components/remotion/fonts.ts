import { loadFont } from "@remotion/google-fonts/Inter";

// Load Inter font with all weights
export const { fontFamily: boldFontFamily } = loadFont("normal", {
  weights: ["800", "900"],
});
