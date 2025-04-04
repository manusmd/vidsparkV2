"use client";

import React from "react";
import { Video } from "@/app/types";
import { cn } from "@/lib/utils";
import {
  Clock,
  Calendar,
  Trash2,
  Download,
  Info,
  Aperture,
} from "lucide-react";
import { format } from "date-fns";
import ROUTES from "@/lib/routes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VideoInfoProps {
  video: Video;
  className?: string;
}

export function VideoInfo({ video, className }: VideoInfoProps) {
  const router = useRouter();
  const isVideoProcessing =
    video.status === "processing:video" ||
    video.status === "processing:story" ||
    video.status === "processing:assets";

  const deleteVideo = async () => {
    try {
      await fetch(`/api/video`, {
        method: "DELETE",
        body: JSON.stringify({ videoId: video.id }),
      });
      
      toast.success("Video deleted successfully");
      router.push(ROUTES.PAGES.APP.DASHBOARD.INDEX);
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };

  // Progress calculation
  const getProgress = () => {
    switch (video.status) {
      case "draft":
        return 0;
      case "processing:story":
        return 25;
      case "processing:assets":
        return 40;
      case "assets:ready":
        return 60;
      case "processing:video":
        return 75;
      case "render:complete":
      case "completed":
        return 100;
      case "failed":
      case "render:error":
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgress();
  
  // Format date function
  const formatDate = (date: Date | number) => {
    return format(date, 'MMM d, yyyy');
  };
  
  // Count scenes - since video.scenes is an object with numerical keys
  const scenesCount = Object.keys(video.scenes || {}).length;

  return (
    <Card className={cn("w-full border border-border/50 shadow-sm", className)}>
      <CardHeader className="pb-3 border-b border-border/30 bg-card/40">
        <div className="flex justify-between items-center mb-1">
          <CardTitle className="text-lg flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Video Details
          </CardTitle>
          
          <div className="flex space-x-2">
            {video.status === "draft" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteVideo}
                className="h-8 font-medium hover:bg-red-600 text-white"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            )}
            
            {video.renderStatus?.videoUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(video.renderStatus?.videoUrl, "_blank")}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Information about your video creation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="space-y-5">
          {/* Progress indicator for processing states */}
          {isVideoProcessing && (
            <div className="bg-card/70 border border-border/30 rounded-lg p-3">
              <div className="flex justify-between mb-1 text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", 
                    video.status === "processing:story" ? "bg-blue-500 animate-pulse" :
                    video.status === "processing:assets" ? "bg-indigo-500 animate-pulse" :
                    video.status === "processing:video" ? "bg-purple-500 animate-pulse" :
                    "bg-blue-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Information grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Aperture className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scenes</p>
                <p className="font-medium">{scenesCount}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(video.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="font-medium">{formatDate(video.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
