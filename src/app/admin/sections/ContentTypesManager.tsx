"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoices } from "@/hooks/data/useVoices";
import type { ContentType } from "@/app/types";
import { ContentTypeList } from "@/app/admin/components/ContentTypeList.component";
import { ContentTypeForm } from "@/app/admin/components/ContentTypeForm.component";
import { useContentTypes } from "@/hooks/data/useContentTypes";

export default function ContentTypesManager() {
  const {
    contentTypes,
    error,
    createContentType,
    updateContentType,
    deleteContentType,
  } = useContentTypes();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState("");
  const [prompt, setPrompt] = useState("");
  const [recommendedVoiceId, setRecommendedVoiceId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();

  const handleSubmit = async () => {
    if (!title || !description) return;
    const contentData: Partial<ContentType> = {
      title,
      description,
      examples: examples.split(",").map((ex) => ex.trim()),
      prompt,
      recommendedVoiceId,
    };

    try {
      if (editingId) {
        await updateContentType(editingId, contentData);
      } else {
        await createContentType(contentData);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Error saving content type:", err);
    }
  };

  const handleEdit = (content: ContentType) => {
    setEditingId(content.id);
    setTitle(content.title);
    setDescription(content.description);
    setExamples(content.examples.join(", "));
    setPrompt(content.prompt || "");
    setRecommendedVoiceId(content.recommendedVoiceId || "");
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setEditingId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Content Types</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Content Type</span>
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      <ContentTypeList
        contentTypes={contentTypes}
        voices={voices}
        onEdit={handleEdit}
        onDelete={(id) => {
          deleteContentType(id).catch((err) =>
            console.error("Error deleting content type:", err),
          );
        }}
      />
      <ContentTypeForm
        open={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        {...{
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
        }}
      />
    </div>
  );
}
