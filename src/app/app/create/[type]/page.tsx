"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Info, Loader2, Wand2 } from "lucide-react";
import { ContentTypeDetails } from "@/app/app/create/[type]/ContentTypeDetails.component";
import { VoiceSelector } from "@/components/VoiceSelector.component";
import { SceneEditor } from "@/app/app/create/[type]/SceneEditor.component";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useStory } from "@/hooks/data/useStory";
import type { ContentType, VideoType } from "@/app/types";
import { useVoices } from "@/hooks/data/useVoices";
import LoadingOverlay from "@/app/app/create/[type]/StoryLoadingOverlay.component";
import { useVideoTypes } from "@/hooks/data/useVideoTypes";
import { VideoTypeSelector } from "@/components/video/VideoTypeSelector.component";

const sceneSchema = z.object({
  narration: z.string().min(5, "Narration is required"),
  imagePrompt: z.string().min(5, "Image prompt is required"),
});

// Add a new field "videoType" (which will store the imagePrompt from the selected VideoType)
const storySchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  description: z.string().min(10, "Description is required").max(800),
  voiceId: z.string().min(1, "Voice selection is required"),
  customPrompt: z.string().optional(),
  scenes: z.record(sceneSchema),
  videoType: z.string().optional(), // New field for video type (e.g., imagePrompt)
});

type StoryFormValues = z.infer<typeof storySchema>;

export default function VideoGenerationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { type } = useParams();
  const searchParams = useSearchParams();
  const initialCustomPrompt = searchParams.get("prompt") || "";
  const {
    contentTypes,
    loading: contentTypesLoading,
    error: contentTypesError,
  } = useContentTypes();
  const {
    videoTypes,
    loading: videoTypesLoading,
    error: videoTypesError,
  } = useVideoTypes();
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  // New state for the selected video type.
  const [selectedVideoType, setSelectedVideoType] = useState<VideoType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const { story, videoId, isGenerating, generateStory } = useStory();
  const { voices } = useVoices();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: "",
      description: "",
      voiceId: "",
      customPrompt: initialCustomPrompt,
      scenes: {},
      videoType: "", // Initialize videoType field.
    },
  });

  useEffect(() => {
    if (story) {
      setValue("title", story.title);
      setValue("description", story.description);
      setValue("scenes", story.scenes);
    }
  }, [story, setValue]);

  useEffect(() => {
    if (contentTypesLoading) return;
    if (type === "custom") {
      const customContentType: ContentType = {
        id: "custom",
        title: "Custom Story",
        description: "A custom story prompt provided by the user.",
        prompt: initialCustomPrompt,
        examples: [],
        recommendedVoiceId: "",
      };
      setSelectedContentType(customContentType);
      setValue("customPrompt", initialCustomPrompt);
      setLoading(false);
    } else {
      const found = contentTypes.find((ct) => ct.id === type);
      setSelectedContentType(found || null);
      if (found && found.recommendedVoiceId) {
        setValue("voiceId", found.recommendedVoiceId);
      }
      setLoading(false);
    }
  }, [type, initialCustomPrompt, setValue, contentTypes, contentTypesLoading]);

  // When a video type is selected, update both local state and the form's "videoType" field.
  const handleVideoTypeChange = (id: string) => {
    const vt = videoTypes.find((v) => v.id === id) || null;
    setSelectedVideoType(vt);
    // Here, we assume that the "videoType" value should be the imagePrompt.
    setValue("videoType", vt ? vt.prompt : "");
  };

  const handleGenerateStory = async () => {
    if (!selectedContentType || !user) return;
    // Reset the form if there's any content in the title or description fields.
    if (getValues("title") || getValues("description")) {
      reset({
        title: "",
        description: "",
        voiceId: getValues("voiceId"),
        customPrompt: getValues("customPrompt"),
        scenes: {},
        videoType: getValues("videoType"),
      });
    }
    await generateStory({
      contentType: selectedContentType.title,
      customPrompt:
        getValues("customPrompt") || selectedContentType.prompt || "",
      voiceId: getValues("voiceId"),
      uid: user.uid,
      videoType: getValues("videoType") || "", // Now part of the form data.
    });
  };

  const handleGenerateVideo = async (data: StoryFormValues) => {
    if (!videoId) return;
    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, ...data }),
      });
      if (!response.ok) throw new Error("Failed to update video.");
      router.push(`/app/videos/${videoId}`);
    } catch (error) {
      console.error("Failed to update video:", error);
    }
  };

  if (loading || contentTypesLoading || videoTypesLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
        <span className="text-lg font-medium">Loading Content Type...</span>
      </div>
    );
  }

  if (contentTypesError) {
    return <p className="text-red-500">{contentTypesError}</p>;
  }

  if (!selectedContentType) {
    return (
      <h1 className="text-4xl font-bold text-destructive">
        Content Type Not Found
      </h1>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-8 space-y-8">
      <ContentTypeDetails contentType={selectedContentType} />
      {/* VideoTypeSelector receives videoTypes from outside */}
      <VideoTypeSelector
        value={selectedVideoType?.id || null}
        onChange={handleVideoTypeChange}
        videoTypes={videoTypes}
        loading={videoTypesLoading}
        error={videoTypesError}
      />
      <form
        onSubmit={handleSubmit(handleGenerateVideo)}
        className="space-y-6 relative"
      >
        <Card className="p-6 space-y-6 relative">
          {isGenerating && <LoadingOverlay />}
          {/* Heading + Generate Story Row */}
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <h3 className="text-xl font-semibold">Story Details</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerateStory}
                disabled={isGenerating}
                className="w-full md:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating AI Story...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate AI Story
                  </>
                )}
              </Button>
              <div className="relative group inline-block">
                <Info className="w-5 h-5 text-muted-foreground cursor-pointer" />
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-black text-white text-xs rounded shadow-lg z-10">
                  Story generation can take around 1 minute due to the
                  complexity of processing multiple LLM calls and asset
                  generation. Every generated story is saved as a draft in your
                  history.
                </div>
              </div>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block font-semibold text-sm mb-1">Title</label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <>
                  <Input placeholder="Story title..." {...field} />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block font-semibold text-sm mb-1">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <>
                  <Textarea placeholder="Story description..." {...field} />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Custom Prompt Field (only for "custom" type) */}
          {type === "custom" && (
            <div>
              <label className="block font-semibold text-sm mb-1">
                Custom Prompt
              </label>
              <Controller
                name="customPrompt"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Custom story prompt..." {...field} />
                )}
              />
            </div>
          )}

          {/* Voice Selector */}
          <div>
            <label className="block font-semibold text-sm mb-1">Voice</label>
            <Controller
              name="voiceId"
              control={control}
              render={({ field }) => (
                <>
                  <VoiceSelector
                    selectedVoice={field.value}
                    onSelectVoice={field.onChange}
                    availableVoices={voices}
                  />
                  {errors.voiceId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.voiceId.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Scenes */}
          <div>
            <label className="block font-semibold text-sm mb-1">Scenes</label>
            <Controller
              name="scenes"
              control={control}
              render={({ field }) => (
                <>
                  <SceneEditor
                    scenes={field.value}
                    onUpdateScenes={field.onChange}
                  />
                  {errors.scenes && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errors.scenes.message)}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </Card>
        <Button
          type="submit"
          disabled={isSubmitting || isGenerating}
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Generate Video
        </Button>
      </form>
    </div>
  );
}
