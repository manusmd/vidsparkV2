"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil, Play, Pause } from "lucide-react";
import type { MusicTrack } from "@/app/types";

interface MusicTrackListProps {
  musicTracks: (MusicTrack & { id: string })[];
  onEdit: (track: MusicTrack & { id: string }) => void;
  onDelete: (id: string) => void;
}

export function MusicTrackList({
  musicTracks,
  onEdit,
  onDelete,
}: MusicTrackListProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {musicTracks.map((track) => (
        <MusicTrackItem
          key={track.id}
          track={track}
          isPlaying={playingId === track.id}
          onPlay={() => setPlayingId(track.id)}
          onPause={() => setPlayingId(null)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface MusicTrackItemProps {
  track: MusicTrack & { id: string };
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEdit: (track: MusicTrack & { id: string }) => void;
  onDelete: (id: string) => void;
}

function MusicTrackItem({
  track,
  isPlaying,
  onPlay,
  onPause,
  onEdit,
  onDelete,
}: MusicTrackItemProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      onPause();
    } else {
      audioRef.current.play();
      onPlay();
    }
  };

  return (
    <Card className="flex flex-row items-center w-full p-3 gap-4 border border-border rounded-lg hover:bg-muted/10 transition-colors">
      {/* Play/Pause Button */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full p-2"
        onClick={handlePlayPause}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>
      <audio ref={audioRef} src={track.src} />

      {/* Track Title */}
      <span className="flex-1 font-semibold text-base sm:text-lg truncate">
        {track.title}
      </span>

      {/* Edit and Delete Icons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full p-2"
          onClick={() => onEdit(track)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full p-2"
          onClick={() => onDelete(track.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
