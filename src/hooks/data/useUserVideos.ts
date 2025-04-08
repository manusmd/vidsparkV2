"use client";

import { useState, useEffect } from "react";
import ROUTES from "@/lib/routes";
import { useDataContext } from "@/contexts/DataContext";
import { Video as VideoType } from "@/app/types";
import { useAuth } from "@/hooks/useAuth";

interface Video extends VideoType {
  youtubeVideoId?: string;
  youtubeStats?: {
    views: number;
    likes: number;
    comments: number;
  };
}

export function useUserVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const dataContext = useDataContext();

  const fetchVideos = async () => {
    if (!user) {
      setVideos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(ROUTES.API.VIDEO.BASE);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [user]);
  
  if (dataContext) {
    return {
      videos: dataContext.userVideos,
      loading: dataContext.userVideosLoading,
      error: dataContext.userVideosError,
      refreshVideos: dataContext.refreshUserVideos,
    };
  }

  return {
    videos,
    loading,
    error,
    refreshVideos: fetchVideos,
  };
} 