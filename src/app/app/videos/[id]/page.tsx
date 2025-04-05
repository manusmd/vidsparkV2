"use client";

import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Video, Share2, Download, Upload, Settings, Edit2, Save, X, Plus, Info, Film } from "lucide-react";
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
import { useMusic } from "@/providers/useMusic";
import { YoutubeUploadModal } from "@/components/modals/YouTubeUploadModal.component";
import { useAccounts } from "@/hooks/data/useAccounts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function VideoDetailPage() {
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
    updateScenes,
    addScene
  } = useVideoDetail(id as string);
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

  // Initialize edit fields when video data loads
  useEffect(() => {
    if (video) {
      setEditTitle(video.title);
      setEditDescription(video.description);
      
      // Turn off editing modes if video status is not draft
      if (video.status !== "draft") {
        setIsEditMode(false);
        setIsEditingScenes(false);
      }
    }
  }, [video]);

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

  const isProcessingStory = video.status === "processing:story";
  const isEditingDisabled = video.status !== "draft";

  // Prepare action buttons
  const actionButtons = [];
  
  // Download button
  if (video.renderStatus?.videoUrl) {
    actionButtons.push(
      <Button 
        key="download"
        variant="outline"
        onClick={() => window.open(video.renderStatus?.videoUrl, "_blank")}
        className="flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Video
      </Button>
    );
  }
  
  // Upload to YouTube button
  if (video.status === "render:complete") {
    actionButtons.push(
      <Button 
        key="upload"
        variant="outline"
        onClick={onUpload}
        className="flex items-center"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload to YouTube
      </Button>
    );
  }
  
  // Share button (disabled for now)
  actionButtons.push(
    <Button 
      key="share"
      variant="outline"
      disabled
      className="flex items-center opacity-50"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Back button and status badge */}
      <div className="w-full bg-background/60 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" asChild size="sm">
            <Link href="/app/dashboard/vidspark" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          {!isEditingDisabled && (
            <div>
              {isEditMode ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelEdit}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={saveVideoDetails}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit Video
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          {isEditMode ? (
            <div className="space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Video title"
                className="text-xl font-semibold"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Video description"
                className="resize-none h-24"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{video.title}</h1>
              <p className="text-muted-foreground mt-1">{video.description}</p>
            </>
          )}
        </motion.div>

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
                    isProcessingStory ? (
                      <VideoProcessingStatus status={video.status} />
                    ) : (
                      <VideoPreview
                        scenes={stableAssets?.scenes || {}}
                        styling={stableAssets?.styling || {}}
                        textPosition={textPosition}
                        showTitle={showTitle}
                        title={video.title}
                        musicVolume={musicVolume}
                        musicUrl={musicUrl}
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
                  
                  {currentTab === "scenes" && !isEditingDisabled && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isEditingScenes) {
                            // When switching from edit mode to normal mode, save changes
                            const sceneListElement = document.getElementById('scene-list-component');
                            if (sceneListElement) {
                              // Trigger save through a custom event
                              const saveEvent = new CustomEvent('save-scenes');
                              sceneListElement.dispatchEvent(saveEvent);
                            }
                          }
                          setIsEditingScenes(!isEditingScenes);
                        }}
                        className="text-xs"
                        disabled={isSaving}
                      >
                        {isEditingScenes ? (
                          <>
                            <Save className="w-3.5 h-3.5 mr-1" />
                            {isSaving ? 'Saving...' : 'Done Editing'}
                          </>
                        ) : (
                          <>
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Edit Scenes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <TabsContent value="scenes" className="p-5 pt-0 border-t border-border/20">
                  <SceneList 
                    id="scene-list-component"
                    scenes={video.scenes} 
                    loading={isProcessingStory} 
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
                      <p className="text-sm text-muted-foreground">Tailor your video's appearance and style to match your brand</p>
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
                        <TextDesignSelector disabled={isProcessingStory} />
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
                          disabled={isProcessingStory}
                        />
                      </div>
                    </CollapsibleSection>
                    
                    <CollapsibleSection
                      id="music"
                      title="Music Selection"
                      description="Add background music to enhance your video"
                      isOpen={openSection === "music"}
                      onToggle={toggleSection}
                      icon={<svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>}
                    >
                      <div className="bg-card/50 rounded-lg p-4 border border-border/30 shadow-sm">
                        <MusicSelector disabled={isProcessingStory} />
                      </div>
                    </CollapsibleSection>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* YouTube Upload Modal */}
      <YoutubeUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={async (data) => {
          try {
            // Convert publishAt (Date) to an ISO string
            const uploadData = {
              ...data,
              publishAt: data.publishAt.toISOString(),
            };
            await uploadToYoutube(uploadData);
          } catch (err) {
            console.error("Upload to YouTube failed:", err);
          }
        }}
        channels={accounts}
      />

      {/* Video Generation Confirmation Dialog */}
      <Dialog open={confirmGenDialogOpen} onOpenChange={setConfirmGenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Video</DialogTitle>
            <DialogDescription>
              You are about to generate your video. This will lock the structure of your content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <h3 className="text-sm font-medium text-amber-900">Important Information</h3>
              <ul className="mt-2 text-sm text-amber-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Once you generate the video, you <strong>cannot edit</strong> the script structure or scene texts anymore.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You will still be able to customize appearance, text design, and music after generation.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Please carefully review your content before proceeding.</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setConfirmGenDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={onGenerate}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Generate Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
