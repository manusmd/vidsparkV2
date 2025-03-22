import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Scene, Step, Video } from "@/app/types";

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
  const [steps, setSteps] = useState<Step[]>([]);
  const [stableAssets, setStableAssets] = useState<{
    scenes: Video["scenes"];
    styling: Video["styling"] | null;
  } | null>(null);

  useEffect(() => {
    if (!videoId || !db) return;
    const unsubscribe = onSnapshot(
      doc(db, "videos", videoId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const videoData = docSnapshot.data();

          const scenes = videoData.scenes ?? {};
          const formattedScenes = Object.entries(scenes).reduce(
            (acc, [key, value]) => {
              acc[Number(key)] = value as Scene;
              return acc;
            },
            {} as Record<number, Scene>,
          );

          const newVideo: Video = {
            id: docSnapshot.id,
            title: videoData.title ?? "Untitled Video",
            description: videoData.description ?? "No description available.",
            voiceId: videoData.voiceId ?? "",
            scenes: formattedScenes,
            status: videoData.status ?? "processing:voices",
            sceneStatus: videoData.sceneStatus ?? {},
            renderStatus: videoData.renderStatus ?? {},
            imageStatus: videoData.imageStatus ?? {},
            voiceStatus: videoData.voiceStatus ?? {},
            styling: videoData.styling ?? null,
            musicVolume: videoData.musicVolume ?? 0,
            musicUrl: videoData.musicUrl ?? null,
            createdAt: videoData.createdAt?.toDate
              ? videoData.createdAt.toDate()
              : new Date(),
          };

          setVideo(newVideo);
          setLoading(false);
          updateSteps(newVideo);
        } else {
          setError("Video not found.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching video:", err);
        setError("Failed to fetch video details.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [videoId]);

  function updateSteps(video: Video) {
    const newSteps: Step[] = processingSteps.map((step) => {
      let effectiveStatus: "complete" | "current" | "failed" | "upcoming";
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
      } else {
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

  // New method to update music settings.
  async function updateMusic(
    newVolume: number,
    newUrl: string | null,
  ): Promise<void> {
    if (!video || !db) return;
    try {
      const videoRef = doc(db, "videos", video.id);
      await updateDoc(videoRef, { musicVolume: newVolume, musicUrl: newUrl });
    } catch (err) {
      console.error("Error updating music:", err);
      throw err;
    }
  }

  return { video, steps, loading, error, stableAssets, updateMusic };
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
