import { useState, useEffect } from "react";
import type { MusicTrack } from "@/app/types";
import ROUTES from "@/lib/routes";
import { useDataContext } from "@/contexts/DataContext";

export function useMusic() {
  const [music, setMusic] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataContext = useDataContext();

  const fetchMusic = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(ROUTES.API.MUSIC.BASE);
      if (!response.ok) {
        throw new Error(`Failed to fetch music tracks: ${response.statusText}`);
      }

      const data = await response.json();
      setMusic(data.musicTracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic();
  }, []);

  const refreshMusic = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(ROUTES.API.MUSIC.BASE);
      if (!response.ok) {
        throw new Error(`Failed to fetch music tracks: ${response.statusText}`);
      }

      const data = await response.json();
      setMusic(data.musicTracks);
      return data.musicTracks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For now, not using DataContext since it doesn't appear to support music tracks yet
  // Will need to update this when DataContext is extended to include music
  
  return { music, loading, error, refreshMusic };
} 