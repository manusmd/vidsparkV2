"use client";

import { 
  LineChart
} from "@/components/ui/charts/chart";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Video } from "@/app/types";
import { getFriendlyStatus } from "@/lib/getFriendlyStatus";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { StatusPieChart } from "./StatusPieChart.component";

interface ChartsSectionProps {
  videos: Video[];
  formatNumber: (num: number) => string;
}

// Define interface for day data
interface DayData {
  day: number;
  count: number;
}

// Define interface for week data
interface WeekData {
  name: string;
  fullDate: string;
  value: number;
  days: DayData[];
}

export const ChartsSection = ({ videos, formatNumber }: ChartsSectionProps) => {
  // Generate data grouped by weeks for the current month
  const generateMonthlyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Create data structure for weeks
    const weeksData: WeekData[] = [
      { name: 'Week 1', fullDate: 'Week 1', value: 0, days: [] },
      { name: 'Week 2', fullDate: 'Week 2', value: 0, days: [] },
      { name: 'Week 3', fullDate: 'Week 3', value: 0, days: [] },
      { name: 'Week 4', fullDate: 'Week 4', value: 0, days: [] },
      { name: 'Week 5', fullDate: 'Week 5', value: 0, days: [] }
    ];
    
    // Get days in current month (up to today)
    const daysInMonth = now.getDate();
    
    // Process each day of the month and assign to appropriate week
    for (let day = 1; day <= daysInMonth; day++) {
      // Determine which week this day belongs to (0-indexed)
      // Week 1: days 1-7, Week 2: days 8-14, etc.
      const weekIndex = Math.floor((day - 1) / 7);
      
      // Filter videos created on this day
      const videosOnDay = videos.filter(video => {
        const createdAt = video.createdAt as Date;
        return createdAt && 
               createdAt.getDate() === day && 
               createdAt.getMonth() === currentMonth &&
               createdAt.getFullYear() === currentYear;
      });
      
      // Add this day's videos to the week's total
      if (weekIndex < weeksData.length) {
        weeksData[weekIndex].value += videosOnDay.length;
        weeksData[weekIndex].days.push({
          day,
          count: videosOnDay.length
        });
      }
    }
    
    // Generate better tooltips with date ranges
    weeksData.forEach((week) => {
      if (week.days.length > 0) {
        const firstDay = week.days[0].day;
        const lastDay = week.days[week.days.length - 1].day;
        const monthName = format(new Date(currentYear, currentMonth, 1), 'MMM');
        week.fullDate = `${monthName} ${firstDay}-${lastDay}`;
      }
    });
    
    // Only include weeks that have days (remove empty weeks at end of month)
    return weeksData.filter(week => week.days.length > 0);
  };

  // Generate data for videos by status using real data and full range of statuses
  const generateVideosByStatus = () => {
    // Group videos by status
    const statusGroups: Record<string, number> = {};
    
    videos.forEach(video => {
      // Use the full status from the video
      const status = video.status;
      
      // If this status hasn't been seen before, initialize it
      if (!statusGroups[status]) {
        statusGroups[status] = 0;
      }
      
      // Increment the count for this status
      statusGroups[status]++;
    });
    
    // Calculate total for percentages
    const total = Object.values(statusGroups).reduce((sum, count) => sum + count, 0);
    
    // Convert to the data format needed for the chart
    // Apply getFriendlyStatus to make labels user-friendly
    const statusColors = {
      draft: "#60a5fa", // Blue
      "processing:assets": "#f59e0b", // Amber
      "processing:story": "#f59e0b", // Amber
      "processing:upload": "#8b5cf6", // Purple
      "processing:render": "#8b5cf6", // Purple
      "processing:video": "#8b5cf6", // Purple
      "render:complete": "#10b981", // Green
      "render:error": "#ef4444", // Red
      "assets:ready": "#10b981", // Green
      completed: "#34d399", // Emerald
      failed: "#ef4444", // Red
    };
    
    const statusData = Object.entries(statusGroups)
      .map(([status, count]) => {
        const percentage = Math.round((count / total) * 100);
        return {
          name: getFriendlyStatus(status), // Convert to user-friendly name
          displayName: `${getFriendlyStatus(status)} ${percentage}%`,
          value: count,
          percentage,
          color: statusColors[status as keyof typeof statusColors] || "#9ca3af", // Default gray if status not found
          originalStatus: status // Keep original for reference
        };
      })
      // Sort by count in descending order
      .sort((a, b) => b.value - a.value);
    
    return statusData;
  };

  const monthlyData = generateMonthlyData();
  const videosByStatus = generateVideosByStatus();

  // Return empty view if there's no video data
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-primary"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Performance Insights
          </h2>
        </div>
        
        <div className="mt-3 md:mt-0">
          <Badge variant="outline" className="text-xs font-normal px-2.5 py-1 bg-white/5 border-white/10 text-foreground/70">
            Last 30 days
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:bg-card/60">
          {/* Subtle top highlight */}
          <div className="h-0.5 w-full bg-gradient-to-r from-blue-500/50 via-blue-400/50 to-transparent"></div>
          
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Video Creation Trend</CardTitle>
                <CardDescription className="text-muted-foreground/70">Videos created by week this month</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            <div className="relative h-[270px] w-full">
              {/* Subtle grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
              <div className="relative h-full">
                <LineChart 
                  data={monthlyData.map(item => ({
                    name: item.name,
                    value: item.value,
                    fullDate: item.fullDate
                  }))} 
                  category="Videos"
                  showGrid
                  color="#60a5fa"
                  valueFormatter={formatNumber}
                  tooltipFormatter={(item) => String(item.fullDate)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:bg-card/60">
          {/* Subtle top highlight */}
          <div className="h-0.5 w-full bg-gradient-to-r from-green-500/50 via-green-400/50 to-transparent"></div>
          
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-green-500/10 border border-green-500/20">
                <PieChartIcon className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Videos by Status</CardTitle>
                <CardDescription className="text-muted-foreground/70">Distribution of your videos by current status</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            <div className="relative h-[270px] w-full">
              {/* Subtle grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
              <div className="relative h-full flex flex-col">
                <StatusPieChart data={videosByStatus} className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 