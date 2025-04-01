"use client";

import { 
  LineChart,
  BarChart 
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
      const date = new Date(currentYear, currentMonth, day);
      
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
    weeksData.forEach((week, index) => {
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
      .map(([status, count]) => ({
        name: getFriendlyStatus(status), // Convert to user-friendly name
        value: count,
        color: statusColors[status as keyof typeof statusColors] || "#9ca3af", // Default gray if status not found
        originalStatus: status // Keep original for reference
      }))
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Performance Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-md overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Video Creation Trend</CardTitle>
            <CardDescription>Videos created by week this month</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={monthlyData} 
              category="Videos"
              showGrid
              color="#60a5fa"
              valueFormatter={formatNumber}
              tooltipFormatter={(item) => item.fullDate}
            />
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-md overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Videos by Status</CardTitle>
            <CardDescription>Distribution of your videos by current status</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-80 w-full overflow-visible pl-0">
              <BarChart 
                data={videosByStatus} 
                category="Videos"
                showGrid
                colors={videosByStatus.map(status => status.color)}
                valueFormatter={(value) => `${value} video${value !== 1 ? 's' : ''}`}
                layout="horizontal"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 