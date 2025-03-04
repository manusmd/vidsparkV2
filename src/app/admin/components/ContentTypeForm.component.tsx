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
import { VoiceSelector } from "@/components/VoiceSelector.component";
import { Voice } from "@/app/types";

interface ContentTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  examples: string;
  setExamples: (value: string) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  recommendedVoiceId: string;
  setRecommendedVoiceId: (value: string) => void;
  voices: Voice[];
  voicesLoading: boolean;
  voicesError: string | null;
}

export function ContentTypeForm({
  open,
  onClose,
  onSubmit,
  title,
  setTitle,
  description,
  setDescription,
  examples,
  setExamples,
  prompt,
  setPrompt,
  recommendedVoiceId,
  setRecommendedVoiceId,
  voices,
  voicesLoading,
  voicesError,
}: ContentTypeFormProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title ? "Edit Content Type" : "Add New Content Type"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Examples (comma separated)"
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
          />
          <Textarea
            placeholder="Custom AI Prompt (optional)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {/* Voice Selector */}
          <div>
            <label className="text-sm font-semibold block mb-1">
              Recommended Narrator Voice
            </label>
            {voicesLoading ? (
              <p className="text-muted-foreground">Loading voices...</p>
            ) : voicesError ? (
              <p className="text-red-500">{voicesError}</p>
            ) : (
              <VoiceSelector
                selectedVoice={recommendedVoiceId}
                onSelectVoice={setRecommendedVoiceId}
                availableVoices={voices}
              />
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {title ? "Save Changes" : "Add Content Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
