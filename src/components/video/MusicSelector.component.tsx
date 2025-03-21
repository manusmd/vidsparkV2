"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Slash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMusicTracks } from "@/hooks/data/useMusicTracks";
import type { MusicTrack } from "@/app/types";
import { Slider } from "@/components/ui/slider";

interface MusicSelectorProps {
  selectedTrack: MusicTrack | null;
  onSelectMusic: (track: MusicTrack | null) => void;
  volume: number; // Expected as a value between 0 and 1
  onVolumeChange: (value: number) => void;
}

export function MusicSelector({
  selectedTrack,
  onSelectMusic,
  volume,
  onVolumeChange,
}: MusicSelectorProps) {
  const { musicTracks, loading, error } = useMusicTracks();
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  // Update the volume of each audio element when the external volume changes
  useEffect(() => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  const handlePlayPause = (track: MusicTrack & { id: string }) => {
    const audioEl = audioRefs.current[track.id];
    if (!audioEl) return;
    if (playingTrackId && playingTrackId !== track.id) {
      audioRefs.current[playingTrackId]?.pause();
      setPlayingTrackId(null);
    }
    if (playingTrackId === track.id) {
      audioEl.pause();
      setPlayingTrackId(null);
    } else {
      audioEl.play();
      setPlayingTrackId(track.id);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((audio) => audio?.pause());
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading music tracks…</p>
    );
  }
  if (error) {
    return <p className="text-sm text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      {/* Volume Slider */}
      <div className="mb-4">
        <label className="text-sm font-medium block mb-1">
          Background Music Volume
        </label>
        <div className="flex items-center gap-2">
          <Slider
            disabled={!selectedTrack}
            value={[selectedTrack ? volume : 0]}
            onValueChange={(value) => onVolumeChange(value[0])}
            max={1}
            step={0.1}
            className="w-full"
          />
          <span className="text-xs font-medium">
            {Math.round(selectedTrack ? volume * 10 : 0)}
          </span>
        </div>
      </div>

      <label className="text-sm font-medium mb-2 block">Select Music</label>
      <div
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
        className="grid gap-4"
      >
        {/* "None" Option */}
        <Card
          onClick={() => onSelectMusic(null)}
          className={cn(
            "h-12 p-2 border rounded-lg transition-colors cursor-pointer flex items-center justify-center",
            selectedTrack === null
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-muted/10",
          )}
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-8 flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMusic(null);
                }}
              >
                <Slash className="h-4 w-4" />
              </Button>
            </div>
            <span className="font-semibold text-xs sm:text-sm truncate">
              None
            </span>
          </div>
        </Card>

        {/* Music Track Items */}
        {musicTracks.map((track: MusicTrack & { id: string }) => (
          <Card
            key={track.id}
            onClick={() => onSelectMusic(track)}
            className={cn(
              "h-12 p-2 border rounded-lg transition-colors cursor-pointer flex items-center",
              selectedTrack?.id === track.id
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted/10",
            )}
          >
            <div className="flex items-center gap-2 w-full">
              {/* Fixed play/pause button */}
              <div className="w-8 flex-shrink-0 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(track);
                  }}
                >
                  {playingTrackId === track.id ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {/* Title */}
              <div className="flex-1">
                <span className="font-semibold text-xs sm:text-sm truncate">
                  {track.title || "Untitled"}
                </span>
              </div>
            </div>
            {/* Hidden audio element */}
            <audio
              ref={(el) => {
                audioRefs.current[track.id] = el || null;
              }}
              src={track.src}
              className="hidden"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
