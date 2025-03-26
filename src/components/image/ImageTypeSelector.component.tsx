"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { ImageType } from "@/app/types";

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
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin w-6 h-6" />
        <span className="ml-2">Loading image types...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8">Error: {error}</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageTypes.map((it) => (
          <div
            key={it.id}
            onClick={() => onChange(it.id)}
            className={`cursor-pointer border rounded-lg p-4 transition hover:shadow-lg ${
              value === it.id ? "border-primary" : "border-transparent"
            }`}
          >
            {it.imageUrl && (
              <Image
                src={it.imageUrl}
                alt={it.title}
                width={200}
                height={200}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <h3 className="text-lg font-semibold whitespace-normal break-words">
              {it.title}
            </h3>
            {it.description && (
              <p
                className="text-sm text-muted-foreground whitespace-normal break-words"
                title={it.title}
              >
                {it.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}