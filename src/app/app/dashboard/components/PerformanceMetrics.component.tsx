import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Upload, TrendingUp, PlayCircle } from "lucide-react";
import { VidSparkStats } from "@/types/vidspark";

interface PerformanceMetricsProps {
  stats: VidSparkStats;
  formatNumber: (num: number) => string;
}

export function PerformanceMetrics({ stats, formatNumber }: PerformanceMetricsProps) {
  const metrics = [
    {
      title: "Videos Created",
      value: stats?.totalVideosCreated,
      icon: Video,
      description: "Total videos created with VidSpark"
    },
    {
      title: "Active Videos",
      value: stats?.activeVideos || 0,
      icon: PlayCircle,
      description: "Videos currently active"
    },
    {
      title: "Videos Uploaded",
      value: stats?.videosUploaded,
      icon: Upload,
      description: "Videos uploaded to YouTube"
    },
    {
      title: "Avg. Performance",
      value: stats?.averagePerformance?.views,
      icon: TrendingUp,
      description: "Average views per uploaded video"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metric.value)}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 