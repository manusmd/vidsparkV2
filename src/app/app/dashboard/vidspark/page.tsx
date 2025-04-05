"use client";

import React from "react";
import { RecentVideosSection } from "@/components/dashboard/RecentVideosSection.component";
import { QuickActions } from "@/components/dashboard/QuickActions.component";
import { useDataContext } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function VidSparkDashboard() {
  // Our data is now being prefetched in the DataContext provider
  const { 
    contentTypesLoading, 
    imageTypesLoading, 
    voicesLoading,
    userVideosLoading,
    refreshUserVideos
  } = useDataContext();

  // All necessary data is being prefetched in the background
  const dataLoaded = !contentTypesLoading && !imageTypesLoading && !voicesLoading && !userVideosLoading;
  
  const handleRefreshVideos = async () => {
    try {
      await refreshUserVideos();
    } catch (error) {
      console.error("Error refreshing videos:", error);
    }
  };

  return (
    <div className="container py-6 px-4 md:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          VidSpark Dashboard
        </h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshVideos}
          disabled={userVideosLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${userVideosLoading ? 'animate-spin' : ''}`} />
          Refresh Videos
        </Button>
      </div>
      <p className="text-muted-foreground mb-8 max-w-3xl">
        Welcome to your VidSpark Dashboard. Create, manage, and analyze your video content all in one place.
        {dataLoaded && <span className="text-green-500 ml-2">✓ All data prefetched</span>}
      </p>

      <QuickActions />
      <RecentVideosSection />
    </div>
  );
} 