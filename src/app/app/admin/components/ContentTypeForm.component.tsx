"use client";

import React, { JSX, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { VoiceSelector } from "@/components/video/VoiceSelector.component";
import type { ContentType, Voice } from "@/app/types";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useContentTypes } from "@/hooks/data/useContentTypes";

// Define a Zod schema for the raw form input.
// "examples" is now an optional array of strings.
export const ContentTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  examples: z.array(z.string()).optional(),
  prompt: z.string().optional(),
  recommendedVoiceId: z.string().optional(),
  imagePrompt: z.string().optional(),
});

// Infer the form values type.
export type ContentTypeFormInputValues = z.infer<typeof ContentTypeSchema>;

// Define empty default values.
const emptyDefaultValues: Partial<ContentTypeFormInputValues> = {
  title: "",
  description: "",
  examples: [],
  prompt: "",
  recommendedVoiceId: "",
  imagePrompt: "",
};

interface ContentTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ContentType>) => void;
  defaultValues?: Partial<ContentTypeFormInputValues> & { imageUrl?: string };
  voices: Voice[];
  voicesLoading: boolean;
  voicesError: string | null;
}

export function ContentTypeForm({
  open,
  onClose,
  onSubmit,
  defaultValues = emptyDefaultValues,
  voices,
  voicesLoading,
  voicesError,
}: ContentTypeFormProps): JSX.Element {

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContentTypeFormInputValues>({
    resolver: zodResolver(ContentTypeSchema),
    defaultValues,
  });
  
  const { generateContentTypeImage } = useContentTypes();
  const [generatedImage, setGeneratedImage] = useState<string>(
    defaultValues.imageUrl || ""
  );
  const [generating, setGenerating] = useState<boolean>(false);

  // Reset the form values when defaultValues changes (for edit mode)
  useEffect(() => {
    reset(defaultValues);
    if (defaultValues.imageUrl) {
      setGeneratedImage(defaultValues.imageUrl);
    } else {
      setGeneratedImage("");
    }
  }, [defaultValues, reset]);
  
  // Handle image generation
  const handleGenerateImage = async () => {
    const imagePrompt = watch("imagePrompt");
    if (!imagePrompt) return;
    
    setGenerating(true);
    try {
      
      const imageUrl = await generateContentTypeImage(imagePrompt);
      
      if (imageUrl && typeof imageUrl === 'string') {
        setGeneratedImage(imageUrl);
      } else {
        console.error("Invalid image URL returned:", imageUrl);
        throw new Error("Received invalid image URL from server");
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setGenerating(false);
    }
  };
  
  // Submit form with generated image
  const handleFormSubmit = (data: ContentTypeFormInputValues) => {
    onSubmit({
      ...data,
      imageUrl: generatedImage,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-black/95 border-zinc-800 shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-medium text-white">
            {defaultValues.title ? "Edit Content Type" : "Add New Content Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-5">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400">Content Details</h3>
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-sm text-zinc-300">Title</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => 
                    <Input 
                      placeholder="Title" 
                      className="bg-zinc-900/90 border-zinc-700 focus-visible:ring-zinc-600 text-white" 
                      {...field} 
                    />
                  }
                />
                {errors.title && (
                  <p className="text-red-400 text-xs">
                    {errors.title.message}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-sm text-zinc-300">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea 
                      placeholder="Description" 
                      className="bg-zinc-900/90 border-zinc-700 focus-visible:ring-zinc-600 text-white resize-none min-h-20" 
                      {...field} 
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-400 text-xs">
                    {errors.description.message}
                  </p>
                )}
              </div>
              
              {/* Examples */}
              <div className="space-y-1.5">
                <label className="block text-sm text-zinc-300">
                  Examples
                </label>
                <Controller
                  name="examples"
                  control={control}
                  render={({ field }) => (
                    <ExamplesInput
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.examples && (
                  <p className="text-red-400 text-xs">
                    {errors.examples.message as string}
                  </p>
                )}
              </div>
              
              {/* Custom AI Prompt */}
              <div className="space-y-1.5">
                <label className="block text-sm text-zinc-300">
                  Custom AI Prompt <span className="text-xs text-zinc-500">(optional)</span>
                </label>
                <Controller
                  name="prompt"
                  control={control}
                  render={({ field }) => (
                    <Textarea 
                      placeholder="Enter prompt for generating content..." 
                      className="bg-zinc-900/90 border-zinc-700 focus-visible:ring-zinc-600 text-white resize-none h-28 min-h-28 overflow-y-auto"
                      {...field} 
                    />
                  )}
                />
              </div>
              
              {/* Recommended Narrator Voice */}
              <div className="space-y-1.5">
                <label className="block text-sm text-zinc-300">
                  Recommended Voice
                </label>
                {voicesLoading ? (
                  <div className="flex items-center space-x-2 text-zinc-400 py-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <p className="text-sm">Loading voices...</p>
                  </div>
                ) : voicesError ? (
                  <p className="text-red-400 text-xs py-1.5">{voicesError}</p>
                ) : (
                  <Controller
                    name="recommendedVoiceId"
                    control={control}
                    render={({ field }) => (
                      <VoiceSelector
                        selectedVoice={field.value || ""}
                        onSelectVoice={(voiceId) => field.onChange(voiceId)}
                        availableVoices={voices}
                      />
                    )}
                  />
                )}
              </div>
            </div>
            
            {/* Image Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400">Image Generation</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-zinc-300">
                    Image Prompt <span className="text-xs text-zinc-500">(for AI image generation)</span>
                  </label>
                  <Controller
                    name="imagePrompt"
                    control={control}
                    render={({ field }) => (
                      <Textarea 
                        placeholder="Describe the image you want to generate..." 
                        className="bg-zinc-900/90 border-zinc-700 focus-visible:ring-zinc-600 text-white resize-none h-28 min-h-28"
                        {...field} 
                      />
                    )}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="rounded overflow-hidden border border-zinc-800 bg-zinc-900/50">
                    {generatedImage && typeof generatedImage === 'string' && generatedImage.trim() !== "" ? (
                      <div className="relative w-full aspect-[16/9]">
                        <Image
                          priority
                          src={generatedImage}
                          alt="Content Type Image"
                          className="object-cover"
                          fill
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[16/9] flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center mb-2">
                          <Loader2 className="w-5 h-5 text-zinc-400" />
                        </div>
                        <span className="text-zinc-300 text-sm font-medium">No image generated yet</span>
                        <span className="text-xs text-zinc-500">Enter a prompt and click generate</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generating || !watch("imagePrompt")}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-none"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Image...
                      </>
                    ) : (
                      "Generate Image"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end pt-3 mt-2 border-t border-zinc-800 gap-2">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-white hover:bg-white/90 text-black"
            >
              {defaultValues.title ? "Save Changes" : "Add Content Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A custom component for managing multiple example strings.
 */
function ExamplesInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [current, setCurrent] = useState("");

  const addExample = () => {
    if (current.trim()) {
      onChange([...value, current.trim()]);
      setCurrent("");
    }
  };

  const removeExample = (index: number) => {
    const newArr = [...value];
    newArr.splice(index, 1);
    onChange(newArr);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Add an example..."
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="bg-zinc-900/90 border-zinc-700 focus-visible:ring-zinc-600 text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && current.trim()) {
              e.preventDefault();
              addExample();
            }
          }}
        />
        <Button 
          onClick={addExample}
          type="button"
          className="bg-zinc-800 hover:bg-zinc-700 text-white border-none shrink-0"
          disabled={!current.trim()}
        >
          Add
        </Button>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((example, index) => (
            <div
              key={index}
              className="flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-zinc-300 group hover:bg-zinc-700 transition-colors"
            >
              <span className="text-sm">{example}</span>
              <button
                type="button"
                onClick={() => removeExample(index)}
                className="text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1 text-zinc-400 hover:text-white hover:bg-zinc-600/50 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      {value.length === 0 && (
        <p className="text-xs text-zinc-500 pt-1">Add examples of the content type to help users understand what it&apos;s for.</p>
      )}
    </div>
  );
}
