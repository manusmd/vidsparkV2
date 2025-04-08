import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Upload, Clock, ThumbsUp, MessageSquare } from "lucide-react";
import { VidSparkVideo } from "@/types/vidspark";

interface RecentVideosProps {
  videos: VidSparkVideo[];
  formatNumber: (num: number) => string;
}

export function RecentVideos({ videos, formatNumber }: RecentVideosProps) {
  const getStatusColor = (status: VidSparkVideo['status']) => {
    switch (status) {
      case 'draft':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'ready':
        return 'text-green-500';
      case 'uploaded':
        return 'text-purple-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>Your latest VidSpark creations</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Video className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Video className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{video.title}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span className={getStatusColor(video.status)}>
                      {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              {video.youtubeStats && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatNumber(video.youtubeStats.views)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatNumber(video.youtubeStats.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatNumber(video.youtubeStats.comments)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 