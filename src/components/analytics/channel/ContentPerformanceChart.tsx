import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/BarChart";

interface ContentPerformanceChartProps {
  data?: Array<{
    category: string;
    views: number;
    engagement: number;
  }>;
}

export function ContentPerformanceChart({ data }: ContentPerformanceChartProps) {
  // Generate sample data if no data is provided
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) return data;

    // Sample content performance data
    return [
      { category: "Tutorials", views: 75, engagement: 45 },
      { category: "Reviews", views: 60, engagement: 35 },
      { category: "Vlogs", views: 40, engagement: 25 },
      { category: "Gaming", views: 85, engagement: 55 },
      { category: "Educational", views: 65, engagement: 50 },
    ];
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Performance by Category</CardTitle>
        <CardDescription>
          See which types of content perform best
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart
          data={chartData}
          xAxisDataKey="category"
          bars={[
            {
              dataKey: "views",
              name: "Views",
              fill: "var(--primary)",
            },
            {
              dataKey: "engagement",
              name: "Engagement",
              fill: "var(--secondary)",
            },
          ]}
          height={300}
          layout="vertical"
          showGrid={true}
          showTooltip={true}
          showLegend={true}
        />
      </CardContent>
    </Card>
  );
}