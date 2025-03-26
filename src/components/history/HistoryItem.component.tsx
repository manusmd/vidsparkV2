"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Video } from "@/app/types";
import { getFriendlyStatus } from "@/lib/getFriendlyStatus";
import { parseDate } from "@/lib/utils";
import ROUTES from "@/lib/routes";

interface HistoryItemProps {
  video: Video;
  isSelected: boolean;
  toggleSelection: (videoId: string) => void;
}

export const HistoryItem: FC<HistoryItemProps> = ({
  video,
  isSelected,
  toggleSelection,
}) => {
  const router = useRouter();
  const createdAt = parseDate(video.createdAt);

  // Determine badge color based on video status.
  const badgeColorClass =
    video.status === "draft" || video.status.startsWith("processing")
      ? "bg-yellow-400 text-black"
      : video.status === "completed" || video.status === "assets:ready"
        ? "bg-green-600 text-white"
        : "bg-red-500 text-white";

  return (
    <Card
      onClick={() => toggleSelection(video.id)}
      className={`cursor-pointer relative p-6 border border-border shadow-lg hover:border-primary transition flex flex-col ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* Top row: status badge on left, "View" button on right */}
      <div className="flex justify-between items-center mb-2">
        <Badge className={`text-xs py-1 px-2 ${badgeColorClass}`}>
          {getFriendlyStatus(video.status)}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(ROUTES.PAGES.APP.VIDEOS.DETAIL(video.id));
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>

      {/* Middle: title and description */}
      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{video.title}</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {video.description}
        </p>
      </div>

      {/* Bottom: creation date */}
      <div className="text-xs text-muted-foreground mt-4">
        {createdAt
          ? `Created ${formatDistanceToNow(createdAt, { addSuffix: true })}`
          : ""}
      </div>
    </Card>
  );
};
