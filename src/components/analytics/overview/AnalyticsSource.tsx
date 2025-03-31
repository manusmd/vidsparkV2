import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsSourceProps {
  videoAnalysis: {
    videosAnalyzed: number;
    dateRange: {
      start: string;
      end: string;
    };
    description: string;
  };
}

export function AnalyticsSource({ videoAnalysis }: AnalyticsSourceProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Source</CardTitle>
        <CardDescription>Information about the data source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Videos Analyzed:</strong> {videoAnalysis.videosAnalyzed}
          </p>
          <p>
            <strong>Date Range:</strong>{" "}
            {formatDate(videoAnalysis.dateRange.start)} to{" "}
            {formatDate(videoAnalysis.dateRange.end)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {videoAnalysis.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}