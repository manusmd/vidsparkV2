"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useImageTypes } from "@/hooks/data/useImageTypes";
import { useTemplates } from "@/hooks/data/useTemplates";
import { useVoices } from "@/hooks/data/useVoices";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useStoryIdea } from "@/hooks/data/useStoryIdea";
import { Loader2, ArrowLeft, Sparkles, BookmarkPlus } from "lucide-react";
import { ContentTypeDetails } from "@/app/app/studio/[type]/ContentTypeDetails.component";
import { NarrationForm } from "@/app/app/studio/[type]/forms/NarrationForm.component";
import { ImageTypeSelector } from "@/components/image/ImageTypeSelector.component";
import TemplateInfoBanner from "@/app/app/studio/[type]/TemplateInfoBanner.component";
import { VoiceSelector } from "@/components/video/VoiceSelector.component";
import { Button } from "@/components/ui/button";
import { useTextDesign } from "@/hooks/useTextDesign";
import ROUTES from "@/lib/routes";
import { toast } from "@/components/ui/use-toast";
import { ContentType, ImageType, VideoTemplate } from "@/app/types";
import { useStory } from "@/hooks/data/useStory";
import { useMusic } from "@/providers/useMusic";
import { motion } from "framer-motion";
import VideoGenerationOverlay from "@/app/app/studio/[type]/VideoGenerationOverlay.component";
import SaveTemplateDialog from "@/app/app/studio/[type]/SaveTemplateDialog.component";
import { TextDesignVariant } from "@/components/remotion/textDesigns";

const steps = [
  { id: 1, name: "Narration" },
  { id: 2, name: "Style & Voice" },
];

export default function VideoGenerationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { type } = useParams();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  const { contentTypes, loading: contentTypesLoading } = useContentTypes();
  const { storyIdea, isGenerating, generateStoryIdea } = useStoryIdea();
  const { generateStory, isGenerating: isStoryGenerating, videoId } = useStory({ skipNavigation: true });
  const {
    imageTypes,
    loading: imageTypesLoading,
    error: imageTypesError,
  } = useImageTypes();
  const { voices } = useVoices();
  const { templates, loading: templatesLoading } = useTemplates();
  const { setStyling } = useTextDesign();
  const { setMusicUrl } = useMusic();

  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<ImageType | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showVideoGenerationOverlay, setShowVideoGenerationOverlay] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  
  // Add ref to track if we've already loaded the template
  const templateLoadedRef = useRef<string | null>(null);

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId && !templatesLoading && templates.length > 0 && templateLoadedRef.current !== templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Mark this template as loaded to prevent infinite re-renders
        templateLoadedRef.current = templateId;
        
        // Store the selected template
        setSelectedTemplate(template);
        
        // Set voice from template
        setSelectedVoice(template.voiceId);
        
        // Set default narration if available
        if (template.defaultNarration) {
          generateStoryIdea(template.defaultNarration);
        }
        
        // Find and set image type from template
        const imageType = imageTypes.find(i => i.id === template.imageStyleId);
        if (imageType) {
          setSelectedImageType(imageType);
        }
        
        // Update text styling if template has it
        if (template.textDesign) {
          setStyling({
            variant: template.textDesign.styleId as TextDesignVariant,
            font: template.textDesign.fontId as "roboto" | "lato" | "caveat" | "playfair" | "dancingScript",
          });
        }
        
        // Set music (will need to be handled by your music context)
        if (template.musicId) {
          // Example - adapt to your context implementation
          setMusicUrl(template.musicId);
        }
        
        // Show success toast
        toast("Template Loaded", {
          description: `"${template.name}" settings have been applied to your video`
        });
      }
    }
  }, [templateId, templates, templatesLoading, imageTypes, generateStoryIdea, setMusicUrl, setStyling]);

  // When content type is loaded, update selectedVoice if recommendedVoiceId exists.
  useEffect(() => {
    if (selectedContentType?.recommendedVoiceId && !templateId) {
      setSelectedVoice(selectedContentType.recommendedVoiceId);
    }
  }, [selectedContentType, templateId]);

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
        // Include template properties if a template is selected
        ...(selectedTemplate ? {
          templateId: selectedTemplate.id,
          textDesign: selectedTemplate.textDesign,
          textPosition: selectedTemplate.textPosition,
          showTitle: selectedTemplate.showTitle,
          musicId: selectedTemplate.musicId,
        } : {})
      });
      
      // Update template's lastUsedAt if using a template
      if (selectedTemplate) {
        try {
          // This would be handled by a separate API call in a real implementation
          console.log("Updating template last used timestamp:", selectedTemplate.id);
        } catch (err) {
          console.error("Error updating template usage:", err);
        }
      }
      
      // The navigation will happen after the overlay animation completes
      
    } catch (error) {
      console.error("Error generating story:", error);
      setShowVideoGenerationOverlay(false);
      setIsSubmitting(false);
      // Show an error message to the user
      toast("Video Generation Error", {
        description: "There was an error generating your video. Please try again.",
        style: { backgroundColor: "red" }
      });
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
      
      {/* Template Banner (if template is selected) */}
      {selectedTemplate && (
        <TemplateInfoBanner template={selectedTemplate} />
      )}
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xs mx-auto mb-2">
          {steps.map((s) => (
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
              <span className="text-sm font-medium">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-muted rounded-full max-w-xs mx-auto">
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: step === 1 ? "0%" : "100%" }}
          />
        </div>
      </div>
      
      {/* Step 1: Narration */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <ContentTypeDetails contentType={selectedContentType} />
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generate Narration</h2>
            <NarrationForm 
              onNext={() => handleNextFromNarration()}
              onGenerateStory={handleGenerateNarration}
              generating={isGenerating}
              initialNarration={storyIdea}
            />
          </div>
        </motion.div>
      )}
      
      {/* Step 2: Style & Voice */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Select Image Style</h2>
            <ImageTypeSelector 
              value={selectedImageType?.id || null}
              onChange={handleImageTypeSelect}
              imageTypes={imageTypes}
              loading={imageTypesLoading}
              error={imageTypesError}
            />
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Select Voice</h2>
            <VoiceSelector 
              selectedVoice={selectedVoice}
              onSelectVoice={handleVoiceSelect}
              availableVoices={voices}
            />
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowTemplateDialog(true)}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <BookmarkPlus className="h-4 w-4" />
                Save as Template
              </Button>
              
              <Button 
                onClick={handleFinalSubmit}
                disabled={!selectedImageType || !selectedVoice || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Save Template Dialog */}
      {showTemplateDialog && (
        <SaveTemplateDialog
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
          contentType={selectedContentType}
          imageType={selectedImageType!}
          voiceId={selectedVoice}
          narration={storyIdea}
          onSaved={() => {
            toast("Template Saved", {
              description: "Your template has been saved successfully"
            });
          }}
        />
      )}
    </div>
  );
}
