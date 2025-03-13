import { useState, useEffect } from "react";
import type { Video } from "@/app/types";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GenerateStoryParams {
  contentType: string;
  customPrompt?: string;
  voiceId: string;
  uid: string;
}

export function useStory() {
  const [story, setStory] = useState<Video | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    const unsubscribe = onSnapshot(
      doc(db, "videos", videoId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const videoData = docSnapshot.data() as Video;
          // Only update the story (and end loading) when status is "draft" or "failed"
          if (videoData.status === "draft" || videoData.status === "failed") {
            setStory(videoData);
            setIsGenerating(false);
          }
        }
      },
      (err) => {
        setError(err.message || "Error fetching video details");
      },
    );
    return () => unsubscribe();
  }, [videoId]);

  const generateStory = async (params: GenerateStoryParams) => {
    setIsGenerating(true);
    setError(null);
    try {
      // Trigger the Firebase Function via your API endpoint.
      const res = await fetch("/api/openai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: params.contentType,
          customPrompt: params.customPrompt || "",
          voiceId: params.voiceId,
          uid: params.uid,
        }),
      });
      if (!res.ok) throw new Error("Failed to trigger story generation.");
      const data = await res.json();
      setVideoId(data.videoId);
      // isGenerating remains true until the onSnapshot receives a video with status "draft" or "failed"
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred");
      }
      setIsGenerating(false);
    }
  };

  return { story, videoId, isGenerating, error, generateStory };
}
