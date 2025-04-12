"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Ghost, Scale, History, Brain } from "lucide-react";
import { ContentType } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentTypeGridProps {
  contentTypes: ContentType[];
}

export default function ContentTypeGrid({
  contentTypes,
}: ContentTypeGridProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const sortedTypes = [...contentTypes].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  useEffect(() => {
    sortedTypes.forEach((type) => {
      if (type.imageUrl) {
        const img = new window.Image();
        img.onload = () => handleImageLoad(type.id);
        img.src = type.imageUrl;
      }
    });
  }, [sortedTypes]);

  const handleImageLoad = (typeId: string) => {
    setLoadedImages(prev => ({ ...prev, [typeId]: true }));
  };

  const allImagesLoaded = sortedTypes.every(type => !type.imageUrl || loadedImages[type.id]);

  return (
    <div className="grid gap-6 w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedTypes.map((type) => {
          const Icon =
            {
              horror: Ghost,
              "true-crime": Scale,
              history: History,
              facts: Brain,
            }[type.id] || Ghost;

          return (
            <Link
              key={type.id}
              href={`/app/studio/${type.id}`}
              className="group"
            >
              <Card 
                className={`relative overflow-hidden p-6 text-card-foreground hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between h-full min-h-[260px] bg-zinc-900 border-zinc-800 hover:border-white/40 group ${type.imageUrl ? '' : 'bg-card'}`}
              >
                {!allImagesLoaded ? (
                  <div className="absolute inset-0 flex flex-col">
                    <Skeleton className="h-32 w-full animate-pulse" />
                    <div className="p-6 flex-1 flex flex-col items-center justify-center">
                      <Skeleton className="h-6 w-3/4 mb-4 animate-pulse" />
                      <Skeleton className="h-4 w-1/2 animate-pulse" />
                    </div>
                  </div>
                ) : type.imageUrl ? (
                  <>
                    <div className="absolute inset-0">
                      <Image
                        src={type.imageUrl}
                        alt={type.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/92 to-black/82" />
                    </div>
                    <div className="flex flex-col items-center text-center flex-1 relative z-10">
                      <div className="mt-4">
                        <h3 className="font-bold text-xl text-white group-hover:text-white transition-colors drop-shadow-lg">{type.title}</h3>
                        <p className="text-sm text-white mt-3 max-w-[85%] mx-auto font-medium drop-shadow-lg leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent z-0"></div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center flex-1 relative z-10">
                    <Icon className="w-16 h-16 mb-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <div className="mt-4">
                      <h3 className="font-bold text-xl text-white group-hover:text-white transition-colors drop-shadow-lg">{type.title}</h3>
                      <p className="text-sm text-white mt-3 max-w-[85%] mx-auto font-medium drop-shadow-lg leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
