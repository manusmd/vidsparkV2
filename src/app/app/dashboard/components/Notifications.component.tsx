import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

export function Notifications() {
  // Mock data for notifications
  const notifications = [
    {
      id: "1",
      type: "milestone",
      title: "Subscriber Milestone",
      description: "Congratulations! You've reached 10,000 subscribers.",
      icon: CheckCircle2,
      timestamp: "2 hours ago",
      priority: "high",
    },
    {
      id: "2",
      type: "schedule",
      title: "Video Scheduled",
      description: "Your video 'How to Create Amazing YouTube Videos' is scheduled for tomorrow at 10:00 AM.",
      icon: Calendar,
      timestamp: "5 hours ago",
      priority: "medium",
    },
    {
      id: "3",
      type: "alert",
      title: "Performance Alert",
      description: "Your recent video's engagement rate is below average. Consider reviewing the content.",
      icon: AlertCircle,
      timestamp: "1 day ago",
      priority: "high",
    },
  ];

  const schedule = [
    {
      id: "1",
      title: "Video Publish",
      description: "How to Create Amazing YouTube Videos",
      time: "Tomorrow, 10:00 AM",
      icon: Clock,
    },
    {
      id: "2",
      title: "Content Review",
      description: "Review draft: Content Strategy Guide",
      time: "Tomorrow, 2:00 PM",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Important Updates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Important Updates</CardTitle>
              <CardDescription>Latest notifications and alerts</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${
                  notification.priority === "high" 
                    ? "bg-red-100 text-red-600" 
                    : "bg-blue-100 text-blue-600"
                }`}>
                  <notification.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Upcoming events and deadlines</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule.map((item) => (
              <div key={item.id} className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 