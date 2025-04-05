"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./VideoCard.component";
import { Video as VideoType } from "@/app/types";
import { Video, Plus, Filter, ChevronLeft, ChevronRight, SearchX, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import ROUTES from "@/lib/routes";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUserVideos } from "@/hooks/data/useUserVideos";

interface Video extends VideoType {
  youtubeVideoId?: string;
  youtubeStats?: {
    views: number;
    likes: number;
    comments: number;
  };
}

type FilterType = "all" | "draft" | "processing" | "completed";

export const RecentVideosSection = () => {
  const router = useRouter();
  const { videos, loading, error, refreshVideos } = useUserVideos();
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 6;
  
  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshVideos();
    } catch (error) {
      console.error("Error refreshing videos:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Filter videos based on current filter
  const filteredVideos = videos?.filter(video => {
    if (currentFilter === "all") return true;
    if (currentFilter === "draft") return video.status === "draft";
    if (currentFilter === "processing") return video.status.includes("processing");
    if (currentFilter === "completed") return video.status === "completed" || video.status === "assets:ready";
    return true;
  }) || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[30vh]">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground mr-2" />
        <p className="text-muted-foreground">Loading your videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[30vh] bg-white/5 backdrop-blur-sm rounded-lg border border-dashed border-white/10 shadow-inner">
        <p className="text-muted-foreground text-lg mb-4">
          There was an error loading your videos. Please try again.
        </p>
        <Button onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Recent Videos</h2>
        
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1.5 text-sm h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        
          {/* Filter Dropdown */}
          <div className="relative z-10 flex items-center gap-2 p-0.5 bg-white/5 border border-white/10 rounded-md">
            <Filter className="w-4 h-4 text-muted-foreground ml-2" />
            <Select
              value={currentFilter}
              onValueChange={(value) => {
                setCurrentFilter(value as FilterType);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <SelectTrigger className="w-[130px] h-9 border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border border-white/10">
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-5">
        <Badge variant="outline" className="text-xs font-normal px-2.5 py-1 bg-white/5 border-white/10 text-foreground/70">
          {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} found
        </Badge>
      </div>

      {paginatedVideos.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white/5 border border-white/10 hover:bg-white/10"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white/5 border border-white/10 hover:bg-white/10"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-white/5 backdrop-blur-sm rounded-lg border border-dashed border-white/10 shadow-inner">
          <div className="rounded-full bg-white/5 p-5 mb-3">
            <SearchX className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            {currentFilter === "all" 
              ? "No videos created yet. Start by creating your first video!"
              : `No ${currentFilter} videos found.`}
          </p>
          <Button 
            onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}
            className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-700/20 border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Video
          </Button>
        </div>
      )}
    </div>
  );
}; 