"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoices } from "@/hooks/data/useVoices";
import type { ContentType } from "@/app/types";
import { DraggableContentTypeList } from "@/app/app/admin/components/ContentTypeList.component";
import { ContentTypeForm } from "@/app/app/admin/components/ContentTypeForm.component";
import { useContentTypes } from "@/hooks/data/useContentTypes";

export default function ContentTypesManager() {
  const {
    contentTypes,
    error,
    createContentType,
    updateContentType,
    deleteContentType,
  } = useContentTypes();

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContentType, setEditingContentType] =
    useState<ContentType | null>(null);

  const handleOpenNew = () => {
    setEditingContentType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (content: ContentType) => {
    setEditingContentType(content);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: Partial<ContentType>) => {
    try {
      if (editingContentType) {
        // Update the existing content type
        await updateContentType(editingContentType.id, data);
      } else {
        // Create new content type
        await createContentType(data);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Error saving content type:", err);
    }
  };

  // Build defaultValues: ensure examples is always an array.
  const defaultValues = editingContentType
    ? {
        title: editingContentType.title,
        description: editingContentType.description,
        examples: Array.isArray(editingContentType.examples)
          ? editingContentType.examples
          : [],
        prompt: editingContentType.prompt || "",
        recommendedVoiceId: editingContentType.recommendedVoiceId || "",
      }
    : {
        title: "",
        description: "",
        examples: [],
        prompt: "",
        recommendedVoiceId: "",
      };

  const handleOrderUpdate = async (updatedTypes: ContentType[]) => {
    try {
      await Promise.all(
        updatedTypes.map((ct) =>
          updateContentType(ct.id, {
            title: ct.title,
            description: ct.description,
            examples: ct.examples,
            prompt: ct.prompt,
            recommendedVoiceId: ct.recommendedVoiceId,
            order: ct.order,
          }),
        ),
      );
      console.log("Content type order updated.");
    } catch (err) {
      console.error("Error updating content type order:", err);
    }
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Content Types</h1>
        <Button onClick={handleOpenNew}>
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Content Type</span>
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      <DraggableContentTypeList
        contentTypes={contentTypes}
        voices={voices}
        onEdit={handleEdit}
        onDelete={(id) =>
          deleteContentType(id).catch((err) =>
            console.error("Error deleting content type:", err),
          )
        }
        onOrderUpdate={handleOrderUpdate}
      />
      <ContentTypeForm
        open={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        voices={voices}
        voicesLoading={voicesLoading}
        voicesError={voicesError}
      />
    </div>
  );
}
