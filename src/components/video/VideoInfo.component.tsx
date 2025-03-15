"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Video } from "@/app/types";
import { FC } from "react";
import { getFriendlyStatus } from "@/lib/getFriendlyStatus";
import { Check } from "lucide-react";

interface VideoInfoProps {
  video: Video;
}

interface CircularProgressProps {
  progress: number; // percentage from 0 to 100
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#374151"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress Circle (rotated -90° so it starts at the top) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="white"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
      {/* Centered Percentage Text */}
      <g>
        <text
          x="50%"
          y="50%"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xl font-bold"
        >
          {Math.round(progress)}%
        </text>
      </g>
    </svg>
  );
};

const RenderStatusCircle: FC<{ video: Video }> = ({ video }) => {
  // Show progress circle if processing:render
  if (video.status === "processing:render" && video.renderStatus) {
    return (
      <CircularProgress
        progress={video.renderStatus.progress * 100}
        size={80}
        strokeWidth={8}
      />
    );
  }
  // Completed: Show a green circle with a checkmark.
  if (video.status === "completed") {
    return (
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500">
        <Check className="w-10 h-10 text-white" />
      </div>
    );
  }
  // Draft: Show a yellow circle with a "D"
  if (video.status === "draft") {
    return (
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-yellow-500">
        <span className="text-3xl font-bold text-white">D</span>
      </div>
    );
  }
  // Otherwise, render nothing for other statuses
  return null;
};

export const VideoInfo: FC<VideoInfoProps> = ({ video }) => {
  const badgeColor =
    video.status === "draft"
      ? "bg-gray-500"
      : video.status === "processing:assets" ||
          video.status === "processing:upload" ||
          video.status === "processing:render"
        ? "bg-yellow-500"
        : video.status === "assets:ready"
          ? "bg-blue-500"
          : video.status === "failed" || video.status === "render:error"
            ? "bg-red-500"
            : "bg-green-500";

  return (
    <Card className="p-6">
      {/* Top row: Circle on the left, Title & Description on the right */}
      <div className="flex items-start gap-6">
        <RenderStatusCircle video={video} />

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <p className="text-muted-foreground">{video.description}</p>
          <div className="mt-2">
            <Badge className={badgeColor}>
              {getFriendlyStatus(video.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Created Date */}
      <p className="text-xs text-muted-foreground mt-4">
        Created {formatDistanceToNow(video.createdAt, { addSuffix: true })}
      </p>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        {/* Show Download if renderStatus.videoUrl is available */}
        {video.renderStatus?.videoUrl && (
          <Button
            className="w-full"
            onClick={() => {
              // Example: open the URL in a new tab
              window.open(video.renderStatus?.videoUrl, "_blank");
            }}
          >
            Download Video
          </Button>
        )}

        <Button variant="outline" className="w-full">
          Delete Video
        </Button>
      </div>
    </Card>
  );
};

export default VideoInfo;
