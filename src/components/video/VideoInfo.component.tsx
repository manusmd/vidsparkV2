// VideoInfo.component.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Video } from "@/app/types";
import { FC } from "react";
import { getFriendlyStatus } from "@/lib/getFriendlyStatus";

interface VideoInfoProps {
  video: Video;
}

export const VideoInfo: FC<VideoInfoProps> = ({ video }) => {
  // Set badge colors based on status.
  const badgeColor =
    video.status === "draft" ||
    video.status === "processing:assets" ||
    video.status === "processing:upload"
      ? "bg-yellow-500"
      : video.status === "failed"
        ? "bg-red-500"
        : "bg-green-500";

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold">{video.title}</h1>
      <p className="text-muted-foreground">{video.description}</p>

      {/* Video Status */}
      <div className="mt-4">
        <strong>Status:</strong>{" "}
        <Badge className={badgeColor}>{getFriendlyStatus(video.status)}</Badge>
      </div>

      {/* Created Date */}
      <p className="text-xs text-muted-foreground mt-2">
        Created {formatDistanceToNow(video.createdAt, { addSuffix: true })}
      </p>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        {video.status === "completed" && (
          <Button className="w-full">Download Video</Button>
        )}
        {video.status === "failed" && (
          <Button variant="destructive" className="w-full">
            Retry Processing
          </Button>
        )}
        <Button variant="outline" className="w-full">
          Delete Video
        </Button>
      </div>
    </Card>
  );
};
