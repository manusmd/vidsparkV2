"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useVoices } from "@/hooks/data/useVoices";
import { ContentType } from "@/app/types";
import { ContentTypeList } from "@/app/admin/components/ContentTypeList.component";
import { ContentTypeForm } from "@/app/admin/components/ContentTypeForm.component";

export default function ContentTypesManager() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState("");
  const [prompt, setPrompt] = useState("");
  const [recommendedVoiceId, setRecommendedVoiceId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "contentTypes"),
      (snapshot) => {
        setContentTypes(
          snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "", // Ensure all required fields exist
              description: data.description || "",
              examples: Array.isArray(data.examples) ? data.examples : [],
              prompt: data.prompt || "",
              recommendedVoiceId: data.recommendedVoiceId || "",
            } as ContentType;
          }),
        );
      },
    );

    return () => unsubscribe();
  }, []);
  const handleSubmit = async () => {
    if (!title || !description) return;
    const contentData = {
      title,
      description,
      examples: examples.split(",").map((ex) => ex.trim()),
      prompt,
      recommendedVoiceId,
    };

    if (editingId)
      await updateDoc(doc(db, "contentTypes", editingId), contentData);
    else await addDoc(collection(db, "contentTypes"), contentData);

    setIsModalOpen(false);
  };

  const handleEdit = (content: ContentType) => {
    setEditingId(content.id);
    setTitle(content.title);
    setDescription(content.description);
    setExamples(content.examples.join(", "));
    setPrompt(content.prompt || "");
    setRecommendedVoiceId(content.recommendedVoiceId || "");
    setIsModalOpen(true); // Ensure modal opens
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
      <ContentTypeList
        contentTypes={contentTypes}
        voices={voices}
        onEdit={handleEdit}
        onDelete={(id) => deleteDoc(doc(db, "contentTypes", id))} // FIXED
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
