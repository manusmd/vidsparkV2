import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/BarChart";

interface AudienceInteractionChartProps {
  data?: {
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    engagementRate?: number;
  };
}

export function AudienceInteractionChart({ data }: AudienceInteractionChartProps) {
  // Generate sample data if no data is provided
  const chartData = React.useMemo(() => {
    const defaultData = {
      likes: 1200,
      comments: 452,
      shares: 286,
      saves: 218,
      engagementRate: 8.7,
    };

    const interactionData = data || defaultData;

    return [
      { type: "Likes", count: interactionData.likes || 0 },
      { type: "Comments", count: interactionData.comments || 0 },
      { type: "Shares", count: interactionData.shares || 0 },
      { type: "Saves", count: interactionData.saves || 0 },
    ];
  }, [data]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Interaction</CardTitle>
        <CardDescription>
          How viewers engage with your content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <BarChart
            data={chartData}
            xAxisDataKey="type"
            bars={[
              {
                dataKey: "count",
                name: "Count",
                fill: "var(--primary)",
              },
            ]}
            height={250}
            showGrid={true}
            showTooltip={true}
            showLegend={false}
          />

          <div className="absolute top-2 right-2 bg-muted/20 p-2 rounded-md">
            <div className="text-xs text-muted-foreground">Engagement Rate</div>
            <div className="text-sm font-medium">{data?.engagementRate || 8.7}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
