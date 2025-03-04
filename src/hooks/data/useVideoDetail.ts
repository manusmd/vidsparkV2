import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Step, Video } from "@/app/types";

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

  useEffect(() => {
    if (!videoId) return;

    // Subscribe to real-time Firestore updates
    const unsubscribe = onSnapshot(
      doc(db, "videos", videoId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const videoData = docSnapshot.data();
          const video: Video = {
            id: docSnapshot.id,
            title: videoData.title ?? "Untitled Video",
            description: videoData.description ?? "No description available.",
            voiceId: videoData.voiceId ?? "",
            scenes: videoData.scenes ?? [],
            status: videoData.status ?? "processing:voices",
            sceneStatus: videoData.sceneStatus ?? {},
            imageStatus: videoData.imageStatus ?? {},
            voiceStatus: videoData.voiceStatus ?? {},
            createdAt: videoData.createdAt?.toDate
              ? videoData.createdAt.toDate()
              : new Date(),
          };

          setVideo(video);
          setLoading(false);
          updateSteps(video); // Update steps based on latest video data
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

  // Function to update processing steps dynamically
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
            ? video.scenes.map((scene, sceneIndex) => ({
                index: sceneIndex,
                scene: sceneIndex + 1,
                narration: scene.narration,
                status:
                  video.voiceStatus?.[sceneIndex]?.statusMessage ?? "pending",
                progress: video.voiceStatus?.[sceneIndex]?.progress ?? 0,
              }))
            : step.id === "processing:images"
              ? video.scenes.map((scene, sceneIndex) => ({
                  index: sceneIndex,
                  scene: sceneIndex + 1,
                  imagePrompt: scene.imagePrompt,
                  status:
                    video.imageStatus?.[sceneIndex]?.statusMessage ?? "pending",
                  progress: video.imageStatus?.[sceneIndex]?.progress ?? 0,
                }))
              : undefined,
      };
    });

    setSteps(newSteps);
  }

  return { video, steps, loading, error };
}
