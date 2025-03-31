import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceSummaryProps {
  channelStats: {
    viewCount: number;
    subscriberCount: number;
    videoCount: number;
  };
  videoAnalysis: {
    dataSource: string;
  };
}

export function PerformanceSummary({
  channelStats,
  videoAnalysis,
}: PerformanceSummaryProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
        <CardDescription>
          Key metrics from your YouTube channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-2 bg-muted/20 rounded-md">
            <span>Average Views per Video</span>
            <span className="text-sm font-medium">
              {channelStats.videoCount > 0
                ? formatNumber(
                    channelStats.viewCount /
                      channelStats.videoCount
                  )
                : "0"}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 rounded-md">
            <span>Subscribers to Views Ratio</span>
            <span className="text-sm font-medium">
              {channelStats.viewCount > 0
                ? (
                    (channelStats.subscriberCount /
                      channelStats.viewCount) *
                    100
                  ).toFixed(2) + "%"
                : "0%"}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 rounded-md">
            <span>Data Source</span>
            <span className="text-sm font-medium">
              {videoAnalysis.dataSource === "channel_videos"
                ? "Channel Videos"
                : "Analytics API"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}