"use client";
import React from "react";
import ContentTypeGrid from "@/app/app/create/ContentTypeGrid.component";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { Loader2 } from "lucide-react";

export default function CreatePage() {
  const { contentTypes, loading } = useContentTypes();

  if (loading || !contentTypes || contentTypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="ml-2 text-lg text-foreground">Loading content types...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 px-4 md:px-8 flex flex-col items-center bg-background text-foreground">
      <div className="flex flex-col items-start gap-4 md:gap-8">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Engaging Stories
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a content type or create your own to generate a captivating
            short-form video.
          </p>
        </div>
        <ContentTypeGrid contentTypes={contentTypes} />
      </div>
    </div>
  );
}
