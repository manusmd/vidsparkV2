import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

interface RevenueProps {
  analyticsData: AnalyticsResponse | null;
  formatNumber: (num: number) => string;
}

export function Revenue({ analyticsData, formatNumber }: RevenueProps) {
  // Calculate estimated revenue based on views and CPM
  const estimatedRevenue = analyticsData?.channelStats.viewCount 
    ? (analyticsData.channelStats.viewCount * 0.001) // Assuming $1 CPM
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your channel&apos;s monetization metrics</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <DollarSign className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">Estimated Monthly Revenue</p>
              <p className="text-sm text-muted-foreground">Based on current views and CPM</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${formatNumber(estimatedRevenue)}</p>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">Views</p>
              <p className="text-sm text-muted-foreground">Total views this month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatNumber(analyticsData?.channelStats.viewCount || 0)}</p>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 