"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { parseDate } from "@/lib/utils";
import { Video as VideoType } from "@/app/types";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader.component";
import { KPISection } from "@/components/dashboard/KPISection.component";
import { RecentVideosSection } from "@/components/dashboard/RecentVideosSection.component";
import { QuickActions } from "@/components/dashboard/QuickActions.component";

interface Video extends VideoType {
  youtubeVideoId?: string;
  youtubeStats?: {
    views: number;
    likes: number;
    comments: number;
  };
}

export default function VidSparkDashboard() {
  const { user, credits: userCredits } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract available credits from the userCredits object
  const availableCredits = typeof userCredits === 'object' ? 
    userCredits?.availableCredits || 0 : 
    userCredits || 0;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch videos
        const videosResponse = await fetch(`/api/video/get-user-videos`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (!videosResponse.ok) throw new Error("Failed to fetch videos");

        const videosData = await videosResponse.json();
        const mappedVideos: Video[] = videosData.videos.map((video: any) => ({
          ...video,
          createdAt: video.createdAt ? parseDate(video.createdAt) : null,
        }));
        
        // Sort videos by creation date
        const sortedVideos = mappedVideos.sort((a, b) => {
          const aTime = a.createdAt ? a.createdAt.getTime() : 0;
          const bTime = b.createdAt ? b.createdAt.getTime() : 0;
          return bTime - aTime;
        });
        
        setVideos(sortedVideos);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Calculate videos in production
  const videosInProduction = videos.filter(
    v => v.status === 'draft' || v.status.includes('processing')
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="ml-2 text-lg">Loading your VidSpark data...</p>
      </div>
    );
  }

  return (
    // Add a subtle gradient background to the entire page
    <div className="relative min-h-screen pb-10">
      {/* Page background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80 z-0"></div>
      
      <div className="container mx-auto px-4 py-6 space-y-8 relative z-10">
        <DashboardHeader 
          title="VidSpark Dashboard" 
          subtitle="Your VidSpark activity and resources" 
        />
        
        <QuickActions />

        <KPISection 
          totalVideos={videos.length}
          availableCredits={availableCredits}
          videosInProduction={videosInProduction}
          formatNumber={formatNumber}
        />

        <div className="grid lg:grid-cols-3 gap-6 mt-2">
          <div className="lg:col-span-3">
            <RecentVideosSection videos={videos} />
          </div>
        </div>
      </div>
    </div>
  );
} 