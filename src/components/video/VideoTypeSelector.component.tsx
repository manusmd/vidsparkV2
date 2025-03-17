"use client";
import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VideoType } from "@/app/types";

interface VideoTypeSelectorProps {
  value: string | null;
  onChange: (id: string) => void;
  videoTypes: VideoType[];
  loading?: boolean;
  error?: string | null;
}

export function VideoTypeSelector({
  value,
  onChange,
  videoTypes,
  loading = false,
  error = null,
}: VideoTypeSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin w-6 h-6" />
        <span className="ml-2">Loading video types...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8">Error: {error}</div>
    );
  }

  return (
    <Card className="mx-auto w-full ">
      <CardHeader>
        <CardTitle>Video Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videoTypes.map((vt) => (
            <div
              key={vt.id}
              onClick={() => onChange(vt.id)}
              className={`cursor-pointer border rounded-lg p-4 transition hover:shadow-lg ${
                value === vt.id ? "border-primary" : "border-transparent"
              }`}
            >
              {vt.imageUrl && (
                <Image
                  src={vt.imageUrl}
                  alt={vt.title}
                  width={200}
                  height={200}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="text-lg font-semibold whitespace-normal break-words">
                {vt.title}
              </h3>
              {vt.description && (
                <p
                  className="text-sm text-muted-foreground whitespace-normal break-words"
                  title={vt.title}
                >
                  {vt.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
