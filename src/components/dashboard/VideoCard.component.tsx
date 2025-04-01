"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video as VideoType } from "@/app/types";
import { Video, Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseDate } from "@/lib/utils";
import { getFriendlyStatus } from "@/lib/getFriendlyStatus";
import { formatDistanceToNow } from "date-fns";
import ROUTES from "@/lib/routes";

interface VideoCardProps {
  video: VideoType & {
    youtubeVideoId?: string;
    youtubeStats?: {
      views: number;
      likes: number;
      comments: number;
    };
  };
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const router = useRouter();
  const createdAt = video.createdAt instanceof Date 
    ? video.createdAt 
    : parseDate(video.createdAt);
  
  const isProcessing = video.status.includes('processing');
  const isDraft = video.status === 'draft';
  const isCompleted = video.status === 'completed' || video.status === 'assets:ready';

  // Determine badge color based on video status
  const badgeColorClass = isProcessing
    ? "bg-amber-400 text-amber-950"
    : isDraft
    ? "bg-slate-400 text-slate-950"
    : isCompleted
    ? "bg-green-600 text-white"
    : "bg-red-500 text-white";

  return (
    <Card className="overflow-hidden border border-border shadow-md hover:shadow-lg transition-all">
      {/* Thumbnail area */}
      <div className="h-40 bg-muted relative">
        {video.scenes && video.scenes[0]?.imageUrl ? (
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${video.scenes[0].imageUrl})` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <Badge className={`absolute top-2 right-2 ${badgeColorClass}`}>
          {getFriendlyStatus(video.status)}
        </Badge>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {createdAt
            ? `Created ${formatDistanceToNow(createdAt, { addSuffix: true })}`
            : ""}
        </p>
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => router.push(ROUTES.PAGES.APP.VIDEOS.DETAIL(video.id))}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          
          {isDraft && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                // Navigate to edit page
                router.push(`/app/create/edit/${video.id}`);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}; 