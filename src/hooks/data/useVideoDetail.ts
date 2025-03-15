import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Scene, Step, Video } from "@/app/types";

// Define processing steps globally (reused in the hook)
const processingSteps = [
  { id: "processing:voices", name: "Generating Voice" },
  { id: "processing:images", name: "Generating Images" },
  { id: "processing:video", name: "Rendering Video" },
  { id: "processing:upload", name: "Uploading to YouTube" },
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
    const currentStepIndex = processingSteps.findIndex(
      (s) => s.id === video.status,
    );

    const newSteps: Step[] = processingSteps.map((step, index) => {
      const isCompleted = index < currentStepIndex;
      const isCurrent = step.id === video.status;
      const isFailed =
        (step.id === "processing:voices" &&
          video.voiceStatus &&
          Object.values(video.voiceStatus).some(
            (s) => s.statusMessage === "failed",
          )) ||
        (step.id === "processing:images" &&
          video.imageStatus &&
          Object.values(video.imageStatus).some(
            (s) => s.statusMessage === "failed",
          ));

      return {
        id: step.id,
        name: step.name,
        status: isFailed
          ? "failed"
          : isCompleted
            ? "complete"
            : isCurrent
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
  return { video, steps, loading, error, stableAssets };
}
