"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

interface BestPostingTimesProps {
  analyticsData: AnalyticsResponse | null;
  formatNumber: (num: number) => string;
}

export function BestPostingTimes({ analyticsData, formatNumber }: BestPostingTimesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Posting Times</CardTitle>
        <CardDescription>
          Recommended times to post based on your audience engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analyticsData && analyticsData.bestPostingTimes && analyticsData.bestPostingTimes.days && analyticsData.bestPostingTimes.days.length > 0 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Best Days to Post</h3>
              <div className="space-y-2">
                {analyticsData.bestPostingTimes && analyticsData.bestPostingTimes.days ? 
                  analyticsData.bestPostingTimes.days.map((day, index) => (
                    <div key={index} className="p-3 bg-muted/20 rounded-md flex justify-between">
                      <p className="font-medium">{day.dayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.avgViews ? formatNumber(day.avgViews) : '0'} avg. views
                      </p>
                    </div>
                  )) : 
                  <div className="p-3 bg-muted/20 rounded-md flex justify-between">
                    <p className="font-medium">No data available</p>
                  </div>
                }
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Best Hours to Post</h3>
              <div className="space-y-2">
                {analyticsData.bestPostingTimes && analyticsData.bestPostingTimes.hours ? 
                  analyticsData.bestPostingTimes.hours.map((hour, index) => (
                    <div key={index} className="p-3 bg-muted/20 rounded-md flex justify-between">
                      <p className="font-medium">{hour.hourFormatted}</p>
                      <p className="text-sm text-muted-foreground">High engagement</p>
                    </div>
                  )) : 
                  <div className="p-3 bg-muted/20 rounded-md flex justify-between">
                    <p className="font-medium">No data available</p>
                  </div>
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
            <p className="text-muted-foreground">No recommendation data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BestPostingTimes;