"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, Film, Clock } from "lucide-react";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

interface StatsCardsProps {
  analyticsData: AnalyticsResponse | null;
  formatNumber: (num: number) => string;
}

export function StatsCards({ analyticsData, formatNumber }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
          <Film className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData && analyticsData.channelStats ? formatNumber(analyticsData.channelStats.videoCount) : '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            From your YouTube channel
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData && analyticsData.channelStats ? formatNumber(analyticsData.channelStats.viewCount) : '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            From your YouTube channel
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData && analyticsData.channelStats ? formatNumber(analyticsData.channelStats.subscriberCount) : '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Total YouTube subscribers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Best Posting Day</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData && analyticsData.bestPostingTimes && analyticsData.bestPostingTimes.days && analyticsData.bestPostingTimes.days.length > 0 
              ? analyticsData.bestPostingTimes.days[0].dayName 
              : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on your analytics
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsCards;