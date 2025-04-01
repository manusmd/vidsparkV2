"use client"

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export interface PieChartProps {
  data: Array<Record<string, string | number | undefined>>;
  title?: string;
  description?: string;
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  paddingAngle?: number;
  dataKey?: string;
  nameKey?: string;
  activeIndex?: number;
  activeShape?: React.ReactElement | ((props: PieActiveShapeProps) => React.ReactElement);
  labelLine?: boolean;
  label?: boolean | React.ReactElement | ((props: PieActiveShapeProps) => React.ReactElement);
  startAngle?: number;
  endAngle?: number;
  cx?: number | string;
  cy?: number | string;
  trendingValue?: string;
  footerText?: string;
}

export interface PieActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: {
    name: string;
    value: number;
    [key: string]: unknown;
  };
  percent: number;
  value: number;
  [key: string]: unknown;
}

export function PieChart({
  data,
  title,
  description,
  showTooltip = true,
  showLegend = false,
  className = "",
  innerRadius = 60,
  outerRadius = "80%",
  paddingAngle = 0,
  dataKey = "visitors",
  nameKey = "browser",
  activeIndex = 0,
  labelLine = true,
  label = true,
  startAngle = 0,
  endAngle = 360,
  cx = "50%",
  cy = "50%",
  trendingValue,
  footerText,
}: PieChartProps) {
  const [activeIdx, setActiveIdx] = React.useState<number | undefined>(
    activeIndex
  );

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIdx(index);
  };

  // Create chart config from data
  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      [dataKey]: {
        label: dataKey,
        color: "var(--chart-bar-color-1)",
      },
    };

    data.forEach((item, index) => {
      config[item[nameKey] as string] = {
        label: item.label || (item[nameKey] as string),
        color: item.fill ? String(item.fill) : `var(--chart-bar-color-${(index % 5) + 1})`,
      };
    });

    return config;
  }, [data, dataKey, nameKey]);

  const content = (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <RechartsPieChart>
        {showTooltip && (
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel={false} />}
          />
        )}
        {showLegend && (
          <ChartLegend
            content={<ChartLegendContent />}
            verticalAlign="bottom"
            align="center"
          />
        )}
        <Pie
          activeIndex={activeIdx}
          activeShape={({
            outerRadius = 0,
            ...props
          }: PieSectorDataItem) => (
            <Sector {...props} outerRadius={outerRadius + 10} />
          )}
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          dataKey={dataKey}
          nameKey={nameKey}
          labelLine={labelLine}
          label={typeof label === 'boolean' ? label : undefined}
          startAngle={startAngle}
          endAngle={endAngle}
          onMouseEnter={onPieEnter}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill ? String(entry.fill) : `var(--chart-bar-color-${(index % 5) + 1})`}
            />
          ))}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );

  if (title || description || trendingValue || footerText) {
    return (
      <Card className={`flex flex-col ${className}`}>
        {(title || description) && (
          <CardHeader className="items-center pb-0">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="flex-1 pb-0">
          {content}
        </CardContent>
        {(trendingValue || footerText) && (
          <CardFooter className="flex-col gap-2 text-sm">
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
