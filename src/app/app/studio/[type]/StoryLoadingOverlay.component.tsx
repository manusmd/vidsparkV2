"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import storyAnimation from "./storyAnimation.json";

export default function LoadingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  const statusMessages = [
    "Sketching the plot twist...",
    "Drafting dramatic narrative...",
    "Weaving suspense into every word...",
    "Infusing magic into the narrative...",
    "Polishing the cliffhanger...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-50">
      <Lottie
        animationData={storyAnimation}
        loop={true}
        className="w-32 h-32"
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="mt-4 text-xl font-bold text-foreground"
        >
          {statusMessages[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
