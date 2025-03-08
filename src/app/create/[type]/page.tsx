"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useVoices } from "@/hooks/data/useVoices";
import { ContentTypeDetails } from "@/app/create/[type]/ContentTypeDetails.component";
import { VoiceSelector } from "@/components/VoiceSelector.component";
import { SceneEditor } from "@/app/create/[type]/SceneEditor.component";
import { useAuth } from "@/hooks/useAuth";

// Define validation schema for form
const storySchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  description: z.string().min(10, "Description is required").max(500),
  voiceId: z.string().min(1, "Voice selection is required"),
  scenes: z
    .array(
      z.object({
        narration: z.string().min(5, "Narration is required"),
        imagePrompt: z.string().min(5, "Image prompt is required"),
      }),
    )
    .nonempty("At least one scene is required"),
});

type StoryFormValues = z.infer<typeof storySchema>;

interface ContentType {
  id: string;
  title: string;
  description: string;
  prompt?: string;
}

export default function VideoGenerationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { type } = useParams();
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: "",
      description: "",
      voiceId: "",
      scenes: [],
    },
  });

  useEffect(() => {
    if (!type) {
      setLoading(false);
      return;
    }
    const fetchContentType = async () => {
      const docRef = doc(db, "contentTypes", type as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedContentType(docSnap.data() as ContentType);
      } else {
        setSelectedContentType(null);
      }
      setLoading(false);
    };
    fetchContentType();
  }, [type]);

  // Handle AI Story Generation (calls your /api/openai/story route)
  const handleGenerateStory = async () => {
    if (!selectedContentType) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/openai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: selectedContentType.title,
          customPrompt: selectedContentType.prompt || "",
          uid: user?.uid,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate story.");
      }
      const { story, videoId } = await response.json();
      setVideoId(videoId);
      setValue("title", story.title);
      setValue("description", story.description);
      setValue("scenes", story.scenes);
    } catch (error) {
      console.error("Failed to generate story:", error);
    }
    setIsGenerating(false);
  };

  // Handle video creation by sending the form data and videoId to your API route
  const handleGenerateVideo = async (data: StoryFormValues) => {
    setIsGenerating(true);
    try {
      if (videoId) {
        // Pass both the videoId and form data to the API route so it can update the video doc
        const response = await fetch("/api/video/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, ...data }),
        });
        if (!response.ok) {
          throw new Error("Failed to update video.");
        }
        router.push(`/videos/${videoId}`);
      }
    } catch (error) {
      console.error("Failed to update video:", error);
    }
    setIsGenerating(false);
  };

  return (
    <div className="container py-8 px-4 md:px-8 space-y-8">
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
          <span className="text-lg font-medium">Loading Content Type...</span>
        </div>
      ) : selectedContentType ? (
        <>
          <ContentTypeDetails contentType={selectedContentType} />

          <form
            onSubmit={handleSubmit(handleGenerateVideo)}
            className="space-y-6"
          >
            <Card className="p-6 space-y-4">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <h3 className="text-xl font-semibold">Story Details</h3>
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
              </div>

              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input placeholder="Story title..." {...field} />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <Textarea placeholder="Story description..." {...field} />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {voicesLoading ? (
                <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
              ) : voicesError ? (
                <p className="text-red-500">{voicesError}</p>
              ) : (
                <Controller
                  name="voiceId"
                  control={control}
                  render={({ field }) => (
                    <div>
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
                    </div>
                  )}
                />
              )}

              <Controller
                name="scenes"
                control={control}
                render={({ field }) => (
                  <div>
                    <SceneEditor
                      scenes={field.value}
                      onUpdateScenes={field.onChange}
                    />
                    {errors.scenes && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.scenes.message}
                      </p>
                    )}
                  </div>
                )}
              />
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
        </>
      ) : (
        <h1 className="text-4xl font-bold text-destructive">
          Content Type Not Found
        </h1>
      )}
    </div>
  );
}
