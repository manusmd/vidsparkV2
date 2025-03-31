import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Edit, Trash2, Share2 } from "lucide-react";
import { AnalyticsResponse } from "@/services/accounts/analyticsService";

interface ContentOverviewProps {
  analyticsData: AnalyticsResponse | null;
}

export function ContentOverview({ analyticsData }: ContentOverviewProps) {
  // Mock data for recent videos and upcoming content
  const recentVideos = [
    {
      id: "1",
      title: "How to Create Amazing YouTube Videos",
      thumbnail: "https://picsum.photos/300/200",
      views: 1200,
      likes: 150,
      comments: 45,
      status: "published",
      publishedAt: "2024-03-15",
    },
    {
      id: "2",
      title: "Best Practices for Content Creation",
      thumbnail: "https://picsum.photos/300/200",
      views: 800,
      likes: 100,
      comments: 30,
      status: "published",
      publishedAt: "2024-03-14",
    },
  ];

  const upcomingContent = [
    {
      id: "3",
      title: "Advanced Video Editing Tips",
      thumbnail: "https://picsum.photos/300/200",
      status: "scheduled",
      scheduledFor: "2024-03-20",
    },
    {
      id: "4",
      title: "Content Strategy Guide",
      thumbnail: "https://picsum.photos/300/200",
      status: "draft",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Videos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Your latest content performance</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Video
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVideos.map((video) => (
              <div key={video.id} className="flex items-start space-x-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-24 h-16 object-cover rounded-md"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-medium">{video.title}</h4>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{video.views} views</span>
                    <span>{video.likes} likes</span>
                    <span>{video.comments} comments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Content</CardTitle>
              <CardDescription>Your content pipeline</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingContent.map((content) => (
              <div key={content.id} className="flex items-start space-x-4">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-24 h-16 object-cover rounded-md"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-medium">{content.title}</h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {content.status === "scheduled" ? (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>Scheduled for {content.scheduledFor}</span>
                      </>
                    ) : (
                      <span className="text-yellow-600">Draft</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 