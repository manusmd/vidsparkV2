import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ChannelStats {
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
}

interface BestPostingDay {
  day: string;
  dayName: string;
  totalViews: number;
  totalWatchTime: number;
  count: number;
  avgViews: number;
  avgWatchTime: number;
}

interface BestPostingHour {
  hour: string;
  hourFormatted: string;
  totalViews: number;
  totalWatchTime: number;
  count: number;
  avgViews: number;
  avgWatchTime: number;
  day: string;
}

interface VideoAnalysis {
  videosAnalyzed: number;
  dataSource: "channel_videos" | "analytics_api";
  dateRange: {
    start: string;
    end: string;
  };
  description: string;
}

interface ChannelAnalytics {
  channelStats: ChannelStats;
  bestPostingTimes: {
    days: BestPostingDay[];
    hours: BestPostingHour[];
    hoursByDay: { [day: string]: BestPostingHour[] };
  };
  videoAnalysis: VideoAnalysis;
}


export function useChannelAnalytics(channelId: string) {
  const [analytics, setAnalytics] = useState<ChannelAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const fetchAnalytics = async () => {
    if (!channelId) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/accounts/${channelId}/analytics`, { headers });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      const responseData = await res.json();
      const analyticsData = responseData.data;

      setAnalytics(analyticsData);
    } catch (err: unknown) {
      console.error("Error fetching channel analytics:", err);
      setError((err as Error).message || "Error fetching analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchAnalytics();
    }
  }, [channelId]);

  return { analytics, isLoading, error, refetch: fetchAnalytics };
}
