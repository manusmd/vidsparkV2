"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, ThumbsUp, MessageSquare, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

export default function VideoAnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState("all");
  const [videos, setVideos] = useState<Array<{ id: string, title: string }>>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      try {
        setLoading(true);

        const accountsResponse = await fetch('/api/accounts', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });

        if (!accountsResponse.ok) {
          throw new Error('Failed to fetch accounts');
        }

        const accountsData = await accountsResponse.json();

        if (!accountsData.data || !accountsData.data.accounts || accountsData.data.accounts.length === 0) {
          setError('No connected accounts found. Please connect a YouTube account to view analytics.');
          setLoading(false);
          return;
        }

        const accountId = accountsData.data.accounts[0].id;

        const analyticsResponse = await fetch(`/api/accounts/${accountId}/analytics`, {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });

        if (!analyticsResponse.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const responseData = await analyticsResponse.json();
        setAnalyticsData(responseData.data);

        // In a real implementation, you would fetch the actual videos here
        // For now, we'll just create some placeholder videos
        setVideos([
          { id: "all", title: "All Videos" },
          { id: "recent", title: "Recent Videos" }
        ]);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">Unable to load analytics</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground">
        Analyze performance metrics for individual videos on your YouTube channel.
      </p>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Video Performance</h2>
        <Select value={selectedVideo} onValueChange={setSelectedVideo}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a video" />
          </SelectTrigger>
          <SelectContent>
            {videos.map(video => (
              <SelectItem key={video.id} value={video.id}>{video.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData ? formatNumber(analyticsData.channelStats.viewCount) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total views on your videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData && analyticsData.bestPostingTimes.days.length > 0 
                ? formatNumber(analyticsData.bestPostingTimes.days[0].totalWatchTime) + ' hrs'
                : '0 hrs'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total watch time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData ? formatNumber(analyticsData.channelStats.videoCount) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total videos published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData ? formatNumber(analyticsData.channelStats.subscriberCount) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Viewer Retention</CardTitle>
          <CardDescription>
            See how long viewers watch your videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
            <p className="text-muted-foreground">Retention chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>
              Where your viewers are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">Traffic sources chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
            <CardDescription>
              Age and gender breakdown of your viewers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">Demographics chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
