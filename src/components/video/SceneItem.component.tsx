import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/video/AudioPlayer.component";
import { Scene } from "@/app/types";

interface SceneItemProps {
  index: number;
  scene: Scene;
  onSelectImage: (imageUrl: string) => void;
}

export function SceneItem({ index, scene, onSelectImage }: SceneItemProps) {
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
        <p className="font-semibold text-lg text-white">Scene {index + 1}</p>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {scene.narration}
        </p>

        {/* Audio Player */}
        {scene.voiceUrl ? (
          <AudioPlayer src={scene.voiceUrl} />
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Voice not generated yet.
          </p>
        )}
      </div>
    </Card>
  );
}
