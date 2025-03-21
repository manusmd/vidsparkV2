import { useEffect, useState } from "react";
import { MusicTrack } from "@/app/types";

export function useMusicTracks() {
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusicTracks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/music");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch music tracks: ${response.statusText}`,
          );
        }
        const data = await response.json();
        setMusicTracks(data.musicTracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMusicTracks();
  }, []);

  // New: Function to handle file upload and return the URL.
  const uploadMusicFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/music/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload music file");
    }
    const data = await response.json();
    return data.url;
  };

  // Create a music track. Optionally, if a file is provided, it is uploaded first.
  const createMusicTrack = async (
    musicData: Partial<MusicTrack>,
    file?: File,
  ) => {
    if (file) {
      const url = await uploadMusicFile(file);
      musicData.src = url;
    }
    const response = await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(musicData),
    });
    if (!response.ok) {
      throw new Error("Failed to create music track");
    }
    const newTrack = await response.json();
    setMusicTracks((prev) => [...prev, newTrack]);
  };

  // Update a music track. Optionally, if a file is provided, it is uploaded first.
  const updateMusicTrack = async (
    id: string,
    musicData: Partial<MusicTrack>,
    file?: File,
  ) => {
    if (file) {
      const url = await uploadMusicFile(file);
      musicData.src = url;
    }
    const response = await fetch(`/api/music/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(musicData),
    });
    if (!response.ok) {
      throw new Error("Failed to update music track");
    }
    const updatedTrack = await response.json();
    setMusicTracks((prev) =>
      prev.map((track) => (track.id === id ? updatedTrack : track)),
    );
  };

  const deleteMusicTrack = async (id: string) => {
    const response = await fetch(`/api/music/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete music track");
    }
    setMusicTracks((prev) => prev.filter((track) => track.id !== id));
  };

  return {
    musicTracks,
    loading,
    error,
    createMusicTrack,
    updateMusicTrack,
    deleteMusicTrack,
    uploadMusicFile,
  };
}
