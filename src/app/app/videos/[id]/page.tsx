"use client";

import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Video, Share2, Download, Upload, Settings, Edit2, Save, X, Plus } from "lucide-react";
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

  const onGenerate = async () => {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error triggering video generation:", error);
      } else {
        console.error("Error triggering video generation:", error);
      }
    }
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
          <Link href={ROUTES.PAGES.APP.DASHBOARD.INDEX}>
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
  if (video.status === "assets:ready" || video.status === "render:complete" || video.status === "render:error") {
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
            <Link href={ROUTES.PAGES.APP.DASHBOARD.INDEX} className="flex items-center">
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
                onGenerate={video.status === "draft" ? onGenerate : undefined}
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
            <div className="bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden">
              <div className="w-full aspect-[9/16] bg-black/90">
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
              
              {/* Action buttons */}
              {actionButtons.length > 0 && (
                <div className="p-4 flex flex-wrap gap-2 justify-center">
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
                    <TabsTrigger
                      value="design"
                      className="flex items-center justify-center rounded-md"
                      disabled={video.renderStatus?.statusMessage === "completed"}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </TabsTrigger>
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

                <TabsContent value="design" className="p-5 pt-0 border-t border-border/20">
                  <div className="space-y-5">
                    <CollapsibleSection
                      id="design"
                      title="Design Style"
                      isOpen={openSection === "design"}
                      onToggle={(id) => setOpenSection(id)}
                    >
                      <TextDesignSelector disabled={isProcessingStory} />
                    </CollapsibleSection>
                    
                    <CollapsibleSection
                      id="textOptions"
                      title="Text Options"
                      isOpen={openSection === "textOptions"}
                      onToggle={(id) => setOpenSection(id)}
                    >
                      <TextOptions
                        textPosition={textPosition}
                        onTextPositionChange={setTextPosition}
                        showTitle={showTitle}
                        onShowTitleChange={setShowTitle}
                        disabled={isProcessingStory}
                      />
                    </CollapsibleSection>
                    
                    <CollapsibleSection
                      id="music"
                      title="Music Selection"
                      isOpen={openSection === "music"}
                      onToggle={(id) => setOpenSection(id)}
                    >
                      <MusicSelector disabled={isProcessingStory} />
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
    </div>
  );
}
