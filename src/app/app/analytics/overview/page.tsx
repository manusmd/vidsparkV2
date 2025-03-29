"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

export default function OverviewPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      try {
        setLoading(true);

        const accountsResponse = await fetch("/api/accounts", {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (!accountsResponse.ok) {
          throw new Error("Failed to fetch accounts");
        }

        const accountsData = await accountsResponse.json();

        if (
          !accountsData.data ||
          !accountsData.data.accounts ||
          accountsData.data.accounts.length === 0
        ) {
          setError(
            "No connected accounts found. Please connect a YouTube account to view analytics.",
          );
          setLoading(false);
          return;
        }

        const accountId = accountsData.data.accounts[0].id;

        const analyticsResponse = await fetch(
          `/api/accounts/${accountId}/analytics`,
          {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          },
        );

        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const responseData = await analyticsResponse.json();
        setAnalyticsData(responseData.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
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
        View your overall performance metrics across all channels and videos.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData
                ? formatNumber(analyticsData.channelStats.viewCount)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              From your YouTube channel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData
                ? formatNumber(analyticsData.channelStats.subscriberCount)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total YouTube subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData
                ? formatNumber(analyticsData.channelStats.videoCount)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total videos published
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Best Posting Times</CardTitle>
          <CardDescription>
            Recommended times to post based on your audience engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium mb-3">Best Days to Post</h3>
                <div className="space-y-2">
                  {analyticsData.bestPostingTimes.days.map((day, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted/20 rounded-md"
                    >
                      <span>{day.dayName}</span>
                      <span className="text-sm font-medium">
                        {day.avgViews ? formatNumber(day.avgViews) : "0"} avg.
                        views
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Best Hours to Post</h3>
                <div className="space-y-2">
                  {analyticsData.bestPostingTimes.hours.map((hour, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted/20 rounded-md"
                    >
                      <span>{hour.hourFormatted}</span>
                      <span className="text-sm font-medium">
                        High engagement
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Source</CardTitle>
          <CardDescription>Information about the data source</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData ? (
            <div className="space-y-2">
              <p>
                <strong>Videos Analyzed:</strong>{" "}
                {analyticsData.videoAnalysis.videosAnalyzed}
              </p>
              <p>
                <strong>Date Range:</strong>{" "}
                {formatDate(analyticsData.videoAnalysis.dateRange.start)} to{" "}
                {formatDate(analyticsData.videoAnalysis.dateRange.end)}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {analyticsData.videoAnalysis.description}
              </p>
            </div>
          ) : (
            <div className="h-[100px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
