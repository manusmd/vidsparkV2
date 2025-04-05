"use client";
import React, { useState } from "react";
import ContentTypeGrid from "@/app/app/studio/ContentTypeGrid.component";
import { Loader2, ChevronRight, LayoutTemplate, Plus } from "lucide-react";
import { useCachedData } from "@/hooks/data/useCachedData";
import { useTemplates } from "@/hooks/data/useTemplates";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoTemplate } from "@/app/types";
import { formatDistanceToNow } from "date-fns";
import ROUTES from "@/lib/routes";

export default function StudioPage() {
  const router = useRouter();
  const { data, isLoading, hasError, errorMessage } = useCachedData();
  const { contentTypes } = data;
  const { templates, loading: templatesLoading } = useTemplates();
  const [showTemplates, setShowTemplates] = useState(true);

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

        {showTemplates && templates.length > 0 && (
          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-primary" />
                Start with a Template
              </h2>
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push(ROUTES.PAGES.APP.TEMPLATES)}
                  className="text-sm"
                >
                  View all templates
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                  className="text-sm"
                >
                  Start from scratch
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {recentTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="overflow-hidden border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <h3 className="text-lg font-medium truncate">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last used {formatDistanceToNow(new Date(template.lastUsedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button 
                      className="w-full mt-2 bg-primary/90 hover:bg-primary"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card 
                className="overflow-hidden border border-dashed hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center p-6"
                onClick={() => router.push(ROUTES.PAGES.APP.TEMPLATES)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">View more templates</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse all your saved templates
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {(!showTemplates || templates.length === 0) && (
          <>
            <h2 className="text-xl font-semibold mt-4">
              {templates.length > 0 ? "Or, start from scratch" : "Select a content type"}
            </h2>
            <ContentTypeGrid contentTypes={contentTypes} />
            
            {templates.length > 0 && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowTemplates(true)}
              >
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Start with a template instead
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
