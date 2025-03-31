"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

// Sample chart config for the new design
const sampleChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export interface AreaChartProps {
  data: Array<Record<string, number | string | Date>>;
  areas?: Array<{
    dataKey: string;
    stroke?: string;
    fill?: string;
    name?: string;
    fillOpacity?: number;
    type?:
      | "monotone"
      | "linear"
      | "step"
      | "stepBefore"
      | "stepAfter"
      | "basis"
      | "basisOpen"
      | "basisClosed"
      | "natural";
    strokeWidth?: number;
    dot?: boolean | object;
    activeDot?: boolean | object;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?:
      | "linear"
      | "ease"
      | "ease-in"
      | "ease-out"
      | "ease-in-out";
    stackId?: string;
  }>;
  xAxisDataKey?: string;
  dataKey?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  gridClassName?: string;
  trendingValue?: string;
  footerText?: string;
}

export function AreaChart({
  data,
  areas,
  xAxisDataKey = "month",
  dataKey = "desktop",
  title,
  description,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className = "",
  trendingValue,
  footerText,
}: AreaChartProps) {
  // Create chart config for the chart
  const chartConfig: ChartConfig = React.useMemo(() => {
    if (!areas || areas.length === 0) {
      return sampleChartConfig;
    }

    return areas.reduce((config, area, index) => {
      config[area.dataKey] = {
        label: area.name || area.dataKey,
        color: area.stroke || `hsl(var(--chart-${index + 1}))`,
      };
      return config;
    }, {} as ChartConfig);
  }, [areas]);

  // Chart content
  const content = (
    <ChartContainer config={chartConfig} style={{ height }}>
      <RechartsAreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        {showGrid && <CartesianGrid vertical={false} />}
        <XAxis
          dataKey={xAxisDataKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) =>
            typeof value === "string" ? value.slice(0, 3) : value
          }
        />
        {showTooltip && (
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        )}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {areas && areas.length > 0 ? (
          areas.map((area) => (
            <Area
              key={area.dataKey}
              dataKey={area.dataKey}
              type={area.type || "natural"}
              fill={area.fill || `var(--color-${area.dataKey})`}
              fillOpacity={area.fillOpacity || 0.4}
              stroke={area.stroke || `var(--color-${area.dataKey})`}
            />
          ))
        ) : (
          <Area
            dataKey={dataKey}
            type="natural"
            fill={`var(--color-${dataKey})`}
            fillOpacity={0.4}
            stroke={`var(--color-${dataKey})`}
          />
        )}
      </RechartsAreaChart>
    </ChartContainer>
  );

  // Return the chart content with or without Card wrapper
  if (title || description || trendingValue || footerText) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
        {(trendingValue || footerText) && (
          <CardFooter className="flex-col items-start gap-2 text-sm">
            {trendingValue && (
              <div className="flex items-center gap-2 font-medium leading-none">
                {trendingValue} <TrendingUp className="h-4 w-4" />
              </div>
            )}
            {footerText && (
              <div className="leading-none text-muted-foreground">
                {footerText}
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    );
  }

  return content;
}
