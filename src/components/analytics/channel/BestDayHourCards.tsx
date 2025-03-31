import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";

interface BestDayHourCardsProps {
  bestDay?: string;
  bestHour?: string;
}

export function BestDayHourCards({ bestDay = 'N/A', bestHour = 'N/A' }: BestDayHourCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Best Day</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {bestDay}
          </div>
          <p className="text-xs text-muted-foreground">
            Best day to post content
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Best Hour</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {bestHour}
          </div>
          <p className="text-xs text-muted-foreground">
            Best hour to post content
          </p>
        </CardContent>
      </Card>
    </div>
  );
}