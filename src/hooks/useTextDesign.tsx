"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";
import type { VideoStyling } from "@/app/types";
import { TextDesignSchema } from "@/components/remotion/types/constants";

interface TextDesignContextType {
  styling: VideoStyling | null;
  setStyling: (styling: VideoStyling) => void;
  updateStyling: (
    variant: VideoStyling["variant"],
    font: VideoStyling["font"],
  ) => Promise<void>;
}

const TextDesignContext = createContext<TextDesignContextType | undefined>(
  undefined,
);

export function TextDesignProvider({
  videoId,
  children,
}: {
  videoId: string;
  children: ReactNode;
}) {
  // Get initial styling from video details.
  const { video } = useVideoDetail(videoId);
  
  // Convert video.styling to the correct VideoStyling type
  const initialStyling = video?.styling 
    ? TextDesignSchema.parse(video.styling) 
    : null;
    
  const [styling, setStyling] = useState<VideoStyling | null>(initialStyling);

  // Update local styling when video.styling changes.
  useEffect(() => {
    if (video?.styling) {
      setStyling(TextDesignSchema.parse(video.styling));
    }
  }, [video?.styling]);

  // updateStyling updates local state and calls the endpoint in the background.
  const updateStyling = async (
    variant: VideoStyling["variant"],
    font: VideoStyling["font"],
  ) => {
    // Optimistically update local state.
    setStyling({ variant, font });
    try {
      const res = await fetch("/api/video/styling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, variant, font }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error updating styling");
      }
      const result = await res.json();
      // Optionally update with the returned styling.
      if (result.styling) {
        setStyling(result.styling);
      }
    } catch (error) {
      console.error("Error updating styling:", error);
      // Optionally revert local state if needed.
    }
  };

  return (
    <TextDesignContext.Provider value={{ styling, setStyling, updateStyling }}>
      {children}
    </TextDesignContext.Provider>
  );
}

export function useTextDesign() {
  const context = useContext(TextDesignContext);
  if (!context) {
    throw new Error("useTextDesign must be used within a TextDesignProvider");
  }
  return context;
}
