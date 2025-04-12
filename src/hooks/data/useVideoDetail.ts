import { useEffect, useState } from "react";
import type { Scene, Step, Video } from "@/app/types";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { DocumentSnapshot, collection, doc, onSnapshot } from "firebase/firestore";

// Define processing steps globally (reused in the hook)
const processingSteps: Step[] = [
  { id: "processing:voices", name: "Generating Voice", status: "upcoming" },
  { id: "processing:images", name: "Generating Images", status: "upcoming" },
  { id: "processing:video", name: "Rendering Video", status: "upcoming" },
  { id: "processing:upload", name: "Uploading to YouTube", status: "upcoming" },
];

export function useVideoDetail(videoId: string) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [steps, setSteps] = useState<Step[]>([]);
  const [stableAssets, setStableAssets] = useState<{
    scenes: Video["scenes"];
    styling: Video["styling"] | null;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    if (!videoId) {
      setError("Video ID is required");
      setLoading(false);
      return;
    }

    if (!db) {
      setError("Database not initialized");
      setLoading(false);
      return;
    }

    const videoRef = doc(collection(db, "videos"), videoId);
    const unsubscribe = onSnapshot(
      videoRef,
      (doc: DocumentSnapshot) => {
        if (!doc.exists) {
          setError("Video not found");
          setVideo(null);
          setLoading(false);
          return;
        }

        const data = doc.data();
        if (data?.uid !== user.uid) {
          setError("You don't have permission to access this video");
          setVideo(null);
          setLoading(false);
          return;
        }

        const videoData: Video = {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          narration: data.narration || "",
          templateId: data.templateId || undefined,
          voiceId: data.voiceId || "",
          contentTypeId: data.contentTypeId || undefined,
          imageStyleId: data.imageStyleId || undefined,
          scenes: data.scenes || {},
          styling: data.styling || null,
          textPosition: data.textPosition || "bottom",
          showTitle: data.showTitle ?? true,
          musicVolume: data.musicVolume || 0.5,
          musicUrl: data.musicUrl || null,
          musicId: data.musicId || null,
          uploadStatus: data.uploadStatus || undefined,
          status: data.status || "draft",
          renderStatus: data.renderStatus || {
            progress: 0,
            statusMessage: "",
            videoUrl: ""
          },
          sceneStatus: data.sceneStatus || {},
          imageStatus: data.imageStatus || {},
          voiceStatus: data.voiceStatus || {},
          createdAt: new Date(data.createdAt || new Date().toISOString())
        };

        setVideo(videoData);
        setError(null);
        setLoading(false);
        updateSteps(data);
      },
      (err: Error) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, videoId]);

  function updateSteps(video: Video) {
    const newSteps: Step[] = processingSteps.map((step) => {
      let effectiveStatus: "complete" | "current" | "failed" | "upcoming";
      
      // Handle video rendering step
      if (step.id === "processing:video") {
        if (
          video.renderStatus?.progress === 1 ||
          video.renderStatus?.statusMessage === "completed"
        ) {
          effectiveStatus = "complete";
        } else if (video.status === "processing:render") {
          effectiveStatus = "current";
        } else {
          effectiveStatus = "upcoming";
        }
      } 
      // Handle YouTube upload step
      else if (step.id === "processing:upload") {
        if (video.uploadStatus?.youtube?.videoUrl) {
          effectiveStatus = "complete";
        } else if (video.uploadStatus?.youtube?.progress && 
                   video.uploadStatus.youtube.progress > 0 && 
                   video.uploadStatus.youtube.progress < 100) {
          effectiveStatus = "current";
        } else {
          effectiveStatus = "upcoming";
        }
      }
      else {
        effectiveStatus = computeEffectiveStatus(step);
      }

      return {
        id: step.id,
        name: step.name,
        status:
          effectiveStatus === "failed"
            ? "failed"
            : effectiveStatus === "complete"
              ? "complete"
              : effectiveStatus === "current"
                ? "current"
                : "upcoming",
        subSteps:
          step.id === "processing:voices"
            ? Object.entries(video.scenes).map(([sceneIndex, scene]) => {
                const index = Number(sceneIndex);
                return {
                  index,
                  scene: index + 1,
                  narration: scene.narration,
                  status:
                    video.voiceStatus?.[index]?.statusMessage ?? "pending",
                  progress: video.voiceStatus?.[index]?.progress ?? 0,
                };
              })
            : step.id === "processing:images"
              ? Object.entries(video.scenes).map(([sceneIndex, scene]) => {
                  const index = Number(sceneIndex);
                  return {
                    index,
                    scene: index + 1,
                    imagePrompt: scene.imagePrompt,
                    status:
                      video.imageStatus?.[index]?.statusMessage ?? "pending",
                    progress: video.imageStatus?.[index]?.progress ?? 0,
                  };
                })
              : undefined,
      };
    });
    setSteps(newSteps);
  }

  // Update stableAssets only if scenes or essential styling change.
  useEffect(() => {
    if (!video) return;
    const newAssets = {
      scenes: video.scenes,
      styling: video.styling
        ? { font: video.styling.font, variant: video.styling.variant }
        : null,
    };

    const newAssetsStr = JSON.stringify(newAssets);
    const oldAssetsStr = JSON.stringify(stableAssets);

    if (newAssetsStr !== oldAssetsStr) {
      setStableAssets(newAssets);
    }
  }, [video?.scenes, video?.styling]);

  // Method to update video details (title and description)
  async function updateVideoDetails(
    title: string,
    description: string
  ): Promise<void> {
    if (!video) return;
    try {
      const response = await fetch(`/api/video/${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update video details");
      }
    } catch (err) {
      console.error("Error updating video details:", err);
      throw err;
    }
  }

  // Method to update scenes 
  async function updateScenes(
    updatedScenes: { [key: number]: Scene }
  ): Promise<void> {
    if (!video) return;
    try {
      const response = await fetch(`/api/video/${video.id}/scenes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenes: updatedScenes }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update video scenes");
      }
    } catch (err) {
      console.error("Error updating scenes:", err);
      throw err;
    }
  }

  // Method to add a new scene to the video
  async function addScene(narration: string = "New scene"): Promise<void> {
    if (!video) return;
    try {
      const response = await fetch(`/api/video/${video.id}/scene`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ narration }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add new scene");
      }
    } catch (err) {
      console.error("Error adding new scene:", err);
      throw err;
    }
  }

  // New method to update music settings.
  async function updateMusic(
    newVolume: number,
    newUrl: string | null,
  ): Promise<void> {
    if (!video) return;
    try {
      const response = await fetch(`/api/video/${video.id}/music`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          musicVolume: newVolume,
          musicUrl: newUrl
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update music settings");
      }
    } catch (err) {
      console.error("Error updating music:", err);
      throw err;
    }
  }

  // New method to upload the video to YouTube.
  async function uploadToYoutube(uploadData: {
    channelId: string;
    publishAt: string; // ISO string
    timezone: string;
    privacy: "public" | "private" | "unlisted";
  }): Promise<void> {
    if (!video) return;
    try {
      await fetch("/api/video/youtube/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          ...uploadData,
        }),
      });
    } catch (err) {
      console.error("Error uploading video to YouTube:", err);
      throw err;
    }
  }

  return {
    video,
    steps,
    loading,
    error,
    stableAssets,
    updateVideoDetails,
    updateScenes,
    addScene,
    updateMusic,
    uploadToYoutube,
  };
}

/**
 * Helper function to compute effective status (for non-overridden steps).
 */
function computeEffectiveStatus(
  step: Step,
): "complete" | "current" | "failed" | "upcoming" {
  if (step.subSteps && step.subSteps.length > 0) {
    if (step.subSteps.every((sub) => sub.status === "completed")) {
      return "complete";
    } else if (step.subSteps.some((sub) => sub.status === "processing")) {
      return "current";
    } else if (step.subSteps.some((sub) => sub.status === "failed")) {
      return "failed";
    } else {
      return "upcoming";
    }
  }
  return step.status;
}
