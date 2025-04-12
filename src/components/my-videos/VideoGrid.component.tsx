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
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Plus,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Video } from "@/app/types";
import { parseDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getFriendlyStatus } from "@/lib/getFriendlyStatus";
import { formatDistanceToNow } from "date-fns";
import ROUTES from "@/lib/routes";
import Image from "next/image";

export type VideoStatus = "all" | "draft" | "published" | "archived";

interface VideoGridProps {
  status: VideoStatus;
}

export function VideoGrid({ status }: VideoGridProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [loadedThumbnails, setLoadedThumbnails] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);

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
        setVideos(mappedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [user]);

  // Filter and sort videos
  useEffect(() => {
    let result = [...videos];

    // Filter by status
    if (status !== "all") {
      result = result.filter(video => video.status === status);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(video => 
        video.title?.toLowerCase().includes(query) || 
        video.description?.toLowerCase().includes(query)
      );
    }

    // Sort videos
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
        case "oldest":
          return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    setFilteredVideos(result);
  }, [videos, status, searchQuery, sortBy]);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await Promise.all(
        selectedVideos.map(async (id) => {
          const response = await fetch(`/api/video`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
            body: JSON.stringify({ videoId: id }),
          });

          if (!response.ok) throw new Error("Failed to delete video");
        })
      );

      setVideos(prev => prev.filter(video => !selectedVideos.includes(video.id)));
      setSelectedVideos([]);
      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting videos:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "completed":
      case "assets:ready":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const handleThumbnailLoad = (videoId: string) => {
    setLoadedThumbnails(prev => ({ ...prev, [videoId]: true }));
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video w-full bg-muted/20 relative">
              <Skeleton className="absolute inset-0 animate-pulse" />
            </div>
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center mt-4">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={sortBy}
            onValueChange={(value: "newest" | "oldest" | "title") => setSortBy(value)}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">By Title</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}
            className="shrink-0 bg-primary/90 hover:bg-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Video
          </Button>
        </div>
      </div>

      {/* Results count and bulk actions */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs font-normal px-2.5 py-1">
          {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} found
        </Badge>
        {selectedVideos.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            className="h-8"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedVideos.length})
          </Button>
        )}
      </div>

      {/* Video grid */}
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-muted/5 rounded-lg border-2 border-dashed border-muted">
          <Filter className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No videos found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Try adjusting your search or filters" : "Create your first video to get started"}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Video
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className={`group relative overflow-hidden transition-all duration-200 hover:border-primary/50 ${
                selectedVideos.includes(video.id) ? "ring-2 ring-primary" : ""
              }`}
            >
              <div 
                className="aspect-video w-full bg-muted/20 relative cursor-pointer"
                onClick={() => router.push(ROUTES.PAGES.APP.VIDEOS.DETAIL(video.id))}
              >
                {video.scenes && 
                 Object.values(video.scenes)[0]?.imageUrl && 
                 typeof Object.values(video.scenes)[0].imageUrl === 'string' && (
                  <div className="relative w-full h-full">
                    {!loadedThumbnails[video.id] && (
                      <Skeleton className="absolute inset-0 animate-pulse" />
                    )}
                    <Image
                      src={Object.values(video.scenes)[0].imageUrl as string}
                      alt={video.title || 'Video thumbnail'}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        loadedThumbnails[video.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                      unoptimized
                      onLoad={() => handleThumbnailLoad(video.id)}
                    />
                  </div>
                )}
                {(!video.scenes || 
                  !Object.values(video.scenes)[0]?.imageUrl || 
                  typeof Object.values(video.scenes)[0]?.imageUrl !== 'string') && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                )}
                <Badge 
                  className={`absolute top-2 right-2 ${getBadgeColor(video.status)}`}
                >
                  {getFriendlyStatus(video.status)}
                </Badge>
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVideos(prev => 
                      prev.includes(video.id) 
                        ? prev.filter(id => id !== video.id)
                        : [...prev, video.id]
                    );
                  }}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedVideos.includes(video.id) 
                      ? 'bg-primary border-primary' 
                      : 'bg-background/80 border-muted-foreground/50 hover:border-primary'
                  }`}>
                    {selectedVideos.includes(video.id) && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" title={video.title}>
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1" title={video.description}>
                      {video.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-4 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {video.createdAt
                    ? formatDistanceToNow(video.createdAt, { addSuffix: true })
                    : ""}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
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
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 