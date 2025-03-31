import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";
import { Eye } from "lucide-react";

interface ClickThroughAnalysisChartProps {
  data?: Array<{
    date: string;
    ctr: number;
  }>;
  currentCTR?: number;
  averageCTR?: number;
  thumbnailUrl?: string;
}

export function ClickThroughAnalysisChart({ 
  data,
  currentCTR = 7.8,
  averageCTR = 6.0,
  thumbnailUrl
}: ClickThroughAnalysisChartProps) {
  // Generate sample data if no data is provided
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) return data.map(item => ({
      ...item,
      averageCTR: averageCTR
    }));

    // Generate 10 days of sample data
    return Array.from({ length: 10 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (9 - i));

      // Create a simulated CTR curve with some randomness
      const baseCTR = 6.0;
      const trend = i * 0.2; // Slight upward trend
      const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
      const ctr = (baseCTR + trend) * randomFactor;

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ctr: parseFloat(ctr.toFixed(1)),
        averageCTR: averageCTR
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Click-Through Analysis</CardTitle>
        <CardDescription>
          How effective your thumbnails and titles are
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <LineChart
            data={chartData}
            xAxisDataKey="date"
            lines={[
              {
                dataKey: "ctr",
                name: "CTR",
                stroke: "var(--primary)",
                strokeWidth: 2,
                dot: true,
              },
              // Add a reference line for average CTR
              {
                dataKey: "averageCTR",
                name: `Average (${averageCTR}%)`,
                stroke: "var(--secondary)",
                strokeWidth: 2,
                strokeDasharray: "5 5",
                dot: false,
              },
            ]}
            height={250}
            showGrid={true}
            showTooltip={true}
            showLegend={true}
            areaUnderCurve={true}
            yAxisLabel="CTR (%)"
          />

          <div className="absolute top-2 left-16 bg-muted/20 p-2 rounded-md">
            <div className="text-xs text-muted-foreground">Current CTR</div>
            <div className="text-sm font-medium">{currentCTR}%</div>
          </div>

          {/* Thumbnail Preview */}
          <div className="absolute bottom-12 right-4 bg-muted/20 p-1 rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Current Thumbnail</div>
            <div className="w-24 h-14 bg-muted rounded-sm flex items-center justify-center">
              {thumbnailUrl ? (
                <img 
                  src={thumbnailUrl} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover rounded-sm"
                />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
