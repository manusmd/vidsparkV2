"use client";

import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Video, Share2, Download, Upload, Settings, Edit2, Save, X, Info, Film, ChevronRight, FileCheck, BookmarkPlus } from "lucide-react";
import ROUTES from "@/lib/routes";
import { ProgressSteps } from "@/components/video/ProgressSteps.component";
import { VideoInfo } from "@/components/video/VideoInfo.component";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";
import { SceneList } from "@/components/video/SceneList.component";
import { VideoPreview } from "@/components/remotion/VideoPreview.component";
import { VideoProcessingStatus } from "@/components/video/VideoProccessingStatus.component";
import { TextDesignSelector } from "@/components/remotion/TextDesignSelector.component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { CollapsibleSection } from "@/components/layout/CollapsibleSection.component";
import { TextOptions } from "@/components/video/TextOptions.component";
import { MusicSelector } from "@/components/video/MusicSelector.component";
import { useMusic, MusicProvider } from "@/providers/useMusic";
import { TextDesignProvider } from "@/hooks/useTextDesign";
import { YoutubeUploadModal } from "@/components/modals/YouTubeUploadModal.component";
import { useAccounts } from "@/hooks/data/useAccounts";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTemplates } from "@/hooks/data/useTemplates";
import SaveTemplateDialog from "@/app/app/studio/[type]/SaveTemplateDialog.component";

