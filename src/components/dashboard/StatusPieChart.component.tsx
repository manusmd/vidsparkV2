"use client";

import React, { useState } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Sector } from "recharts";
import { cn } from "@/lib/utils";

interface StatusData {
  name: string;
  displayName: string;
  value: number;
  percentage: number;
  color: string;
  originalStatus: string;
}

interface StatusPieChartProps {
  data: StatusData[];
  className?: string;
}

// Custom active shape for better interactive display
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      {/* Only keep the highlight effects, remove text */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        strokeWidth={1}
        stroke={fill}
        opacity={0.9}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={innerRadius - 1}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        strokeWidth={0}
      />
    </g>
  );
};

export function StatusPieChart({ data, className }: StatusPieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMouseEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className={cn("w-full h-full", className)}>
      <RechartsPieChart width={300} height={250} className="mx-auto">
        {/* Inner circle background for better contrast */}
        <circle cx="50%" cy="50%" r="58" fill="rgba(0,0,0,0.2)" />
        
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          onMouseEnter={handleMouseEnter}
          stroke="none"
          isAnimationActive={true}
          animationDuration={800}
          label={(labelProps) => {
            const { cx, cy, midAngle, outerRadius, name, index } = labelProps;
            const radius = outerRadius + 15;
            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
            
            return (
              <text 
                x={x} 
                y={y} 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fill="white"
                opacity={0.85}
                fontSize={11}
                fontWeight={index === activeIndex ? 'bold' : 'normal'}
              >
                {name}
              </text>
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as StatusData;
              return (
                <div className="bg-gray-800 p-2 rounded shadow-lg border border-gray-700">
                  <p className="font-medium text-white">{data.displayName}</p>
                  <p className="text-gray-300 text-sm">
                    {data.value} videos ({data.percentage.toFixed(1)}%)
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
      </RechartsPieChart>
      
      {/* Center info - simplified */}
      {data.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center z-10">
            <p className="text-xs text-white/60 -mb-1">Total</p>
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
        </div>
      )}
      
      {/* Additional Legend for clarity */}
      <div className="flex justify-center mt-2 mb-1 flex-wrap gap-x-4 gap-y-2">
        {data.map((entry) => (
          <div 
            key={entry.originalStatus}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10"
            style={{ 
              boxShadow: `0 0 8px ${entry.color}30`
            }}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium text-white/90">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 