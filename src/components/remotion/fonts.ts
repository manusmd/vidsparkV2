import { loadFont as loadRobotoFont } from "@remotion/google-fonts/Roboto";
import { loadFont as loadLatoFont } from "@remotion/google-fonts/Lato";
import { loadFont as loadPacificoFont } from "@remotion/google-fonts/Pacifico";
import { loadFont as loadPlayfairDisplayFont } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadDancingScriptFont } from "@remotion/google-fonts/DancingScript";

export const { fontFamily: robotoBold } = loadRobotoFont("normal", {
  weights: ["700", "900"],
});
export const { fontFamily: latoBold } = loadLatoFont("normal", {
  weights: ["700", "900"],
});

// Fancy/Decorative fonts
export const { fontFamily: pacifico } = loadPacificoFont("normal");
export const { fontFamily: playfairDisplayBold } = loadPlayfairDisplayFont(
  "normal",
  {
    weights: ["700", "900"],
  },
);
export const { fontFamily: dancingScript } = loadDancingScriptFont("normal", {
  weights: ["400", "700"],
});
