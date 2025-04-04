import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/video/AudioPlayer.component";
import { Scene } from "@/app/types";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SceneItemProps {
  index: number;
  scene: Scene;
  onSelectImage: (imageUrl: string) => void;
  isEditing?: boolean;
  onNarrationChange?: (narration: string) => void;
  narration?: string;
  onDelete?: () => void;
}

export function SceneItem({ 
  index, 
  scene, 
  onSelectImage,
  isEditing = false,
  onNarrationChange,
  narration,
  onDelete
}: SceneItemProps) {
  const [localNarration, setLocalNarration] = useState(scene.narration);
  
  // Update local state when prop changes
  useEffect(() => {
    if (narration !== undefined) {
      setLocalNarration(narration);
    } else {
      setLocalNarration(scene.narration);
    }
  }, [narration, scene.narration]);

  const handleNarrationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalNarration(newValue);
    if (onNarrationChange) {
      onNarrationChange(newValue);
    }
  };

  return (
    <Card className="p-4 flex flex-col md:flex-row items-start gap-6 border border-border rounded-lg shadow-sm">
      {/* Thumbnail */}
      <div
        className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg border border-muted cursor-pointer bg-muted flex items-center justify-center"
        onClick={() => scene.imageUrl && onSelectImage(scene.imageUrl)}
      >
        {scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt={`Scene ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-muted-foreground">No Image</span>
        )}
      </div>

      {/* Scene Details */}
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg text-white">Scene {index + 1}</p>
          
          {isEditing && onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete scene</span>
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <Textarea
            value={localNarration}
            onChange={handleNarrationChange}
            className="min-h-[100px] resize-none"
            placeholder="Enter scene narration..."
          />
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {scene.narration}
          </p>
        )}

        {/* Audio Player */}
        {!isEditing && scene.voiceUrl ? (
          <AudioPlayer src={scene.voiceUrl} />
        ) : !isEditing && (
          <p className="text-xs text-muted-foreground italic">
            Voice not generated yet.
          </p>
        )}
      </div>
    </Card>
  );
}
