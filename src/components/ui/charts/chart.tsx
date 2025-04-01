"use client";

import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  Rectangle,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

interface ChartProps {
  className?: string;
}

interface ChartContainerProps extends ChartProps {
  children: React.ReactElement;
}

export function ChartContainer({
  className,
  children,
}: ChartContainerProps) {
  return (
    <div className={cn("w-full h-80 px-1", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export interface BarChartProps extends ChartProps {
  data: {
    name: string;
    value: number;
    [key: string]: any;
  }[];
  colors?: string[];
  category?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
  layout?: "vertical" | "horizontal";
}

export function BarChart({
  className,
  data,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd"],
  category,
  showGrid = false,
  showTooltip = true,
  valueFormatter = (value: number) => value.toString(),
  layout = "vertical",
}: BarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const isHorizontal = layout === "horizontal";

  // Custom label content that has access to data
  const CustomizedLabel = (props: any) => {
    const { x, y, width, height, index } = props;
    const item = data[index];
    
    if (!item || width < 30) return null;
    
    return (
      <text
        x={x + width - 10}
        y={y + height / 2}
        fill="#FFFFFF"
        fontSize={13}
        fontWeight={600}
        textAnchor="end"
        dominantBaseline="middle"
      >
        {item.name}
      </text>
    );
  };

  return (
    <ChartContainer className={className}>
      <RechartsBarChart 
        data={data}
        onMouseMove={(e) => {
          if (e.activeTooltipIndex !== undefined) {
            setActiveIndex(e.activeTooltipIndex);
          }
        }}
        onMouseLeave={() => setActiveIndex(null)}
        layout={layout}
        margin={isHorizontal ? { left: 150, right: 40, top: 15, bottom: 15 } : undefined}
      >
        <defs>
          {data.map((entry, index) => {
            // Use color from data entry if provided, or fallback to colors prop
            const startColor = entry.color || colors[0];
            const endColor = entry.endColor || colors[1] || startColor;
            
            return (
              <linearGradient
                key={`gradient-${index}`}
                id={`barGradient-${index}`}
                x1={isHorizontal ? "0" : "0"}
                y1={isHorizontal ? "0" : "0"}
                x2={isHorizontal ? "1" : "0"}
                y2={isHorizontal ? "0" : "1"}
              >
                <stop
                  offset="0%"
                  stopColor={startColor}
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor={endColor}
                  stopOpacity={0.8}
                />
              </linearGradient>
            );
          })}
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={!isHorizontal}
            horizontal={true}
            stroke="var(--chart-grid)"
          />
        )}
        {isHorizontal ? (
          <>
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={{ 
                fill: "var(--chart-axis-text)", 
                fontSize: 13,
                textAnchor: "end",
                fontWeight: 500,
                letterSpacing: 0.2,
              }}
              tickLine={false}
              axisLine={{ stroke: "var(--chart-axis-line)" }}
              stroke="var(--chart-axis-line)"
              tickMargin={12}
            />
            <XAxis
              type="number"
              tick={{ fill: "var(--chart-axis-text)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              stroke="var(--chart-axis-line)"
              tickFormatter={valueFormatter}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--chart-axis-text)", fontSize: 12 }}
              axisLine={{ stroke: "var(--chart-axis-line)" }}
              tickLine={false}
              stroke="var(--chart-axis-line)"
              tickMargin={8}
            />
            <YAxis
              tick={{ fill: "var(--chart-axis-text)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              stroke="var(--chart-axis-line)"
              width={40}
              tickFormatter={valueFormatter}
            />
          </>
        )}
        {showTooltip && (
          <Tooltip
            wrapperStyle={{ outline: 'none' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            position={{ y: 0 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const entry = payload[0].payload;
                const barColor = entry.color || colors[0];
                const endColor = entry.endColor || colors[1] || barColor;
                
                return (
                  <div className="rounded-lg border border-white/10 bg-background/95 backdrop-blur-sm p-3 shadow-xl text-sm"
                       style={{
                         backgroundColor: "var(--chart-tooltip-bg)",
                         borderColor: "var(--chart-tooltip-border)"
                       }}>
                    <div className="font-bold mb-1 text-white">
                      {entry.name}
                    </div>
                    <div className="flex items-center">
                      <div
                        className="h-3 w-3 rounded-full mr-2"
                        style={{
                          background: `linear-gradient(to ${isHorizontal ? 'right' : 'bottom'}, ${barColor}, ${endColor})`,
                        }}
                      />
                      <span className="text-white/70">
                        {category ? `${category}: ` : ""}
                      </span>
                      <span className="ml-1 font-medium text-white">
                        {valueFormatter(payload[0].value as number)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        <Bar
          dataKey="value"
          radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          className="transition-all duration-200"
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-in-out"
          // @ts-ignore Type issues with recharts label prop
          label={isHorizontal ? CustomizedLabel : false}
        >
          {data.map((entry, index) => {
            const barColor = entry.color || colors[0];
            
            return (
              <Cell 
                key={`cell-${index}`} 
                className="focus:outline-none" 
                fill={`url(#barGradient-${index})`}
                style={{
                  filter: activeIndex === index ? 'brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none',
                  transition: 'filter 0.3s ease-in-out',
                  opacity: activeIndex !== null && activeIndex !== index ? 0.7 : 1,
                  stroke: activeIndex === index ? barColor : 'transparent',
                  strokeWidth: 1
                }}
              />
            );
          })}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}

export interface LineChartProps extends ChartProps {
  data: {
    name: string;
    value: number;
    [key: string]: any;
  }[];
  category?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  color?: string;
  strokeWidth?: number;
  valueFormatter?: (value: number) => string;
  tooltipFormatter?: (item: any) => string;
}

export function LineChart({
  className,
  data,
  category,
  showGrid = false,
  showTooltip = true,
  color = "#3b82f6",
  strokeWidth = 3,
  valueFormatter = (value: number) => value.toString(),
  tooltipFormatter,
}: LineChartProps) {
  // Find the maximum value to determine Y-axis scale
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  // Calculate appropriate integer ticks based on data
  const getIntegerTicks = () => {
    // For small numbers, use simple integers
    if (maxValue <= 5) {
      return Array.from({ length: maxValue + 1 }, (_, i) => i);
    }
    
    // For larger values, calculate appropriate step size
    const step = maxValue <= 10 ? 1 : Math.ceil(maxValue / 5);
    const tickCount = Math.min(6, maxValue);
    
    return Array.from(
      { length: tickCount }, 
      (_, i) => Math.round(i * step)
    ).filter(val => val <= maxValue);
  };
  
  const yAxisTicks = getIntegerTicks();

  return (
    <ChartContainer className={className}>
      <RechartsLineChart data={data}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--chart-axis-line)"
          />
        )}
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--chart-axis-text)", fontSize: 12 }}
          axisLine={{ stroke: "var(--chart-axis-line)" }}
          tickLine={false}
          stroke="var(--chart-axis-line)"
          dy={10}
        />
        <YAxis
          tick={{ fill: "var(--chart-axis-text)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          stroke="var(--chart-axis-line)"
          width={40}
          tickFormatter={(value) => Math.round(value).toString()}
          allowDecimals={false}
          domain={[0, 'dataMax + 1']}
          ticks={yAxisTicks}
        />
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border border-white/10 bg-background/95 backdrop-blur p-2 shadow-md text-sm">
                    <div className="font-semibold text-foreground">
                      {tooltipFormatter ? tooltipFormatter(item) : item.name}
                    </div>
                    <div className="flex items-center">
                      <div
                        className="h-2 w-2 rounded-full mr-1"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted-foreground">
                        {category ? `${category}: ` : ""}
                      </span>
                      <span className="ml-1 font-medium">
                        {valueFormatter(payload[0].value as number)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={strokeWidth}
          dot={{ stroke: color, strokeWidth: 2, fill: "rgba(0, 0, 0, 0.8)", r: 4 }}
          activeDot={{
            stroke: color,
            strokeWidth: 2,
            fill: "rgba(0, 0, 0, 0.8)",
            r: 6,
          }}
          className="hover:opacity-80"
        />
      </RechartsLineChart>
    </ChartContainer>
  );
}

const RADIAN = Math.PI / 180;
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
    name,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 40) * cos;
  const my = cy + (outerRadius + 40) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 25;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-lg"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="rgba(255, 255, 255, 0.8)"
        fontSize={12}
        dominantBaseline="middle"
      >{`${name}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="rgba(255, 255, 255, 0.6)"
        fontSize={11}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

export interface PieChartProps extends ChartProps {
  data: {
    name: string;
    value: number;
    [key: string]: any;
  }[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  interactive?: boolean;
}

export function PieChart({
  className,
  data,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#f472b6", "#fb7185"],
  valueFormatter = (value: number) => value.toString(),
  interactive = true,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    if (interactive) {
      setActiveIndex(index);
    }
  };

  return (
    <ChartContainer className={className}>
      <RechartsPieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <Pie
          activeIndex={interactive ? activeIndex : undefined}
          activeShape={interactive ? renderActiveShape : undefined}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={75}
          dataKey="value"
          onMouseEnter={onPieEnter}
          strokeWidth={2}
          stroke="var(--chart-axis-line)"
          className="focus:outline-none drop-shadow-md"
          label={false}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              className="focus:outline-none hover:opacity-80 transition-opacity"
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length && !interactive) {
              return (
                <div className="rounded-lg border border-white/10 bg-background/95 backdrop-blur p-2 shadow-md text-sm">
                  <div className="font-semibold text-foreground">
                    {payload[0].name}
                  </div>
                  <div className="flex items-center">
                    <div
                      className="h-2 w-2 rounded-full mr-1"
                      style={{
                        backgroundColor: payload[0].color,
                      }}
                    />
                    <span className="text-muted-foreground">Value: </span>
                    <span className="ml-1 font-medium">
                      {valueFormatter(payload[0].value as number)}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
      </RechartsPieChart>
    </ChartContainer>
  );
} 