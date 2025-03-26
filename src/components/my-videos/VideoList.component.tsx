"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Video } from "@/app/types";
import { HistoryItem } from "@/components/history/HistoryItem.component";
import { parseDate } from "@/lib/utils";

export type VideoStatus = "all" | "draft" | "published" | "archived";

interface VideoListProps {
  status: VideoStatus;
}

export function VideoList({ status }: VideoListProps) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/video/get-user-videos`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch videos");

        const res = await response.json();
        const mappedVideos: Video[] = res.videos.map((video: Video) => ({
          ...video,
          createdAt: video.createdAt ? parseDate(video.createdAt) : null,
        }));
        // Sort videos so the newest (latest createdAt) appears first.
        const sortedVideos = mappedVideos.sort((a, b) => {
          const aTime = a.createdAt ? a.createdAt.getTime() : 0;
          const bTime = b.createdAt ? b.createdAt.getTime() : 0;
          return bTime - aTime;
        });
        setVideos(sortedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [user]);

  // Filter videos based on status
  useEffect(() => {
    if (status === "all") {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(video => video.status === status));
    }
  }, [videos, status]);

  const toggleSelection = (videoId: string) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId],
    );
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        selectedVideos.map(async (id) => {
          await fetch(`/api/video`, {
            method: "DELETE",
            body: JSON.stringify({ videoId: id }),
          });
        }),
      );

      setVideos((prev) =>
        prev.filter((video) => !selectedVideos.includes(video.id)),
      );
      setSelectedVideos([]);
    } catch (error) {
      console.error("Error deleting videos:", error);
    }
    setIsConfirmOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="ml-2 text-lg">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        {filteredVideos.length > 0 && (
          <Button
            variant="destructive"
            disabled={selectedVideos.length === 0}
            onClick={() => setIsConfirmOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete{" "}
            {selectedVideos.length > 1 ? "Selected Videos" : "Selected Video"}
          </Button>
        )}
      </div>

      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <p className="text-muted-foreground text-lg">
            No videos found.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <HistoryItem
              key={video.id}
              video={video}
              isSelected={selectedVideos.includes(video.id)}
              toggleSelection={toggleSelection}
            />
          ))}
        </div>
      )}

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete {selectedVideos.length} video(s)?
            This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}