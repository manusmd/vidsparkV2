"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the schema for the video type form.
const videoTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  prompt: z.string().min(1, "Prompt is required"),
  imagePrompt: z.string().min(1, "Image prompt is required"),
});

// Infer the form data type.
export type VideoTypeFormData = z.infer<typeof videoTypeSchema>;

interface VideoTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VideoTypeFormData, generatedImage: string) => void;
  initialValues: VideoTypeFormData & { imageUrl: string };
}

export function VideoTypeForm({
  open,
  onClose,
  onSubmit,
  initialValues,
}: VideoTypeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<VideoTypeFormData>({
    resolver: zodResolver(videoTypeSchema),
    defaultValues: initialValues,
  });

  const [generatedImage, setGeneratedImage] = useState<string>(
    initialValues.imageUrl || "",
  );
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    reset(initialValues);
    setGeneratedImage(initialValues.imageUrl || "");
  }, [initialValues, reset]);

  const handleGenerateImage = async (data: VideoTypeFormData) => {
    const { title, imagePrompt } = data;
    if (!title || !imagePrompt) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/videotypes/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate image");
      }
      const result = await res.json();
      setGeneratedImage(result.imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
    }
    setGenerating(false);
  };

  const onFormSubmit = (data: VideoTypeFormData) => {
    onSubmit(data, generatedImage);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {initialValues.title ? "Edit Video Type" : "Add New Video Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Input placeholder="Title" {...register("title")} />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
          <Textarea
            placeholder="Prompt for scenes (used later for video generation)"
            {...register("prompt")}
          />
          {errors.prompt && (
            <p className="text-red-500 text-sm">{errors.prompt.message}</p>
          )}
          <Textarea
            placeholder="Image Prompt (used to generate the example image)"
            {...register("imagePrompt")}
          />
          {errors.imagePrompt && (
            <p className="text-red-500 text-sm">{errors.imagePrompt.message}</p>
          )}
          <div className="flex flex-col items-center space-y-2">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated Example"
                className="w-full max-h-96 object-contain rounded border"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center rounded border border-dashed border-muted">
                <span className="text-muted-foreground">
                  No image generated
                </span>
              </div>
            )}
            <Button
              type="button"
              onClick={handleSubmit(handleGenerateImage)}
              disabled={generating || !watch("imagePrompt")}
            >
              {generating ? "Generating..." : "Generate Image"}
            </Button>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialValues.title ? "Save Changes" : "Add Video Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
