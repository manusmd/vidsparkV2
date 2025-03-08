"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { Video } from "@/app/types"; // Import your auth hook

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth(); // Get current user from authentication context
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return; // Wait for user authentication

    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/video/get-user-videos`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`, // Secure request
          },
        });

        if (!response.ok) throw new Error("Failed to fetch videos");

        const { videos } = await response.json();
        setVideos(
          videos.map((video: Video) => ({
            ...video,
            createdAt: video.createdAt ? new Date(video.createdAt) : new Date(),
          })),
        );
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [user]);

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="ml-2 text-lg">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="container min-h-screen py-10 px-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Video History</h1>
        {videos.length > 0 && (
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

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-muted-foreground text-lg">
            No videos created yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="relative p-6 space-y-4 border border-border shadow-lg hover:border-primary transition"
            >
              <div className="absolute top-4 left-4">
                <Checkbox
                  checked={selectedVideos.includes(video.id)}
                  onCheckedChange={() => toggleSelection(video.id)}
                />
              </div>

              <h3 className="font-semibold text-lg">{video.title}</h3>
              <p className="text-sm text-muted-foreground">
                {video.description}
              </p>

              <div className="text-xs text-muted-foreground">
                Created{" "}
                {formatDistanceToNow(
                  (() => {
                    const d = new Date(video.createdAt);
                    return isNaN(d.getTime()) ? new Date() : d;
                  })(),
                  { addSuffix: true },
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/videos/${video.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    video.status.startsWith("processing")
                      ? "bg-yellow-500"
                      : video.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                >
                  {video.status.replace("processing:", "Processing: ")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Delete Dialog */}
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
