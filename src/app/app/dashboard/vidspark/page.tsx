"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Video, CreditCard, Upload, Plus } from "lucide-react";
import { HistoryItem } from "@/components/history/HistoryItem.component";
import { parseDate } from "@/lib/utils";
import { Video as VideoType } from "@/app/types";

interface Video extends VideoType {
  youtubeVideoId?: string;
  youtubeStats?: {
    views: number;
    likes: number;
    comments: number;
  };
}

export default function VidSparkDashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);

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

        // Fetch credits
        const creditsResponse = await fetch(`/api/credits`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          setCredits(creditsData.availableCredits || 0);
        }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="ml-2 text-lg">Loading your VidSpark data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">VidSpark Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Your VidSpark activity and resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Videos Created</CardTitle>
            <CardDescription>Total videos created with VidSpark</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatNumber(videos.length)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits Available</CardTitle>
            <CardDescription>Credits for video creation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{credits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Videos Uploaded</CardTitle>
            <CardDescription>Videos uploaded to YouTube</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatNumber(videos.filter(v => v.status === 'completed').length)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recent Videos</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Video
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.slice(0, 6).map((video) => (
          <HistoryItem
            key={video.id}
            video={video}
            isSelected={false}
            toggleSelection={() => {}}
          />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <Video className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            No videos created yet. Start by creating your first video!
          </p>
        </div>
      )}
    </div>
  );
} 