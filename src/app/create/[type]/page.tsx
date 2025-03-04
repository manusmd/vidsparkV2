"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
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

// ✅ Define validation schema for form
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
  const { type } = useParams();
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story.");
      }

      const { story } = await response.json();

      setValue("title", story.title);
      setValue("description", story.description);
      setValue("scenes", story.scenes);
    } catch (error) {
      console.error("Failed to generate story:", error);
    }
    setIsGenerating(false);
  };

  const handleGenerateVideo = async (data: StoryFormValues) => {
    setIsGenerating(true);

    try {
      // ✅ Initialize status fields for scenes
      const initialSceneStatus = Object.fromEntries(
        data.scenes.map((_, index) => [
          index,
          { statusMessage: "pending", progress: 0 },
        ]),
      );

      // ✅ Prepare the video document
      const videoData = {
        ...data,
        status: "processing:voices", // Initial processing stage
        sceneStatus: initialSceneStatus,
        imageStatus: initialSceneStatus,
        voiceStatus: initialSceneStatus,
        createdAt: new Date(),
      };

      // ✅ Add video to 'videos' collection
      const videoRef = await addDoc(collection(db, "videos"), videoData);

      // ✅ Add video ID to 'pendingVideos' collection
      await addDoc(collection(db, "pendingVideos"), {
        videoId: videoRef.id,
        createdAt: new Date(),
      });

      // ✅ Navigate to video details page
      router.push(`/videos/${videoRef.id}`);
    } catch (error) {
      console.error("Failed to create video:", error);
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

              {/* Title Field with Error */}
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

              {/* Description Field with Error */}
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

              {/* Voice Selector with Error */}
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

              {/* Scene Editor with Error */}
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
