"use client";

import { useState } from "react";
import { SceneItem } from "@/components/video/SceneItem.component";
import { ImageModal } from "@/components/video/ImageModal.component";
import { Scene } from "@/app/types";

interface SceneListProps {
  scenes: { [sceneIndex: number]: Scene };
}

export function SceneList({ scenes }: SceneListProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {" "}
        {/* Ensures 1 column layout */}
        {Object.entries(scenes).map(([sceneIndex, scene]) => (
          <SceneItem
            key={sceneIndex}
            index={Number(sceneIndex)}
            scene={scene}
            onSelectImage={(imageUrl) => {
              setSelectedImage(imageUrl);
              setSelectedSceneIndex(Number(sceneIndex));
            }}
          />
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && selectedSceneIndex !== null && (
        <ImageModal
          imageUrl={selectedImage}
          sceneIndex={selectedSceneIndex}
          onClose={() => {
            setSelectedImage(null);
            setSelectedSceneIndex(null);
          }}
        />
      )}
    </div>
  );
}
