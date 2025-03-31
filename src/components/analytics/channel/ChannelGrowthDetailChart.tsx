import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";

interface ChannelGrowthDetailChartProps {
  data?: Array<{
    date: string;
    views: number;
    subscribers: number;
  }>;
}

export function ChannelGrowthDetailChart({ data }: ChannelGrowthDetailChartProps) {
  // Generate sample data if no data is provided
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) return data;

    // Generate 12 days of sample data
    return Array.from({ length: 12 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (11 - i));

      // Create a simulated growth curve with some randomness
      const viewsBase = 1000;
      const subsBase = 100;
      const viewsGrowth = 1.1 + (i * 0.05);
      const subsGrowth = 1.05 + (i * 0.02);
      const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.round(viewsBase * Math.pow(viewsGrowth, i) * randomFactor),
        subscribers: Math.round(subsBase * Math.pow(subsGrowth, i) * randomFactor),
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Growth</CardTitle>
        <CardDescription>
          Subscriber (estimated) and view growth over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          xAxisDataKey="date"
          lines={[
            {
              dataKey: "views",
              name: "Views",
              stroke: "var(--primary)",
              dot: { r: 3 },
              activeDot: { r: 5 },
              strokeWidth: 2,
            },
            {
              dataKey: "subscribers",
              name: "Subscribers",
              stroke: "var(--secondary)",
              dot: { r: 3 },
              activeDot: { r: 5 },
              strokeWidth: 2,
            },
          ]}
          height={300}
          showGrid={true}
          showTooltip={true}
          showLegend={true}
          yAxisLabel="Count"
        />
      </CardContent>
    </Card>
  );
}
