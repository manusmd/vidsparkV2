"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Loader2, Check } from "lucide-react";
import type { ImageType } from "@/app/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageTypeSelectorProps {
  value: string | null;
  onChange: (id: string) => void;
  imageTypes: ImageType[];
  loading?: boolean;
  error?: string | null;
}

export function ImageTypeSelector({
  value,
  onChange,
  imageTypes,
  loading = false,
  error = null,
}: ImageTypeSelectorProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => ({ ...prev, [imageId]: true }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[4/3] relative">
              <Skeleton className="absolute inset-0" />
            </div>
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8 bg-destructive/5 rounded-lg border border-destructive/20">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imageTypes.map((imageType) => (
          <Tooltip key={imageType.id}>
            <TooltipTrigger asChild>
              <Card
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200",
                  "hover:border-primary/50 hover:shadow-lg",
                  value === imageType.id && "ring-2 ring-primary"
                )}
                onClick={() => onChange(imageType.id)}
              >
                <div className="aspect-[4/3] relative bg-muted/20">
                  {!loadedImages[imageType.id] && (
                    <Skeleton className="absolute inset-0 animate-pulse" />
                  )}
                  {imageType.imageUrl && (
                    <Image
                      src={imageType.imageUrl}
                      alt={imageType.title}
                      fill
                      className={cn(
                        "object-cover transition-opacity duration-300",
                        loadedImages[imageType.id] ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => handleImageLoad(imageType.id)}
                    />
                  )}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent",
                    "opacity-80 group-hover:opacity-90 transition-opacity duration-200"
                  )} />
                  {value === imageType.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-semibold text-lg leading-tight mb-1 drop-shadow-sm">
                    {imageType.title}
                  </h3>
                  {imageType.description && (
                    <p className="text-sm text-white/95 line-clamp-2 leading-snug drop-shadow-sm">
                      {imageType.description}
                    </p>
                  )}
                </div>
              </Card>
            </TooltipTrigger>
            {imageType.description && (
              <TooltipContent side="top" className="max-w-[300px] text-sm">
                {imageType.description}
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}