"use client";

import React, { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentType } from "@/app/types";
import { DraggableContentTypeList } from "@/app/app/admin/components/ContentTypeList.component";
import { ContentTypeForm } from "@/app/app/admin/components/ContentTypeForm.component";
import { useDataContext } from "@/contexts/DataContext";

export default function ContentTypesManager() {
  const {
    contentTypes,
    contentTypesLoading,
    contentTypesError,
    refreshContentTypes,
    createContentType,
    updateContentType,
    deleteContentType,
    
    // Voices from DataContext
    voices,
    voicesLoading,
    voicesError,
    refreshVoices
  } = useDataContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContentType, setEditingContentType] = useState<ContentType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      // Refresh both content types and voices
      await Promise.all([
        refreshContentTypes(),
        refreshVoices()
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsRefreshing(false);
    }
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
        imageUrl: editingContentType.imageUrl || "",
        imagePrompt: editingContentType.imagePrompt || "",
      }
    : {
        title: "",
        description: "",
        examples: [],
        prompt: "",
        recommendedVoiceId: "",
        imageUrl: "",
        imagePrompt: "",
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
            imageUrl: ct.imageUrl,
            imagePrompt: ct.imagePrompt,
          }),
        ),
      );
      console.log("Content type order updated.");
    } catch (err) {
      console.error("Error updating content type order:", err);
    }
  };
  
  // Determine if any data is loading
  const isLoading = contentTypesLoading || voicesLoading || isRefreshing;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Manage Content Types</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={handleOpenNew}
            className="bg-white hover:bg-white/90 text-black"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Content Type</span>
          </Button>
        </div>
      </div>
      
      {contentTypesError && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded">Error: {contentTypesError}</p>}
      {voicesError && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded">Voice Error: {voicesError}</p>}
      
      {isLoading ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-zinc-400" />
          <p className="text-zinc-400">Loading content types...</p>
        </div>
      ) : contentTypes.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-zinc-300 text-lg font-medium mb-1">No content types found</h3>
          <p className="text-zinc-500 mb-4">Get started by adding your first content type</p>
          <Button 
            onClick={handleOpenNew}
            className="bg-white hover:bg-white/90 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Content Type
          </Button>
        </div>
      ) : (
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
      )}
      
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
