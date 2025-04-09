"use client";
import React, { useState } from "react";
import { Loader2, ChevronRight, LayoutTemplate, Plus, Sparkles, ArrowLeft } from "lucide-react";
import { useCachedData } from "@/hooks/data/useCachedData";
import { useTemplates } from "@/hooks/data/useTemplates";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoTemplate } from "@/app/types";
import { formatDistanceToNow } from "date-fns";
import ROUTES from "@/lib/routes";
import ContentTypeGrid from "./ContentTypeGrid.component";

export default function StudioPage() {
  const router = useRouter();
  const { data, isLoading, hasError, errorMessage } = useCachedData();
  const { contentTypes } = data;
  const { templates, loading: templatesLoading } = useTemplates();
  const [showContentTypes, setShowContentTypes] = useState(false);

  if (isLoading || templatesLoading || !contentTypes || contentTypes.length === 0) {
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

  const recentTemplates = templates.slice(0, 3);
  const handleSelectTemplate = (template: VideoTemplate) => {
    router.push(`${ROUTES.PAGES.APP.STUDIO}/${template.contentTypeId}?template=${template.id}`);
  };

  return (
    <div className="container py-12 px-4 md:px-8 flex flex-col items-center bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col items-start gap-4 md:gap-8">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            VidSpark Studio
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a captivating short-form video in minutes.
          </p>
        </div>

        {showContentTypes ? (
          <div className="w-full mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Select Content Type</h2>
              <Button
                variant="ghost"
                onClick={() => setShowContentTypes(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <ContentTypeGrid contentTypes={contentTypes} />
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
                      <h2 className="text-xl font-semibold">Start from Scratch</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Begin with a blank canvas and customize every aspect of your video.
                    </p>
                    <div className="mt-auto">
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        onClick={() => setShowContentTypes(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Video
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                      <h2 className="text-xl font-semibold">Use a Template</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Start with a pre-designed template to speed up your workflow.
                    </p>
                    <div className="mt-auto">
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(ROUTES.PAGES.APP.TEMPLATES)}
                      >
                        <LayoutTemplate className="w-4 h-4 mr-2" />
                        Browse Templates
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {recentTemplates.length > 0 && (
              <div className="w-full mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Recent Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
