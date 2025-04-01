"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video as VideoType } from "@/app/types";
import { Video, Edit, Eye, Clock } from "lucide-react";
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

  // Determine badge styling based on video status
  const getBadgeStyles = () => {
    if (isProcessing) {
      return "bg-amber-500/90 text-amber-950 hover:bg-amber-500";
    } else if (isDraft) {
      return "bg-slate-500/90 text-slate-50 hover:bg-slate-500";
    } else if (isCompleted) {
      return "bg-emerald-500/90 text-emerald-950 hover:bg-emerald-500";
    } else {
      return "bg-red-500/90 text-red-50 hover:bg-red-500";
    }
  };

  return (
    <Card className="group relative overflow-hidden border border-white/10 bg-card/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary/20">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-60 z-10"></div>
      
      {/* Thumbnail area */}
      <div className="h-44 relative overflow-hidden">
        {video.scenes && video.scenes[0]?.imageUrl ? (
          <div 
            className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url(${video.scenes[0].imageUrl})` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Video className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Status Badge */}
        <Badge className={`absolute top-3 right-3 z-20 font-medium shadow-lg ${getBadgeStyles()}`}>
          {getFriendlyStatus(video.status)}
        </Badge>
      </div>
      
      {/* Content area */}
      <div className="p-4 relative z-10">
        <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors duration-200">
          {video.title}
        </h3>
        
        {/* Creation date */}
        <div className="flex items-center mt-2 text-xs text-muted-foreground/70">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/50" />
          {createdAt
            ? formatDistanceToNow(createdAt, { addSuffix: true })
            : ""}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
            onClick={() => router.push(ROUTES.PAGES.APP.VIDEOS.DETAIL(video.id))}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View
          </Button>
          
          {isDraft && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
              onClick={() => {
                router.push(`/app/create/edit/${video.id}`);
              }}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}; 