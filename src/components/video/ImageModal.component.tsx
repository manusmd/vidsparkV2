"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function ImageModal({
  imageUrl,
  sceneIndex,
  onClose,
}: {
  imageUrl: string;
  sceneIndex: number;
  onClose: () => void;
}) {
  const [newImage, setNewImage] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewImage(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (newImage) {
      console.log(`Uploading new image for Scene ${sceneIndex + 1}`);
      // TODO: Implement upload logic (Firebase Storage)
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scene {sceneIndex + 1} - Image Preview</DialogTitle>
        </DialogHeader>
        <img
          src={imageUrl}
          alt={`Scene ${sceneIndex + 1}`}
          className="w-full rounded-lg"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="upload-image"
        />
        <DialogFooter className="space-x-2">
          <label htmlFor="upload-image">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" /> Replace Image
            </Button>
          </label>
          {newImage && (
            <Button onClick={handleUpload} className="gap-2">
              Upload New Image
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
