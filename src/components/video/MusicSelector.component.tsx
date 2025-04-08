"use client";
import React, { useRef, useState, useEffect, JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Slash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/app/types";
import { Slider } from "@/components/ui/slider";
import { useMusicTracks } from "@/hooks/data/useMusicTracks";
import { useMusic } from "@/providers/useMusic";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";
import { useParams } from "next/navigation";

export function MusicSelector({
  disabled = false,
}: {
  disabled?: boolean;
}): JSX.Element {
  const { musicTracks, loading, error } = useMusicTracks();
  const { musicUrl, musicVolume, updateMusic } = useMusic();
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const params = useParams();
  const videoId = params.id as string | undefined;
  const videoDetailResult = useVideoDetail(videoId || "dummy-id");
  const video = videoId ? videoDetailResult.video : null;

  // Initialize selected track from musicId or musicUrl
  useEffect(() => {
    if (musicTracks.length > 0) {
      if (video?.musicId) {
        // If video has musicId, find track by id
        const track = musicTracks.find((track) => track.id === video.musicId);
        if (track) {
          setSelectedTrack(track);
        }
      } else if (musicUrl) {
        // Fall back to finding by URL
        const track = musicTracks.find((track) => track.src === musicUrl);
        if (track) {
          setSelectedTrack(track);
        }
      }
    }
  }, [musicTracks, musicUrl, video]);

  const handleSelectMusic = async (track: MusicTrack | null) => {
    setSelectedTrack(track);
    await updateMusic(track ? track.src : "", musicVolume, track ? track.id : null);
  };

  const handleVolumeChange = async (value: number) => {
    await updateMusic(selectedTrack ? selectedTrack.src : "", value, selectedTrack ? selectedTrack.id : null);
  };

  const handlePlayPause = (track: MusicTrack & { id: string }) => {
    if (disabled) return;
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
            disabled={disabled || !selectedTrack}
            value={[selectedTrack ? musicVolume : 0]}
            onValueChange={(value) => handleVolumeChange(value[0])}
            max={1}
            step={0.1}
            className="w-full"
          />
          <span className="text-xs font-medium">
            {Math.round(selectedTrack ? musicVolume * 10 : 0)}
          </span>
        </div>
      </div>

      {/* Music Selection */}
      <label className="text-sm font-medium mb-2 block">Select Music</label>
      <div
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
        className="grid gap-4"
      >
        {/* "None" Option */}
        <Card
          onClick={() => !disabled && handleSelectMusic(null)}
          className={cn(
            "h-12 p-2 border rounded-lg transition-colors cursor-pointer flex items-center justify-center",
            selectedTrack === null
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-muted/10",
            disabled && "opacity-50 pointer-events-none",
          )}
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-8 flex-shrink-0 flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) handleSelectMusic(null);
                }}
                disabled={disabled}
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
            onClick={() => !disabled && handleSelectMusic(track)}
            className={cn(
              "h-12 p-2 border rounded-lg transition-colors cursor-pointer flex items-center",
              selectedTrack?.id === track.id
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted/10",
              disabled && "opacity-50 pointer-events-none",
            )}
          >
            <div className="flex items-center gap-2 w-full">
              {/* Fixed Play/Pause Button */}
              <div className="w-8 flex-shrink-0 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(track);
                  }}
                  disabled={disabled}
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