function VideoDetailPageContent() {
  const { id } = useParams();
  const { musicUrl, musicVolume } = useMusic();
  const { accounts } = useAccounts();
  const { 
    video, 
    steps, 
    loading, 
    error, 
    stableAssets, 
    uploadToYoutube,
    updateVideoDetails,
  } = useVideoDetail(id as string);
  const { templates } = useTemplates();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState<boolean>(true);
  const [textPosition, setTextPosition] = useState<string>("top");
  const [currentTab, setCurrentTab] = useState("scenes");

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isEditingScenes, setIsEditingScenes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for YouTube Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // State for Generation Confirmation Dialog
  const [confirmGenDialogOpen, setConfirmGenDialogOpen] = useState(false);

  // State for Save Template Dialog
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);

  // Check for YouTube upload status from video
  const hasYoutubeUrl = video?.uploadStatus?.youtube?.videoUrl ? true : false;

  // Fix for YouTubeUploadModal
  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleYoutubeSubmit = async (data: {
    channelId: string;
    publishAt: Date;
    timezone: string;
    privacy: "public" | "private" | "unlisted";
  }) => {
    try {
      await uploadToYoutube({
        ...data,
        publishAt: data.publishAt.toISOString()
      });
    } catch (error) {
      console.error("Error uploading to YouTube:", error);
    }
  };

  // Initialize edit fields when video data loads
  useEffect(() => {
    if (video) {
      setEditTitle(video.title);
      setEditDescription(video.description);
      
      // If video was created from a template, template-specific settings may be in the video object
      if (video.templateId) {
        // Apply template settings if we have them
        const template = templates?.find(t => t.id === video.templateId);
        if (template) {
          setTextPosition(template.textPosition);
          setShowTitle(template.showTitle);
        }
      }
      
      // Turn off editing modes if video status is not draft
      if (video.status !== "draft") {
        setIsEditMode(false);
        setIsEditingScenes(false);
      }
    }
  }, [video, templates]);

  // When render is complete, if the current tab is "design", switch to "scenes"
  useEffect(() => {
    if (
      video?.renderStatus?.statusMessage === "completed" &&
      currentTab === "design"
    ) {
      setCurrentTab("scenes");
    }
  }, [video, currentTab]);

  // onUpload opens the YouTube Upload Modal.
  const onUpload = () => {
    setUploadModalOpen(true);
  };

  // Save video details
  const saveVideoDetails = async () => {
    if (!video) return;
    
    setIsSaving(true);
    try {
      await updateVideoDetails(editTitle, editDescription);
      toast.success("Video details updated successfully");
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving video details:", error);
      toast.error("Failed to save video details");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    if (video) {
      setEditTitle(video.title);
      setEditDescription(video.description);
    }
    setIsEditMode(false);
  };

  // onRender and onGenerate are implemented as needed.
  const onRender = async () => {
    try {
      const response = await fetch(ROUTES.API.VIDEO.RENDER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video?.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to trigger video rendering");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error triggering video rendering:", err);
      } else {
        console.error("Error triggering video rendering:", err);
      }
    }
  };

  // Show confirmation dialog instead of immediately generating
  const showGenerationConfirmation = () => {
    setConfirmGenDialogOpen(true);
  };

  // Handle actual video generation after confirmation
  const onGenerate = async () => {
    setConfirmGenDialogOpen(false);
    try {
      const response = await fetch(ROUTES.API.VIDEO.GENERATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video?.id,
          title: video?.title,
          description: video?.description,
          voiceId: video?.voiceId,
          scenes: video?.scenes,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to trigger video generation",
        );
      }
      toast.success("Video generation has started");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error triggering video generation:", error);
        toast.error("Failed to start video generation");
      } else {
        console.error("Error triggering video generation:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  // Update the toggle function to properly collapse sections
  const toggleSection = (sectionId: string) => {
    setOpenSection(prevSection => prevSection === sectionId ? null : sectionId);
  };

  // Add renderInfoSection function
  const renderInfoSection = () => {
    if (!video) return null;
    
    // Find the template if the video was created from one
    const template = video.templateId && templates ? 
      templates.find(t => t.id === video.templateId) : null;
    
    return (
      <div className="mb-8">
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-4">
          <div className="p-5">
            {isEditMode ? (
              // Edit mode UI
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-1"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveVideoDetails}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              // Display mode UI
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {video.description}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {video.renderStatus?.statusMessage === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex gap-1.5 items-center"
                        onClick={() => setShowTemplateDialog(true)}
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        Save as Template
                      </Button>
                    )}
                    {video.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditMode(true)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Get YouTube status from video if available
  const typedVideo = video as { youtubeUploadStatus?: string };
  const youtubeUploadStatus = typedVideo?.youtubeUploadStatus || "not_started";
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary mb-4" />
        <p className="text-lg font-medium">Loading your video...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="rounded-full bg-red-500/20 p-4">
          <Video className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-destructive">
          {error || "Video not found."}
        </h1>
        <Button asChild variant="outline">
          <Link href="/app/dashboard/vidspark">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Prepare action buttons
  const actionButtons = [];
  
  // If video is ready, show download button
  if (video.renderStatus?.statusMessage === "completed" && video.renderStatus?.videoUrl) {
    actionButtons.push(
      <Button
        key="download"
        size="sm"
        variant="outline"
        className="flex gap-1.5 items-center"
        asChild
      >
        <a href={video.renderStatus.videoUrl} download target="_blank" rel="noopener noreferrer">
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </Button>
    );
    
    // Only show share button if there's a video URL
    actionButtons.push(
      <Button
        key="share"
        size="sm"
        variant="outline"
        className="flex gap-1.5 items-center"
        onClick={() => {
          if (navigator.share && video.renderStatus?.videoUrl) {
            navigator.share({
              title: video.title,
              text: "Check out this video I made with VidSpark!",
              url: video.renderStatus.videoUrl,
            }).catch(err => console.error("Error sharing:", err));
          } else if (video.renderStatus?.videoUrl) {
            navigator.clipboard.writeText(video.renderStatus.videoUrl);
            toast.success("Video URL copied to clipboard");
          }
        }}
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
    );
    
    // Only show YouTube upload button if not already uploaded
    if (accounts.length > 0 && !hasYoutubeUrl) {
      actionButtons.push(
        <Button
          key="youtube"
          size="sm"
          variant="outline"
          className="flex gap-1.5 items-center"
          onClick={onUpload}
          disabled={video?.uploadStatus?.youtube?.progress ? 
            (video.uploadStatus.youtube.progress > 0 && video.uploadStatus.youtube.progress < 100) : false}
        >
          <Upload className="h-3.5 w-3.5" />
          {video?.uploadStatus?.youtube?.progress ? 
            (video.uploadStatus.youtube.progress > 0 && video.uploadStatus.youtube.progress < 100 ? "Uploading..." : "YouTube") 
            : "YouTube"}
        </Button>
      );
    }
  }

  return (
    <>
      <YoutubeUploadModal
        open={uploadModalOpen}
        onClose={handleCloseUploadModal}
        onSubmit={handleYoutubeSubmit}
        channels={accounts}
      />
      
      <Dialog open={confirmGenDialogOpen} onOpenChange={setConfirmGenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Video</DialogTitle>
            <DialogDescription>
              This will start the video generation process. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmGenDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onGenerate}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {showTemplateDialog && video && (
        <SaveTemplateDialog
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
          contentType={{
            id: video.contentTypeId || "",
            title: "",
            description: "",
            examples: []
          }}
          imageType={{
            id: video.imageStyleId || "",
            title: "",
            description: "",
            imagePrompt: "",
            prompt: "",
            imageUrl: ""
          }}
          voiceId={video.voiceId}
          narration={video.narration || ""}
          onSaved={() => {
            toast.success("Template Saved", {
              description: "Your template has been saved successfully"
            });
          }}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {renderInfoSection()}

        {/* Processing steps and Video info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-full"
          >
            <div className="h-full">
              <ProgressSteps
                steps={steps}
                video={video}
                onGenerate={video.status === "draft" ? showGenerationConfirmation : undefined}
                onRender={onRender}
                onUpload={onUpload}
                className="h-full flex flex-col"
              />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="h-full"
          >
            <VideoInfo video={video} className="h-full flex flex-col" />
          </motion.div>
        </div>

        {/* Video preview and Scenes/Customize content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Video preview */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-md overflow-hidden">
              <div className="relative">
                {/* Title bar with video information */}
                <div className="p-4 pb-3 bg-gradient-to-b from-card/80 to-card/30 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Film className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Video Preview</h3>
                      <p className="text-xs text-muted-foreground">Mobile aspect ratio (9:16)</p>
                    </div>
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[240px]">
                      <p className="text-xs">
                        This is a preview of how your video will appear on mobile devices.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Video player */}
                <div className="w-full aspect-[9/16] bg-black/95 relative overflow-hidden">
                  {/* Phone frame overlay */}
                  <div className="absolute pointer-events-none inset-0 z-10">
                    <div className="absolute top-0 left-0 right-0 h-3 bg-black rounded-t-xl"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-black rounded-b-xl"></div>
                    <div className="absolute top-1 right-1/2 transform translate-x-1/2 w-16 h-1 rounded-full bg-zinc-800"></div>
                    <div className="absolute inset-0 border-4 border-black rounded-xl pointer-events-none"></div>
                  </div>
                  
                  {/* Video content */}
                  <div className="absolute inset-0 z-0">
                    {video.status === "draft" ||
                    video.status === "processing:assets" ||
                    video.status === "processing:video" ||
                    video.status === "processing:story" ? (
                      <VideoProcessingStatus status={video.status} />
                    ) : (
                      <VideoPreview
                        scenes={stableAssets?.scenes || {}}
                        styling={{
                          variant: (stableAssets?.styling?.variant || video.styling?.variant || "default") as "default",
                          font: (stableAssets?.styling?.font || video.styling?.font || "roboto") as "roboto"
                        }}
                        textPosition={textPosition}
                        showTitle={showTitle}
                        title={video.title}
                        musicVolume={video.musicVolume !== undefined ? video.musicVolume : musicVolume}
                        musicUrl={video.musicUrl || musicUrl}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action buttons with improved styling */}
              {actionButtons.length > 0 && (
                <div className="p-4 border-t border-border/30 bg-gradient-to-b from-card/40 to-card/60 flex flex-wrap gap-2 justify-center">
                  {actionButtons}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Right column: Scenes and customization */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <div className="flex justify-between items-center pr-3">
                  <TabsList className="p-1 px-1.5 m-3 bg-muted/80 w-auto inline-flex">
                    <TabsTrigger value="scenes" className="flex items-center justify-center rounded-md">
                      <Video className="w-4 h-4 mr-2" />
                      Scenes
                    </TabsTrigger>
                    <div className="flex items-center">
                      <TabsTrigger
                        value="design"
                        className="flex items-center justify-center rounded-md"
                        disabled={video.status === "draft" || video.renderStatus?.statusMessage === "completed"}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Customize
                      </TabsTrigger>
                      {video.status === "draft" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="ml-1.5 cursor-help">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            Customization available after video generated
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TabsList>
                </div>

                <TabsContent value="scenes" className="p-5 pt-0 border-t border-border/20">
                  <SceneList 
                    id="scene-list-component"
                    scenes={video.scenes} 
                    loading={video.status === "processing:story"} 
                    isEditing={isEditingScenes}
                    videoId={video.id}
                    onSaveChanges={() => setIsEditingScenes(false)}
                  />
                </TabsContent>

                <TabsContent value="design" className="p-0 border-t border-border/20">
                  <div className="relative p-5 pb-4 bg-gradient-to-b from-muted/50 to-transparent overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full opacity-10">
                      <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMax slice">
                        <g opacity="0.5">
                          <circle cx="110" cy="110" r="100" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8"/>
                          <circle cx="300" cy="200" r="60" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6"/>
                          <circle cx="180" cy="270" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                          <path d="M50,50 Q150,20 250,90 T400,120" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
                          <path d="M20,200 Q120,120 190,190 T380,150" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
                        </g>
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-lg font-medium mb-1">Video Customization</h2>
                      <p className="text-sm text-muted-foreground">Tailor your video&apos;s appearance and style to match your brand</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent opacity-40" />
                  </div>
                  
                  <div className="p-5 pt-3 space-y-4">
                    <div className="mb-3 flex items-center gap-2 text-xs px-2">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                      <span className="text-muted-foreground">Changes appear in the preview in real-time</span>
                    </div>
                    
                    <CollapsibleSection
                      id="design"
                      title="Design Style"
                      description="Choose the visual style for your video's text and captions"
                      isOpen={openSection === "design"}
                      onToggle={toggleSection}
                      icon={<Settings className="w-4 h-4 text-primary" />}
                    >
                      <div className="bg-card/50 rounded-lg p-4 border border-border/30 shadow-sm">
                        <TextDesignSelector disabled={video.status === "processing:story"} />
                      </div>
                    </CollapsibleSection>
                    
                    <CollapsibleSection
                      id="textOptions"
                      title="Text Options"
                      description="Configure text positioning and title visibility"
                      isOpen={openSection === "textOptions"}
                      onToggle={toggleSection}
                      icon={<Edit2 className="w-4 h-4 text-primary" />}
                    >
                      <div className="bg-card/50 rounded-lg p-4 border border-border/30 shadow-sm">
                        <TextOptions
                          textPosition={textPosition}
                          onTextPositionChange={setTextPosition}
                          showTitle={showTitle}
                          onShowTitleChange={setShowTitle}
                          disabled={video.status === "processing:story"}
                        />
                      </div>
                    </CollapsibleSection>
                    
                    <CollapsibleSection
                      id="audio"
                      title="Background Music"
                      description="Add music to your video and adjust volume"
                      isOpen={openSection === "audio"}
                      onToggle={toggleSection}
                      icon={<Edit2 className="w-4 h-4 text-primary" />}
                    >
                      <div className="bg-card/50 rounded-lg p-4 border border-border/30 shadow-sm">
                        <MusicSelector disabled={video.status === "processing:story"} />
                      </div>
                    </CollapsibleSection>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function VideoDetailPage() {
  const { id } = useParams();
  
  if (!id) {
    return <div>Invalid video ID</div>;
  }
  
  return (
    <TextDesignProvider videoId={id as string}>
      <MusicProvider videoId={id as string}>
        <VideoDetailPageContent />
      </MusicProvider>
    </TextDesignProvider>
  );
}
