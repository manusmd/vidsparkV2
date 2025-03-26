"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicTracks } from "@/hooks/data/useMusicTracks";
import type { MusicTrack } from "@/app/types";
import { MusicTrackList } from "@/app/app/admin/components/MusicTrackList.component";
import { MusicTrackForm } from "@/app/app/admin/components/MusicTrackForm.component";

export default function MusicManager() {
  const {
    musicTracks,
    error,
    createMusicTrack,
    updateMusicTrack,
    deleteMusicTrack,
  } = useMusicTracks();

  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (file?: File) => {
    if (!title || (!src && !file)) return;
    const musicData: Partial<MusicTrack> = { title, src };
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateMusicTrack(editingId, musicData);
      } else {
        await createMusicTrack(musicData, file);
      }
      setIsModalOpen(false);
      setTitle("");
      setSrc("");
    } catch (err: unknown) {
      console.error("Error saving music track:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (music: MusicTrack & { id: string }) => {
    setEditingId(music.id);
    setTitle(music.title);
    setSrc(music.src);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setEditingId(null);
    setIsModalOpen(false);
    setTitle("");
    setSrc("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Music Tracks</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Music Track</span>
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      <MusicTrackList
        musicTracks={musicTracks}
        onEdit={handleEdit}
        onDelete={(id) => {
          deleteMusicTrack(id).catch((err) =>
            console.error("Error deleting music track:", err),
          );
        }}
      />
      <MusicTrackForm
        open={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={title}
        setTitle={setTitle}
        src={src}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
