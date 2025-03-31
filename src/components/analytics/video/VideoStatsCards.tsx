import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MessageSquare } from "lucide-react";

interface VideoStatsCardsProps {
  watchTime?: string;
  engagementRate?: string;
}

export function VideoStatsCards({ 
  watchTime = '0 hrs', 
  engagementRate = '0%' 
}: VideoStatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {watchTime}
          </div>
          <p className="text-xs text-muted-foreground">
            Total watch time for selected video
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {engagementRate}
          </div>
          <p className="text-xs text-muted-foreground">
            Likes and comments relative to views
          </p>
        </CardContent>
      </Card>
    </div>
  );
}