"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil } from "lucide-react";
import type { VideoType } from "@/app/types";
import Image from "next/image";

interface VideoTypeListProps {
  videoTypes: VideoType[];
  onEdit: (videoType: VideoType) => void;
  onDelete: (id: string) => void;
}

export function VideoTypeList({
  videoTypes,
  onEdit,
  onDelete,
}: VideoTypeListProps) {
  return (
    <div className="space-y-4">
      {videoTypes.map((videoType) => (
        <Card
          key={videoType.id}
          className="relative p-4 border border-border rounded-lg hover:bg-muted/10 transition w-full mx-auto"
        >
          <div className="flex items-center space-x-4 w-full overflow-hidden">
            {videoType.imageUrl && (
              <Image
                priority
                src={videoType.imageUrl}
                width={128}
                height={128}
                alt="Thumbnail"
                className="w-32 h-32 object-cover rounded"
              />
            )}
            <div className="flex flex-col space-y-1">
              <h4 className="font-semibold text-lg truncate">
                {videoType.title}
              </h4>
              {videoType.prompt && (
                <p
                  className="text-sm text-muted-foreground truncate"
                  title={videoType.prompt}
                >
                  <strong>Prompt:</strong> {videoType.prompt}
                </p>
              )}
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(videoType)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(videoType.id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
