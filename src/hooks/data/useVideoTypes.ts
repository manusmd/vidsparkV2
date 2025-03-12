import { useState, useEffect } from "react";
import type { VideoType } from "@/app/types";

export function useVideoTypes() {
  const [videoTypes, setVideoTypes] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videotypes");
      if (!res.ok) {
        throw new Error("Failed to fetch video types");
      }
      const data: VideoType[] = await res.json();
      setVideoTypes(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoTypes();
  }, []);

  const createVideoType = async (videoTypeData: Partial<VideoType>) => {
    try {
      const res = await fetch("/api/videotypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoTypeData),
      });
      if (!res.ok) {
        throw new Error("Failed to create video type");
      }
      const newType = await res.json();
      setVideoTypes((prev) => [...prev, newType]);
      return newType;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  };

  const updateVideoType = async (
    id: string,
    videoTypeData: Partial<VideoType>,
  ) => {
    try {
      const res = await fetch(`/api/videotypes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoTypeData),
      });
      if (!res.ok) {
        throw new Error("Failed to update video type");
      }
      const updatedType = await res.json();
      setVideoTypes((prev) =>
        prev.map((vt) => (vt.id === id ? updatedType : vt)),
      );
      return updatedType;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  };

  const deleteVideoType = async (id: string) => {
    try {
      const res = await fetch(`/api/videotypes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete video type");
      }
      setVideoTypes((prev) => prev.filter((vt) => vt.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  };

  const generateVideoTypeImage = async (prompt: string): Promise<string> => {
    try {
      const res = await fetch("/api/videotypes/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate image");
      }
      const { imageUrl } = await res.json();
      return imageUrl;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  };

  return {
    videoTypes,
    loading,
    error,
    fetchVideoTypes,
    createVideoType,
    updateVideoType,
    deleteVideoType,
    generateVideoTypeImage,
  };
}
