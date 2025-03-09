"use client";
import React from "react";
import ContentTypeGrid from "@/app/create/ContentTypeGrid.component";
import { useContentTypes } from "@/hooks/data/useContentTypes";

export default function CreatePage() {
  const { contentTypes } = useContentTypes();

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
