"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";

interface MusicContextType {
  musicUrl: string;
  musicVolume: number;
  setMusicUrl: (url: string) => void;
  setMusicVolume: (vol: number) => void;
  updateMusic: (musicUrl: string, musicVolume: number, musicId?: string | null) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({
  videoId,
  children,
}: {
  videoId: string;
  children: ReactNode;
}) {
  const { video } = useVideoDetail(videoId);
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState<number>(0.5); // default 50%

  // Load initial values from the video document.
  useEffect(() => {
    if (video) {
      setMusicUrl(video.musicUrl || "");
      setMusicVolume(video.musicVolume !== undefined ? video.musicVolume : 0.5);
    }
  }, [video]);

  // updateMusic sends a PUT request to update the video document.
  const updateMusic = async (newMusicUrl: string, newMusicVolume: number, musicId?: string | null) => {
    // Optimistically update local state.
    setMusicUrl(newMusicUrl);
    setMusicVolume(newMusicVolume);
    try {
      const res = await fetch("/api/video/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          musicUrl: newMusicUrl,
          musicVolume: newMusicVolume, // send as number
          musicId
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error updating music settings");
      }
      const result = await res.json();
      // Optionally update local state with the returned data.
      if (result.musicUrl) {
        setMusicUrl(result.musicUrl);
      }
      if (result.musicVolume) {
        setMusicVolume(parseFloat(result.musicVolume));
      }
    } catch (error) {
      console.error("Error updating music settings:", error);
      // Optionally revert local state if needed.
    }
  };

  return (
    <MusicContext.Provider
      value={{
        musicUrl,
        musicVolume,
        setMusicUrl,
        setMusicVolume,
        updateMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
