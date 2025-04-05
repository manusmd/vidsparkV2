"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useStoryIdea } from "@/hooks/data/useStoryIdea";
import { Loader2, ArrowLeft, ArrowRight, Save, Sparkles } from "lucide-react";
import { ContentTypeDetails } from "@/app/app/studio/[type]/ContentTypeDetails.component";
import { NarrationForm } from "@/app/app/studio/[type]/forms/NarrationForm.component";
import LoadingOverlay from "@/app/app/studio/[type]/StoryLoadingOverlay.component";
import VideoGenerationOverlay from "@/app/app/studio/[type]/VideoGenerationOverlay.component";
import { ContentType, ImageType } from "@/app/types";
import { useStory } from "@/hooks/data/useStory";
import { useImageTypes } from "@/hooks/data/useImageTypes";
import { ImageTypeSelector } from "@/components/image/ImageTypeSelector.component";
import { VoiceSelector } from "@/components/video/VoiceSelector.component";
import { useVoices } from "@/hooks/data/useVoices";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import ROUTES from "@/lib/routes";

const steps = [
  { id: 1, name: "Narration" },
  { id: 2, name: "Style & Voice" },
];

export default function VideoGenerationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { type } = useParams();
  const { contentTypes, loading: contentTypesLoading } = useContentTypes();
  const { storyIdea, isGenerating, generateStoryIdea } = useStoryIdea();
  const { generateStory, isGenerating: isStoryGenerating, videoId } = useStory({ skipNavigation: true });
  const {
    imageTypes,
    loading: imageTypesLoading,
    error: imageTypesError,
  } = useImageTypes();
  const { voices } = useVoices();

  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<ImageType | null>(
    null,
  );
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showVideoGenerationOverlay, setShowVideoGenerationOverlay] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);

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

  useEffect(() => {
    if (videoId && !createdVideoId) {
      setCreatedVideoId(videoId);
    }
  }, [videoId, createdVideoId]);

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

  const handleImageTypeSelect = (imageTypeId: string) => {
    const it = imageTypes.find((i) => i.id === imageTypeId) || null;
    setSelectedImageType(it);
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Show the video generation overlay
      setShowVideoGenerationOverlay(true);
      
      // Generate the story in the background
      await generateStory({
        narration: storyIdea,
        imageType: selectedImageType?.imagePrompt || "",
        voiceId: selectedVoice,
      });
      
      // The navigation will happen after the overlay animation completes
      
    } catch (error) {
      console.error("Error generating story:", error);
      setShowVideoGenerationOverlay(false);
      setIsSubmitting(false);
      // Show an error message to the user
      alert("There was an error generating your video. Please try again.");
    }
  };
  
  const handleVideoGenerationComplete = () => {
    setIsSubmitting(false);
    setShowVideoGenerationOverlay(false);
    
    if (createdVideoId) {
      router.push(ROUTES.PAGES.APP.VIDEOS.DETAIL(createdVideoId));
    } else {
      router.push(ROUTES.PAGES.APP.DASHBOARD.INDEX);
    }
  };

  if (contentTypesLoading || imageTypesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-6 h-6 text-primary mr-2" />
        <span className="text-lg font-medium">Loading...</span>
      </div>
    );
  }

  if (!selectedContentType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-3xl font-bold text-destructive">Content Type Not Found</h1>
        <Button onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Content Types
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 relative">
      {/* Video Generation Overlay */}
      {showVideoGenerationOverlay && (
        <VideoGenerationOverlay 
          onComplete={handleVideoGenerationComplete} 
          isProcessing={isStoryGenerating}
        />
      )}
      
      {/* Back button and page title */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Video</h1>
          <p className="text-muted-foreground">Generate your AI-powered video in two simple steps</p>
        </div>
      </div>
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xs mx-auto mb-2">
          {steps.map((s, i) => (
            <div 
              key={s.id} 
              className="flex flex-col items-center"
            >
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                } mb-2`}
              >
                {s.id}
              </div>
              <span className={`text-sm ${step >= s.id ? "font-medium" : "text-muted-foreground"}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-muted rounded-full max-w-xs mx-auto">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      {/* Content type info and badge */}
      <div className="mb-6">
        <ContentTypeDetails contentType={selectedContentType} />
      </div>
      
      {isGenerating && <LoadingOverlay />}
      
      {/* Step 1: Narration */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <NarrationForm
            onNext={handleNextFromNarration}
            onGenerateStory={handleGenerateNarration}
            generating={isGenerating || isStoryGenerating}
            initialNarration={storyIdea || ""}
          />
        </motion.div>
      )}
      
      {/* Step 2: Styling and Voice */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm mr-2">1</span>
                Select Voice
              </h2>
              <VoiceSelector
                selectedVoice={selectedVoice}
                onSelectVoice={handleVoiceSelect}
                availableVoices={voices}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm mr-2">2</span>
                Select Image Style
              </h2>
              <ImageTypeSelector
                value={selectedImageType?.id || null}
                onChange={handleImageTypeSelect}
                imageTypes={imageTypes}
                loading={imageTypesLoading}
                error={imageTypesError}
              />
            </div>
            
            <div className="pt-4 border-t flex justify-between">
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Narration
              </Button>
              
              <Button 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting || !selectedVoice || !selectedImageType}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Generate Video
                  </span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
