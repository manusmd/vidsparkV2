"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useStoryIdea } from "@/hooks/data/useStoryIdea";
import { Loader2 } from "lucide-react";
import { ContentTypeDetails } from "@/app/app/create/[type]/ContentTypeDetails.component";
import { NarrationForm } from "@/app/app/create/[type]/forms/NarrationForm.component";
import LoadingOverlay from "@/app/app/create/[type]/StoryLoadingOverlay.component";
import { ContentType, VideoType } from "@/app/types";
import { useStory } from "@/hooks/data/useStory";
import { useVideoTypes } from "@/hooks/data/useVideoTypes";
import { VideoTypeSelector } from "@/components/video/VideoTypeSelector.component";
import { VoiceSelector } from "@/components/video/VoiceSelector.component";
import { useVoices } from "@/hooks/data/useVoices";
import { Button } from "@/components/ui/button";

export default function VideoGenerationPage() {
  const { user } = useAuth();
  const { type } = useParams();
  const { contentTypes, loading: contentTypesLoading } = useContentTypes();
  const { storyIdea, isGenerating, generateStoryIdea } = useStoryIdea();
  const { generateStory, isGenerating: isStoryGenerating } = useStory();
  const {
    videoTypes,
    loading: videoTypesLoading,
    error: videoTypesError,
  } = useVideoTypes();
  const { voices } = useVoices();

  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  const [selectedVideoType, setSelectedVideoType] = useState<VideoType | null>(
    null,
  );
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // When content type is loaded, update selectedVoice if recommendedVoiceId exists.
  useEffect(() => {
    if (selectedContentType?.recommendedVoiceId) {
      setSelectedVoice(selectedContentType.recommendedVoiceId);
    }
  }, [selectedContentType]);

  useEffect(() => {
    if (!contentTypesLoading && contentTypes.length > 0) {
      const found = contentTypes.find((ct) => ct.id === type);
      setSelectedContentType(found || null);
    }
  }, [type, contentTypes, contentTypesLoading]);

  const handleGenerateNarration = async () => {
    if (!user || !selectedContentType?.prompt) return;
    try {
      await generateStoryIdea(selectedContentType.prompt);
    } catch (error) {
      console.error("Error generating story idea:", error);
    }
  };

  const handleNextFromNarration = async () => {
    setStep(2);
  };

  const handleVideoTypeSelect = (videoTypeId: string) => {
    const vt = videoTypes.find((v) => v.id === videoTypeId) || null;
    setSelectedVideoType(vt);
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await generateStory({
        narration: storyIdea,
        imageType: selectedVideoType?.imagePrompt || "",
        voiceId: selectedVoice,
      });
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [step, setStep] = useState<number>(1);

  if (contentTypesLoading || videoTypesLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
        <span className="text-lg font-medium">Loading...</span>
      </div>
    );
  }

  if (!selectedContentType) {
    return (
      <h1 className="text-4xl font-bold text-destructive">
        Content Type Not Found
      </h1>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 space-y-6">
      <ContentTypeDetails contentType={selectedContentType} />
      {isGenerating && <LoadingOverlay />}
      {step === 1 && (
        <NarrationForm
          onNext={handleNextFromNarration}
          onGenerateStory={handleGenerateNarration}
          generating={isGenerating || isStoryGenerating}
          initialNarration={storyIdea || ""}
        />
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mt-4">Select Voice</h2>
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={handleVoiceSelect}
            availableVoices={voices}
          />
          <h2 className="text-xl font-semibold mb-4">Select Video Type</h2>
          <VideoTypeSelector
            value={selectedVideoType?.id || null}
            onChange={handleVideoTypeSelect}
            videoTypes={videoTypes}
            loading={videoTypesLoading}
            error={videoTypesError}
          />
          <div className="flex justify-between mt-4">
            <Button onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Generating...</span>
                </span>
              ) : (
                "Generate Video"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
