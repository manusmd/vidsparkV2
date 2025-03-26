"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, Film } from "lucide-react";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

interface RecentActivityProps {
  analyticsData: AnalyticsResponse | null;
  formatNumber: (num: number) => string;
}

export function RecentActivity({ analyticsData, formatNumber }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest content and performance updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analyticsData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-medium">Channel Statistics</p>
                  <p className="text-sm text-muted-foreground">
                    {analyticsData.channelStats ? `${analyticsData.channelStats.videoCount} videos with ${formatNumber(analyticsData.channelStats.viewCount)} total views` : 'No video data available'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Current data</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Subscriber Count</p>
                  <p className="text-sm text-muted-foreground">
                    {analyticsData.channelStats ? `You have ${formatNumber(analyticsData.channelStats.subscriberCount)} subscribers` : 'No subscriber data available'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Current data</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
              <div className="flex items-center gap-3">
                <BarChart className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Analytics Period</p>
                  <p className="text-sm text-muted-foreground">
                    {analyticsData.videoAnalysis && analyticsData.videoAnalysis.dateRange ? `Data from ${analyticsData.videoAnalysis.dateRange.start} to ${analyticsData.videoAnalysis.dateRange.end}` : 'No date range data available'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Date range</p>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
            <p className="text-muted-foreground">No activity data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;