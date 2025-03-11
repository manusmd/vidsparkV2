import { loadFont as loadRobotoFont } from "@remotion/google-fonts/Roboto";
import { loadFont as loadLatoFont } from "@remotion/google-fonts/Lato";
import { loadFont as loadPlayfairDisplayFont } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadDancingScriptFont } from "@remotion/google-fonts/DancingScript";
import { loadFont as loadCaveatFont } from "@remotion/google-fonts/Caveat";

export const { fontFamily: robotoBold } = loadRobotoFont("normal", {
  weights: ["900"],
});
export const { fontFamily: latoBold } = loadLatoFont("normal", {
  weights: ["900"],
});

// For Caveat, use the highest available weight which is 700.
export const { fontFamily: caveatBold } = loadCaveatFont("normal", {
  weights: ["700"],
});
export const { fontFamily: playfairDisplayBold } = loadPlayfairDisplayFont(
  "normal",
  {
    weights: ["900"],
  },
);
export const { fontFamily: dancingScript } = loadDancingScriptFont("normal", {
  weights: ["700"],
});
