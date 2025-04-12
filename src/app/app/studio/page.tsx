"use client";
import React from "react";
import { Loader2, LayoutTemplate } from "lucide-react";
import { useCachedData } from "@/hooks/data/useCachedData";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoTemplate } from "@/app/types";
import ROUTES from "@/lib/routes";
import ContentTypeGrid from "./ContentTypeGrid.component";

export default function StudioPage() {
  const router = useRouter();
  const { data, isLoading, hasError, errorMessage } = useCachedData();
  const { contentTypes } = data;

  if (isLoading || !contentTypes || contentTypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="ml-2 text-lg text-foreground">Loading studio resources...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p className="text-destructive text-lg mb-2">Error loading studio resources</p>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="container py-12 px-4 md:px-8 flex flex-col items-center bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col items-start gap-4 md:gap-8">
        <div className="w-full flex justify-between items-center">
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              VidSpark Studio
            </h1>
            <p className="text-lg text-muted-foreground">
              Create a captivating short-form video in minutes.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.PAGES.APP.TEMPLATES)}
            className="flex items-center gap-2"
          >
            <LayoutTemplate className="h-4 w-4" />
            Create from Template
          </Button>
        </div>

        <div className="w-full mt-8">
          <h2 className="text-xl font-semibold mb-6">Select Content Type</h2>
          <ContentTypeGrid contentTypes={contentTypes} />
        </div>
      </div>
    </div>
  );
}
