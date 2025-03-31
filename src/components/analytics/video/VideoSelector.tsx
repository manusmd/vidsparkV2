import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoSelectorProps {
  videos: Array<{ id: string; title: string }>;
  selectedVideo: string;
  onSelectVideo: (videoId: string) => void;
}

export function VideoSelector({ 
  videos, 
  selectedVideo, 
  onSelectVideo 
}: VideoSelectorProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Video Performance</h2>
      <Select value={selectedVideo} onValueChange={onSelectVideo}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a video" />
        </SelectTrigger>
        <SelectContent>
          {videos.map(video => (
            <SelectItem key={video.id} value={video.id}>{video.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}