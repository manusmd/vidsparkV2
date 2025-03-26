"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageType } from "@/app/types"; // ImageType: { id, title, prompt, imageUrl, imagePrompt }
import { ImageTypeList } from "@/app/app/admin/components/ImageTypeList.component";
import {
  ImageTypeForm,
  ImageTypeFormData,
} from "@/app/app/admin/components/ImageTypeForm.component";
import { useImageTypes } from "@/hooks/data/useImageTypes";

export default function ImageTypesManager() {
  const {
    imageTypes,
    error,
    createImageType,
    updateImageType,
    deleteImageType,
  } = useImageTypes();

  // Define initial form values for a new image type.
  const emptyValues: ImageTypeFormData & { imageUrl: string } = {
    title: "",
    description: "",
    prompt: "",
    imagePrompt: "",
    imageUrl: "",
  };

  // State to hold the form initial values (used for both creating and editing)
  const [initialValues, setInitialValues] = useState<
    ImageTypeFormData & { imageUrl: string }
  >(emptyValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (
    data: ImageTypeFormData,
    generatedImage: string,
  ) => {
    if (!data.title || !data.prompt || !generatedImage) return;

    const imageTypeData: Partial<ImageType> = {
      title: data.title,
      description: data.description,
      prompt: data.prompt,
      imagePrompt: data.imagePrompt,
      imageUrl: generatedImage,
    };

    try {
      if (editingId) {
        await updateImageType(editingId, imageTypeData);
      } else {
        await createImageType(imageTypeData);
      }
      setIsModalOpen(false);
      // Reset form state after submission.
      setInitialValues(emptyValues);
      setEditingId(null);
    } catch (err: unknown) {
      console.error("Error saving image type:", err);
    }
  };

  const handleEdit = (imageType: ImageType) => {
    setEditingId(imageType.id);
    setInitialValues({
      title: imageType.title,
      description: imageType.description,
      prompt: imageType.prompt,
      imagePrompt: imageType.imagePrompt,
      imageUrl: imageType.imageUrl,
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
        <h1 className="text-xl sm:text-2xl font-bold">Manage Image Types</h1>
        <Button
          onClick={() => {
            setInitialValues(emptyValues);
            setEditingId(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Image Type</span>
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      <ImageTypeList
        imageTypes={imageTypes}
        onEdit={handleEdit}
        onDelete={(id) =>
          deleteImageType(id).catch((err) =>
            console.error("Error deleting image type:", err),
          )
        }
      />
      <ImageTypeForm
        open={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialValues={initialValues}
      />
    </div>
  );
}
