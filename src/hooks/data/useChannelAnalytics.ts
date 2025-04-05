import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDataContext } from "@/contexts/DataContext";

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

  // Try to use data from context if available
  try {
    const dataContext = useDataContext();
    
    // Find the account with analytics from the context
    const accountWithAnalytics = dataContext.accountsWithAnalytics.find(
      account => account.id === channelId
    );
    
    const analyticsFromContext = accountWithAnalytics?.analytics || null;

    // Set up the refetch function to use context's refreshAnalytics
    const refetch = async () => {
      try {
        setIsLoading(true);
        const updatedAnalytics = await dataContext.refreshAnalytics(channelId);
        return updatedAnalytics;
      } finally {
        setIsLoading(false);
      }
    };
    
    useEffect(() => {
      // If we don't have analytics for this channel yet, try to fetch them
      if (!analyticsFromContext && channelId) {
        refetch();
      }
    }, [channelId]);
    
    return {
      analytics: analyticsFromContext,
      isLoading: dataContext.analyticsLoading || isLoading,
      error: dataContext.analyticsError, 
      refetch
    };
  } catch (e) {
    // If context is not available, fall back to original implementation
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
        return analyticsData;
      } catch (err: unknown) {
        console.error("Error fetching channel analytics:", err);
        setError((err as Error).message || "Error fetching analytics");
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (channelId && user) {
        fetchAnalytics().catch(console.error);
      }
    }, [channelId, user]);

    return { analytics, isLoading, error, refetch: fetchAnalytics };
  }
}
