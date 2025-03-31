import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";

interface ViewerRetentionChartProps {
  data?: Array<{
    position: string;
    retention: number;
  }>;
}

export function ViewerRetentionChart({ data }: ViewerRetentionChartProps) {
  // Generate sample data if no data is provided
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) return data;

    // Sample retention data
    return Array.from({ length: 10 }).map((_, i) => {
      const position = `${i * 10}%`;
      // Create a simulated retention curve that drops off over time
      const retention = Math.max(0, 100 - (i * 5) - (i * i * 0.5));
      
      return {
        position,
        retention,
      };
    });
  }, [data]);

  // Calculate average retention
  const averageRetention = React.useMemo(() => {
    const sum = chartData.reduce((acc, item) => acc + item.retention, 0);
    return sum / chartData.length;
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viewer Retention</CardTitle>
        <CardDescription>
          See how long viewers watch your videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          xAxisDataKey="position"
          lines={[
            {
              dataKey: "retention",
              name: "Retention",
              stroke: "var(--primary)",
              strokeWidth: 3,
              dot: { r: 3 },
              activeDot: { r: 5 },
            },
          ]}
          height={300}
          showGrid={true}
          showTooltip={true}
          showLegend={true}
          areaUnderCurve={true}
          yAxisLabel="Retention (%)"
        />

        <div className="mt-4 p-3 bg-muted/20 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Average Retention</span>
            <span className="text-sm">{averageRetention.toFixed(1)}%</span>
          </div>
          <div className="mt-2 w-full bg-muted/30 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full" 
              style={{ width: `${averageRetention}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}