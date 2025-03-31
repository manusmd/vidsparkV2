import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/charts/PieChart";

interface TrafficSourcesChartProps {
  data?: Array<{
    name: string;
    value: number;
    fill?: string;
  }>;
  totalViews?: number;
}

export function TrafficSourcesChart({ data, totalViews = 0 }: TrafficSourcesChartProps) {
  // Generate sample data if no data is provided
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) return data;

    // Sample traffic sources data
    return [
      { name: "YouTube Search", value: 35, fill: "var(--chart-1)" },
      { name: "Suggested Videos", value: 25, fill: "var(--chart-2)" },
      { name: "Channel Page", value: 15, fill: "var(--chart-3)" },
      { name: "External", value: 15, fill: "var(--chart-4)" },
      { name: "Other", value: 10, fill: "var(--chart-5)" },
    ];
  }, [data]);

  // Format total views
  const formattedViews = React.useMemo(() => {
    if (totalViews >= 1000000) {
      return (totalViews / 1000000).toFixed(1) + "M";
    } else if (totalViews >= 1000) {
      return (totalViews / 1000).toFixed(1) + "K";
    }
    return totalViews.toString();
  }, [totalViews]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>
          Where your viewers are coming from
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] relative">
          <PieChart
            data={chartData}
            height={220}
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={2}
          />
          
          <div className="absolute bottom-4 left-4">
            <div className="text-sm font-medium">Total Views</div>
            <div className="text-2xl font-bold">
              {formattedViews}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}