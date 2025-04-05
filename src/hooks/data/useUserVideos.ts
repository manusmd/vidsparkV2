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

  // Try to use data from context if available
  try {
    const dataContext = useDataContext();
    
    // Return the data from context instead of making separate API calls
    return {
      videos: dataContext.userVideos,
      loading: dataContext.userVideosLoading,
      error: dataContext.userVideosError,
      refreshVideos: dataContext.refreshUserVideos,
    };
  } catch (e) {
    // If context is not available, fall back to original implementation
    const fetchVideos = async () => {
      if (!user) {
        setVideos([]);
        setLoading(false);
        return [];
      }
      
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch(ROUTES.API.VIDEO.GET_USER_VIDEOS, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          const errorData = await res.text();
          console.error("Video fetch error:", errorData);
          throw new Error(`Failed to fetch videos: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Video response in hook:", data);
        
        // Handle different response formats
        let userVideos;
        if (Array.isArray(data)) {
          userVideos = data;
        } else if (data.videos && Array.isArray(data.videos)) {
          userVideos = data.videos;
        } else {
          console.warn("Unexpected video response format:", data);
          userVideos = [];
        }
        
        setVideos(userVideos);
        return userVideos;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Video fetch error details:", err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (user) {
        fetchVideos().catch(console.error);
      } else {
        setVideos([]);
        setLoading(false);
      }
    }, [user]);

    return {
      videos,
      loading,
      error,
      refreshVideos: fetchVideos,
    };
  }
} 