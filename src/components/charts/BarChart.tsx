import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export interface BarChartProps {
  data: Array<Record<string, number | string | Date>>;
  bars: Array<{
    dataKey: string;
    fill?: string;
    name?: string;
    stackId?: string;
    fillOpacity?: number;
    radius?: number | [number, number, number, number];
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
  layout?: "horizontal" | "vertical";
  className?: string;
  gridClassName?: string;
  colorByValue?: boolean;
  maxBarSize?: number;
}

export function BarChart({
  data,
  bars,
  xAxisDataKey,
  yAxisLabel,
  xAxisLabel,
  title,
  description,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  layout = "vertical",
  className = "",
  gridClassName = "",
  colorByValue = false,
  maxBarSize = 50,
}: BarChartProps) {
  // Create chart config from bars
  const chartConfig: ChartConfig = React.useMemo(() => {
    if (!bars || bars.length === 0) return {};

    return bars.reduce((config, bar, index) => {
      config[bar.dataKey] = {
        label: bar.name || bar.dataKey,
        color: bar.fill || `var(--chart-bar-color-${(index % 5) + 1})`,
      };
      return config;
    }, {} as ChartConfig);
  }, [bars]);

  const content = (
    <ChartContainer config={chartConfig} style={{ height }}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
        barSize={maxBarSize}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className={gridClassName} stroke="var(--chart-grid)" />}
        <XAxis 
          dataKey={layout === "horizontal" ? xAxisDataKey : undefined}
          type={layout === "horizontal" ? "category" : "number"}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined} 
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="var(--chart-axis-line)"
          tick={{ fill: "var(--chart-axis-text)" }}
        />
        <YAxis 
          dataKey={layout === "vertical" ? xAxisDataKey : undefined}
          type={layout === "vertical" ? "category" : "number"}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} 
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="var(--chart-axis-line)"
          tick={{ fill: "var(--chart-axis-text)" }}
        />
        {showTooltip && <ChartTooltip cursor={false} content={<ChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}

        {bars.map((bar, barIndex) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill || `var(--chart-bar-color-${(barIndex % 5) + 1})`}
            name={bar.name || bar.dataKey}
            stackId={bar.stackId}
            fillOpacity={bar.fillOpacity || 1}
            radius={bar.radius || 0}
            isAnimationActive={bar.isAnimationActive}
            animationDuration={bar.animationDuration}
            animationEasing={bar.animationEasing}
          >
            {colorByValue && data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={typeof entry[bar.dataKey] === 'number' 
                  ? `hsl(${Math.min(entry[bar.dataKey] as number * 0.5, 120)}, 70%, 50%)`
                  : bar.fill || `var(--chart-bar-color-${(barIndex % 5) + 1})`
                } 
              />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );

  if (title || description) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return content;
}
