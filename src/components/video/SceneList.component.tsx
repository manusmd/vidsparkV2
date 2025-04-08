"use client";

import { useState, useEffect, useRef } from "react";
import { SceneItem } from "@/components/video/SceneItem.component";
import { ImageModal } from "@/components/video/ImageModal.component";
import { Scene } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SceneListProps {
  scenes: { [sceneIndex: number]: Scene };
  loading?: boolean;
  isEditing?: boolean;
  videoId?: string;
  onSaveChanges?: () => void;
  id?: string;
}

export function SceneList({ 
  scenes, 
  loading = false, 
  isEditing = false, 
  videoId,
  onSaveChanges,
  id
}: SceneListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(
    null,
  );
  const [editedScenes, setEditedScenes] = useState<{ [key: number]: Scene }>(scenes);
  // isSaving is defined but not used - keep for future implementation
  const [isAddingScene, setIsAddingScene] = useState(false);
  
  // Always call hooks unconditionally
  const { updateScenes: updateScenesHook, addScene: addSceneHook } = useVideoDetail(videoId || "dummy-id");
  
  // Then conditionally use the results
  const updateScenes = videoId ? updateScenesHook : null;
  const addScene = videoId ? addSceneHook : null;

  // Update editedScenes when scenes prop changes or edit mode changes
  useEffect(() => {
    setEditedScenes(scenes);
  }, [scenes, isEditing]);

  // Listen for external save trigger event
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !id) return;

    const handleSaveEvent = () => {
      saveScenes();
    };

    container.addEventListener('save-scenes', handleSaveEvent);

    return () => {
      container.removeEventListener('save-scenes', handleSaveEvent);
    };
  }, [id, editedScenes]);

  const handleNarrationChange = (index: number, narration: string) => {
    setEditedScenes(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        narration
      }
    }));
  };

  const handleDeleteScene = (index: number) => {
    setEditedScenes(prev => {
      const newScenes = { ...prev };
      delete newScenes[index];
      return newScenes;
    });
  };

  const saveScenes = async () => {
    if (!videoId) return;
    
    try {
      if (updateScenes) {
        // Use the hook method if available
        await updateScenes(editedScenes);
      } else {
        // Fallback to direct API call
        const response = await fetch(`/api/video/${videoId}/scenes`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scenes: editedScenes }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save scene changes");
        }
      }
      
      toast.success("Scenes updated successfully");
      if (onSaveChanges) {
        onSaveChanges();
      }
    } catch (error) {
      console.error("Error saving scenes:", error);
      toast.error("Failed to update scenes");
    }
  };

  // Effects to enforce draft mode only editing
  useEffect(() => {
    // If isEditing is true but video is not in draft status,
    // we should force it to false through the onSaveChanges callback
    if (isEditing && videoId && db) {
      // Check video status
      const videoRef = doc(db, "videos", videoId);
      const unsubscribe = onSnapshot(videoRef, (doc) => {
        if (doc.exists() && doc.data().status !== "draft") {
          if (onSaveChanges) {
            onSaveChanges(); // Turn off editing mode
          }
        }
      });
      
      return () => unsubscribe();
    }
  }, [isEditing, videoId, onSaveChanges]);

  const handleAddScene = async () => {
    if (!videoId) return;
    
    setIsAddingScene(true);
    try {
      // Create a new scene in local state first for immediate UI feedback
      const sceneKeys = Object.keys(editedScenes).map(Number);
      const newIndex = sceneKeys.length > 0 ? Math.max(...sceneKeys) + 1 : 0;
      
      // Add to local state first
      const narration = "New scene - edit this text";
      setEditedScenes(prev => ({
        ...prev,
        [newIndex]: {
          narration,
          imagePrompt: "",
          imageUrl: undefined,
          voiceUrl: undefined
        }
      }));
      
      // Then add to backend if we're already in save mode
      if (addScene) {
        await addScene(narration);
      }
      
      toast.success("New scene added");
    } catch (error) {
      console.error("Error adding scene:", error);
      toast.error("Failed to add scene");
    } finally {
      setIsAddingScene(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={containerRef} id={id}>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(editedScenes).map(([sceneIndex, scene]) => (
          <SceneItem
            key={sceneIndex}
            index={Number(sceneIndex)}
            scene={scene}
            onSelectImage={(imageUrl) => {
              setSelectedImage(imageUrl);
              setSelectedSceneIndex(Number(sceneIndex));
            }}
            isEditing={isEditing}
            onNarrationChange={isEditing ? (narration: string) => handleNarrationChange(Number(sceneIndex), narration) : undefined}
            narration={isEditing ? editedScenes[Number(sceneIndex)]?.narration : undefined}
            onDelete={isEditing ? () => handleDeleteScene(Number(sceneIndex)) : undefined}
          />
        ))}
        
        {isEditing && (
          <Button
            variant="outline"
            className="h-20 border-dashed flex items-center justify-center gap-2 border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={handleAddScene}
            disabled={isAddingScene}
          >
            {isAddingScene ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 mr-2" />
            )}
            Add New Scene
          </Button>
        )}
      </div>

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
