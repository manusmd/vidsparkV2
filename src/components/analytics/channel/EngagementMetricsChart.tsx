import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";

interface EngagementMetricsChartProps {
  data?: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
}

export function EngagementMetricsChart({ data }: EngagementMetricsChartProps) {
  // Generate sample data if no data is provided
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) return data;

    // Generate 10 days of sample data
    return Array.from({ length: 10 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (9 - i));
      
      // Create a simulated engagement curve with some randomness
      const likesBase = 100;
      const commentsBase = 20;
      const sharesBase = 10;
      const growthFactor = 1.1 + (i * 0.02);
      const randomFactor = () => 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        likes: Math.round(likesBase * Math.pow(growthFactor, i) * randomFactor()),
        comments: Math.round(commentsBase * Math.pow(growthFactor, i) * randomFactor()),
        shares: Math.round(sharesBase * Math.pow(growthFactor, i) * randomFactor()),
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
        <CardDescription>
          How viewers interact with your content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          xAxisDataKey="date"
          lines={[
            {
              dataKey: "likes",
              name: "Likes",
              stroke: "var(--chart-1)",
              dot: true,
            },
            {
              dataKey: "comments",
              name: "Comments",
              stroke: "var(--chart-2)",
              dot: true,
            },
            {
              dataKey: "shares",
              name: "Shares",
              stroke: "var(--chart-3)",
              dot: true,
            },
          ]}
          height={300}
          showGrid={true}
          showTooltip={true}
          showLegend={true}
        />
      </CardContent>
    </Card>
  );
}