"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil } from "lucide-react";
import type { ImageType } from "@/app/types";
import Image from "next/image";

interface ImageTypeListProps {
  imageTypes: ImageType[];
  onEdit: (imageType: ImageType) => void;
  onDelete: (id: string) => void;
}

export function ImageTypeList({
  imageTypes,
  onEdit,
  onDelete,
}: ImageTypeListProps) {
  return (
    <div className="space-y-4">
      {imageTypes.map((imageType) => (
        <Card
          key={imageType.id}
          className="relative p-4 border border-border rounded-lg hover:bg-muted/10 transition w-full mx-auto"
        >
          <div className="flex items-center space-x-4 w-full overflow-hidden">
            {imageType.imageUrl && (
              <Image
                priority
                src={imageType.imageUrl}
                width={128}
                height={128}
                alt="Thumbnail"
                className="w-32 h-32 object-cover rounded"
              />
            )}
            <div className="flex flex-col space-y-1">
              <h4 className="font-semibold text-lg truncate">
                {imageType.title}
              </h4>
              {imageType.description && (
                <p
                  className="text-sm text-muted-foreground truncate"
                  title={imageType.title}
                >
                  {imageType.description}
                </p>
              )}
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(imageType)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(imageType.id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}