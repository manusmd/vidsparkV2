"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
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

export interface LineChartProps {
  data: Array<Record<string, number | string | Date>>;
  lines: Array<{
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
    animationEasing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  }>;
  xAxisDataKey: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  areaUnderCurve?: boolean;
  className?: string;
  gridClassName?: string;
  trendingValue?: string;
  footerText?: string;
}

export function LineChart({
  data,
  lines,
  xAxisDataKey,
  title,
  description,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  areaUnderCurve = false,
  className = "",
  trendingValue,
  footerText,
}: LineChartProps) {
  // Create chart config from lines
  const chartConfig: ChartConfig = React.useMemo(() => {
    if (!lines || lines.length === 0) return sampleChartConfig;

    return lines.reduce((config, line, index) => {
      config[line.dataKey] = {
        label: line.name || line.dataKey,
        color: line.stroke || `hsl(var(--chart-${index + 1}))`,
      };
      return config;
    }, {} as ChartConfig);
  }, [lines]);

  // Chart content
  const content = (
    <ChartContainer config={chartConfig} style={{ height }}>
      <RechartsLineChart
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
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
        )}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {lines.map((line) => (
          <React.Fragment key={line.dataKey}>
            {areaUnderCurve && (
              <Area
                type={line.type || "natural"}
                dataKey={line.dataKey}
                fill={`var(--color-${line.dataKey})`}
                stroke={`var(--color-${line.dataKey})`}
                fillOpacity={line.fillOpacity || 0.2}
              />
            )}
            <Line
              dataKey={line.dataKey}
              type={line.type || "natural"}
              stroke={`var(--color-${line.dataKey})`}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot === undefined ? false : line.dot}
              activeDot={line.activeDot}
              isAnimationActive={line.isAnimationActive}
              animationDuration={line.animationDuration}
              animationEasing={line.animationEasing}
            />
          </React.Fragment>
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );

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
              <div className="flex gap-2 font-medium leading-none">
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
