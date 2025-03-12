"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoType } from "@/app/types"; // VideoType: { id, title, prompt, imageUrl, imagePrompt }
import { VideoTypeList } from "@/app/app/admin/components/VideoTypeList.component";
import {
  VideoTypeForm,
  VideoTypeFormData,
} from "@/app/app/admin/components/VideoTypeForm.component";
import { useVideoTypes } from "@/hooks/data/useVideoTypes";

export default function VideoTypesManager() {
  const {
    videoTypes,
    error,
    createVideoType,
    updateVideoType,
    deleteVideoType,
  } = useVideoTypes();

  // Define initial form values for a new video type.
  const emptyValues: VideoTypeFormData & { imageUrl: string } = {
    title: "",
    prompt: "",
    imagePrompt: "",
    imageUrl: "",
  };

  // State to hold the form initial values (used for both creating and editing)
  const [initialValues, setInitialValues] = useState<
    VideoTypeFormData & { imageUrl: string }
  >(emptyValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (
    data: VideoTypeFormData,
    generatedImage: string,
  ) => {
    if (!data.title || !data.prompt || !generatedImage) return;

    const videoTypeData: Partial<VideoType> = {
      title: data.title,
      prompt: data.prompt,
      imagePrompt: data.imagePrompt,
      imageUrl: generatedImage,
    };

    try {
      if (editingId) {
        await updateVideoType(editingId, videoTypeData);
      } else {
        await createVideoType(videoTypeData);
      }
      setIsModalOpen(false);
      // Reset form state after submission.
      setInitialValues(emptyValues);
      setEditingId(null);
    } catch (err: unknown) {
      console.error("Error saving video type:", err);
    }
  };

  const handleEdit = (videoType: VideoType) => {
    setEditingId(videoType.id);
    setInitialValues({
      title: videoType.title,
      prompt: videoType.prompt,
      imagePrompt: videoType.imagePrompt,
      imageUrl: videoType.imageUrl,
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setEditingId(null);
    setIsModalOpen(false);
    setInitialValues(emptyValues);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Video Types</h1>
        <Button
          onClick={() => {
            setInitialValues(emptyValues);
            setEditingId(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Video Type</span>
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      <VideoTypeList
        videoTypes={videoTypes}
        onEdit={handleEdit}
        onDelete={(id) =>
          deleteVideoType(id).catch((err) =>
            console.error("Error deleting video type:", err),
          )
        }
      />
      <VideoTypeForm
        open={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialValues={initialValues}
      />
    </div>
  );
}
