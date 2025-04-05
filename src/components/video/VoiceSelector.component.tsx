"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown, PauseCircle, PlayCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Voice } from "@/app/types";

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  availableVoices: Voice[];
}

const getColorForLabel = (label: string) => {
  const colors = [
    "bg-blue-500/10 text-blue-500",
    "bg-purple-500/10 text-purple-500",
    "bg-amber-500/10 text-amber-500",
    "bg-orange-500/10 text-orange-500",
    "bg-indigo-500/10 text-indigo-500",
    "bg-pink-500/10 text-pink-500",
    "bg-emerald-500/10 text-emerald-500",
    "bg-cyan-500/10 text-cyan-500",
    "bg-slate-500/10 text-slate-500",
    "bg-violet-500/10 text-violet-500",
    "bg-teal-500/10 text-teal-500",
  ];
  return colors[label.charCodeAt(0) % colors.length];
};

export function VoiceSelector({
  selectedVoice,
  onSelectVoice,
  availableVoices,
}: VoiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const popoverTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handlePlay = (voice: Voice, event: React.MouseEvent) => {
    event.stopPropagation();

    if (playingVoiceId === voice.id) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (voice.preview_url) {
        const audio = new Audio(voice.preview_url);
        audioRef.current = audio;
        audio.play();
        setPlayingVoiceId(voice.id);
        audio.addEventListener("ended", () => setPlayingVoiceId(null));
      }
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-full">
      {/* Play Button for Selected Voice */}
      {selectedVoice && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) =>
            handlePlay(availableVoices.find((v) => v.id === selectedVoice)!, e)
          }
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          {playingVoiceId === selectedVoice ? (
            <PauseCircle className="h-5 w-5 text-white" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Voice Selector Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={popoverTriggerRef}
            variant="outline"
            className="min-w-0 flex-1 justify-between truncate bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            {selectedVoice
              ? availableVoices.find((v) => v.id === selectedVoice)?.name
              : "Select a Narrator Voice"}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-2 max-h-96 overflow-auto bg-zinc-900 border-zinc-700"
          style={{
            width: popoverTriggerRef.current
              ? `${popoverTriggerRef.current.offsetWidth}px`
              : "100%",
          }}
        >
          <div className="space-y-1">
            {availableVoices.map((voice) => (
              <div
                key={voice.id}
                onClick={() => {
                  onSelectVoice(voice.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-800 transition-colors",
                  selectedVoice === voice.id && "bg-zinc-800 text-white"
                )}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        selectedVoice === voice.id ? "text-white" : "text-zinc-300"
                      )}>
                        {voice.name}
                      </span>
                      {selectedVoice === voice.id && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    {voice.preview_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handlePlay(voice, e)}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-700"
                      >
                        {playingVoiceId === voice.id ? (
                          <PauseCircle className="h-5 w-5 text-white" />
                        ) : (
                          <PlayCircle className="h-5 w-5" />
                        )}
                      </Button>
                    )}
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(voice.labels)
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      .filter(([_, value]) => value)
                      .map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className={cn("text-xs border-zinc-700", getColorForLabel(value))}
                        >
                          {value}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
