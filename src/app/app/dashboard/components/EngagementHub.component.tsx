import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Trophy, TrendingUp } from "lucide-react";

export function EngagementHub() {
  // Mock data for recent comments and community activity
  const recentComments = [
    {
      id: "1",
      videoTitle: "How to Create Amazing YouTube Videos",
      author: "John Doe",
      comment: "Great tips! This helped me improve my content quality.",
      sentiment: "positive",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      videoTitle: "Best Practices for Content Creation",
      author: "Jane Smith",
      comment: "Could you make a video about thumbnail design?",
      sentiment: "neutral",
      timestamp: "5 hours ago",
    },
  ];

  const communityActivity = [
    {
      id: "1",
      type: "milestone",
      title: "Subscriber Milestone",
      description: "Reached 10,000 subscribers!",
      icon: Trophy,
      timestamp: "1 day ago",
    },
    {
      id: "2",
      type: "trend",
      title: "Trending Topic",
      description: "Your video is trending in the Technology category",
      icon: TrendingUp,
      timestamp: "2 days ago",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Comments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Comments</CardTitle>
              <CardDescription>Latest viewer feedback</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentComments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{comment.videoTitle}</h4>
                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{comment.author}</span>
                </div>
                <p className="text-sm">{comment.comment}</p>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8">
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8">
                    Like
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Community Activity</CardTitle>
              <CardDescription>Recent milestones and highlights</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communityActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <activity.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 