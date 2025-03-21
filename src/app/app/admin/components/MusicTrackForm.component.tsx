"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface MusicTrackFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file?: File) => Promise<void>;
  title: string;
  setTitle: (value: string) => void;
  src: string;
  isEditing?: boolean;
  isSubmitting: boolean;
}

export function MusicTrackForm({
  open,
  onClose,
  onSubmit,
  title,
  setTitle,
  src,
  isEditing = false,
  isSubmitting,
}: MusicTrackFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [] },
    multiple: false,
  });

  const handleFormSubmit = async () => {
    try {
      await onSubmit(selectedFile ?? undefined);
      setSelectedFile(null);
    } catch (err) {
      console.error("Error submitting music track:", err);
    }
  };

  // Audio logic
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying((prev) => !prev);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  // Reset audio states when the dialog closes
  useEffect(() => {
    if (!open) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Music Track" : "Add New Music Track"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
              isDragActive
                ? "border-primary bg-muted/10"
                : "border-border hover:border-primary hover:bg-muted/10",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-muted-foreground text-center">
              <UploadCloud className="mb-2 h-8 w-8 transition-colors group-hover:text-primary" />
              {isDragActive ? (
                <p className="text-lg font-medium text-primary">
                  Drop the audio file here...
                </p>
              ) : selectedFile ? (
                <p className="text-lg font-medium">
                  Selected: {selectedFile.name}
                </p>
              ) : src ? (
                <p className="text-lg font-medium">Current Source: {src}</p>
              ) : (
                <p className="text-lg font-medium">
                  Drag &amp; drop an audio file here,
                  <br />
                  or click to select one
                </p>
              )}
            </div>
          </div>

          {/* Audio Preview */}
          {src && !selectedFile && (
            <div className="rounded-lg border border-border p-4">
              <audio
                ref={audioRef}
                src={src}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
              />
              <div className="flex items-center justify-between mb-2">
                <Button variant="outline" size="icon" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(currentTime)}/{Math.floor(duration)}s
                </span>
              </div>
              <Slider
                value={[currentTime]}
                onValueChange={handleSliderChange}
                max={duration || 100}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : isEditing
                ? "Save Changes"
                : "Add Music Track"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
