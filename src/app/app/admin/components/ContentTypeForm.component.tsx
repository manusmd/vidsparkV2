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

// Define a Zod schema for the raw form input.
// "examples" is now an optional array of strings.
export const ContentTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  examples: z.array(z.string()).optional(),
  prompt: z.string().optional(),
  recommendedVoiceId: z.string().optional(),
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
};

interface ContentTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ContentType>) => void;
  defaultValues?: Partial<ContentTypeFormInputValues>;
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
    formState: { errors },
  } = useForm<ContentTypeFormInputValues>({
    resolver: zodResolver(ContentTypeSchema),
    defaultValues,
  });

  // Reset the form values when defaultValues changes (for edit mode)
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues.title ? "Edit Content Type" : "Add New Content Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input placeholder="Title" {...field} />}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea placeholder="Description" {...field} />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          {/* Examples */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Examples (add multiple)
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
              <p className="text-red-500 text-xs mt-1">
                {errors.examples.message as string}
              </p>
            )}
          </div>
          {/* Custom AI Prompt */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Custom AI Prompt (optional)
            </label>
            <Controller
              name="prompt"
              control={control}
              render={({ field }) => (
                <Textarea placeholder="Enter prompt..." {...field} />
              )}
            />
          </div>
          {/* Recommended Narrator Voice */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Recommended Narrator Voice
            </label>
            {voicesLoading ? (
              <p className="text-muted-foreground">Loading voices...</p>
            ) : voicesError ? (
              <p className="text-red-500">{voicesError}</p>
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
          <DialogFooter className="flex justify-between">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
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
        />
        <Button onClick={addExample}>Add</Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((example, index) => (
            <div
              key={index}
              className="flex items-center gap-1 rounded bg-muted/20 px-2 py-1"
            >
              <span className="text-sm">{example}</span>
              <button
                type="button"
                onClick={() => removeExample(index)}
                className="text-xs font-bold"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
