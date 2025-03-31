import React from "react";
import { AreaChart } from "@/components/charts/AreaChart";

interface ChannelGrowthChartProps {
  data?: Array<{
    date: string;
    views: number;
    subscribers: number;
  }>;
}

export function ChannelGrowthChart({ data }: ChannelGrowthChartProps) {
  // Generate data with real dates
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) {
      // Convert day names to real dates
      const dayToIndex: { [key: string]: number } = {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6
      };

      // Sort data by day of week
      const sortedData = [...data].sort((a, b) => {
        const dayIndexA = dayToIndex[a.date] ?? 0;
        const dayIndexB = dayToIndex[b.date] ?? 0;
        return dayIndexA - dayIndexB;
      });

      // Get the current date and find the most recent Sunday
      const today = new Date();
      const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mostRecentSunday = new Date(today);
      mostRecentSunday.setDate(today.getDate() - currentDayOfWeek);

      // Create data with real dates
      return sortedData.map(item => {
        const dayIndex = dayToIndex[item.date] ?? 0;
        const itemDate = new Date(mostRecentSunday);
        itemDate.setDate(mostRecentSunday.getDate() + dayIndex);

        return {
          ...item,
          date: itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDate: itemDate // Store the actual Date object for sorting
        };
      });
    }

    // Generate 7 days of sample data
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));

      // Create a simulated growth curve
      const viewsBase = 1000;
      const subsBase = 100;
      const viewsGrowth = 1.1 + (i * 0.05);
      const subsGrowth = 1.05 + (i * 0.02);

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rawDate: date, // Store the actual Date object for sorting
        views: Math.round(viewsBase * Math.pow(viewsGrowth, i)),
        subscribers: Math.round(subsBase * Math.pow(subsGrowth, i)),
      };
    });
  }, [data]);

  return (
    <AreaChart
      data={chartData}
      xAxisDataKey="date"
      areas={[
        {
          dataKey: "views",
          name: "Views",
          stroke: "var(--primary)",
          fill: "var(--primary)",
          fillOpacity: 0.2,
          stackId: "1",
        },
        {
          dataKey: "subscribers",
          name: "Subscribers",
          stroke: "var(--secondary)",
          fill: "var(--secondary)",
          fillOpacity: 0.2,
          stackId: "2",
        },
      ]}
      height={250}
      showGrid={true}
      showTooltip={true}
      showLegend={true}
      title="Channel Growth"
      description="View your channel growth over time (subscribers estimated)"
    />
  );
}
