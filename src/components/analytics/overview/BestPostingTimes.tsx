import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/BarChart";

interface BestPostingTimesProps {
  bestPostingTimes: {
    days: Array<{
      dayName: string;
      avgViews?: number;
    }>;
    hours: Array<{
      hourFormatted: string;
    }>;
  };
}

export function BestPostingTimes({ bestPostingTimes }: BestPostingTimesProps) {

  // Prepare data for the days chart
  const daysData = React.useMemo(() => {
    return bestPostingTimes.days.map((day) => ({
      day: day.dayName,
      views: day.avgViews || 0,
    }));
  }, [bestPostingTimes.days]);

  // Prepare data for the hours chart
  const hoursData = React.useMemo(() => {
    return bestPostingTimes.hours.map((hour, index) => ({
      hour: hour.hourFormatted,
      engagement: 100 - index * 15, // Simulated engagement score
    }));
  }, [bestPostingTimes.hours]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Posting Times</CardTitle>
        <CardDescription>
          Recommended times to post based on your audience engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium mb-3">Best Days to Post</h3>
            <BarChart
              data={daysData}
              xAxisDataKey="day"
              bars={[
                {
                  dataKey: "views",
                  name: "Average Views",
                  fill: "var(--primary)",
                }
              ]}
              height={200}
              layout="vertical"
              showLegend={false}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3">Best Hours to Post</h3>
            <BarChart
              data={hoursData}
              xAxisDataKey="hour"
              bars={[
                {
                  dataKey: "engagement",
                  name: "Engagement Score",
                  fill: "var(--primary)",
                }
              ]}
              height={200}
              layout="vertical"
              showLegend={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
