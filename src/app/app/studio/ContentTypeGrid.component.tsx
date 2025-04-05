"use client";
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Ghost, Scale, History, Brain } from "lucide-react";
import { ContentType } from "@/app/types";
import Image from "next/image";

interface ContentTypeGridProps {
  contentTypes: ContentType[];
}

export default function ContentTypeGrid({
  contentTypes,
}: ContentTypeGridProps) {
  // Sort the content types by 'order' in ascending order
  const sortedTypes = [...contentTypes].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

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
                style={type.imageUrl ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.82)), url(${type.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                <div className="flex flex-col items-center text-center flex-1 relative z-10">
                  {!type.imageUrl && (
                    <Icon className="w-16 h-16 mb-4 text-zinc-400 group-hover:text-white transition-colors" />
                  )}
                  <div className="mt-4">
                    <h3 className="font-bold text-xl text-white group-hover:text-white transition-colors drop-shadow-lg">{type.title}</h3>
                    <p className="text-sm text-white mt-3 max-w-[85%] mx-auto font-medium drop-shadow-lg leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent z-0"></div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
