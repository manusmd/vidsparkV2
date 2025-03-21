"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Video } from "@/app/types";

export function useStory() {
  const { user } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<Video | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId || !db) return;
    const unsubscribe = onSnapshot(
      doc(db, "videos", videoId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const videoData = docSnapshot.data() as Video;
          // Update the story only when the status is "draft" or "failed"
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

  useEffect(() => {
    // When videoId is set, navigate to the video page.
    if (videoId) {
      router.push(`/app/videos/${videoId}`);
    }
  }, [videoId, router]);

  const generateStory = async (params: {
    narration: string;
    imageType: string;
    voiceId: string;
  }) => {
    setIsGenerating(true);
    setError(null);
    if (!user) return;
    try {
      const res = await fetch("/api/openai/storyrequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          narration: params.narration,
          imageType: params.imageType,
          voiceId: params.voiceId,
          uid: user.uid,
        }),
      });
      if (!res.ok) throw new Error("Failed to trigger story generation.");
      const data = await res.json();
      // Assume the API returns an object with a videoId field.
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
