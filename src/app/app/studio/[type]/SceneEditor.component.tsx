"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";

interface Scene {
  narration: string;
  imagePrompt: string;
}

interface SceneEditorProps {
  scenes?: { [sceneIndex: number]: Scene };
  onUpdateScenes: (updatedScenes: { [sceneIndex: number]: Scene }) => void;
  disabled?: boolean;
}

export function SceneEditor({
  scenes = {},
  onUpdateScenes,
  disabled = false,
}: SceneEditorProps) {
  // Convert scenes object to an array, sorted by key
  const scenesArray = Object.keys(scenes)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => scenes[Number(key)]);

  const updateScenes = (updatedArray: Scene[]) => {
    const newScenes: { [sceneIndex: number]: Scene } = {};
    updatedArray.forEach((scene, index) => {
      newScenes[index] = scene;
    });
    onUpdateScenes(newScenes);
  };

  const handleChange = (index: number, field: keyof Scene, value: string) => {
    const updated = [...scenesArray];
    updated[index] = { ...updated[index], [field]: value };
    updateScenes(updated);
  };

  const addScene = () => {
    if (disabled) return;
    updateScenes([...scenesArray, { narration: "", imagePrompt: "" }]);
  };

  const removeScene = (index: number) => {
    if (disabled) return;
    updateScenes(scenesArray.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-2xl font-semibold">Scenes</h3>
      {scenesArray.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm p-4 border border-dashed border-border rounded-lg">
          No scenes added yet. Click &#34;Add Scene&#34; to create one.
        </div>
      ) : (
        <div className="space-y-6">
          {scenesArray.map((scene, index) => (
            <div
              key={index}
              className="border rounded-xl p-6 bg-muted/10 shadow-md relative space-y-4"
            >
              <Button
                type={"button"}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition"
                onClick={() => removeScene(index)}
                disabled={disabled}
              >
                <Trash className="w-5 h-5" />
              </Button>
              <div>
                <label className="text-sm font-semibold block mb-1">
                  Narration Text
                </label>
                <Textarea
                  placeholder="Enter the narration for this scene..."
                  value={scene.narration}
                  onChange={(e) =>
                    handleChange(index, "narration", e.target.value)
                  }
                  className="w-full h-24 resize-none bg-background text-foreground border-border"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">
                  Image Prompt
                </label>
                <Input
                  placeholder="Enter an image prompt..."
                  value={scene.imagePrompt}
                  onChange={(e) =>
                    handleChange(index, "imagePrompt", e.target.value)
                  }
                  className="w-full bg-background text-foreground border-border"
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        type={"button"}
        variant="outline"
        onClick={addScene}
        className="w-full"
        disabled={disabled}
      >
        <Plus className="w-4 h-4 mr-2" /> Add Scene
      </Button>
    </Card>
  );
}
