"use client";
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Ghost, Scale, History, Brain } from "lucide-react";
import { ContentType } from "@/app/types";

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              href={`/app/create/${type.id}`}
              className="group"
            >
              <Card className="relative overflow-hidden p-6 bg-card text-card-foreground hover:border-primary transition-colors cursor-pointer flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex flex-col items-center text-center flex-1">
                  <Icon className="w-12 h-12 group-hover:text-primary transition-colors" />
                  <div className="mt-4">
                    <h3 className="font-semibold">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {type.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
