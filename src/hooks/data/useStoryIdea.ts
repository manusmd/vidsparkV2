import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export interface StoryIdea {
  uid: string;
  narration: string;
  status?: string;
}

export function useStoryIdea() {
  const { user } = useAuth();
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [storyIdea, setStoryIdea] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ideaId || !db) return;
    console.log("Subscribing to story idea with ID:", ideaId);
    const ideaDocRef = doc(db, "storyIdeas", ideaId);
    const unsubscribe = onSnapshot(
      ideaDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StoryIdea;
          console.log("Story idea document data:", data);
          if (data.status === "completed") {
            setStoryIdea(data.narration);
            setIsLoading(false);
            setIsGenerating(false);
          } else {
            setIsLoading(true);
            setIsGenerating(true);
          }
        } else {
          console.warn("Story idea document does not exist:", ideaId);
        }
      },
      (err) => {
        console.error("Error subscribing to story idea:", err);
        setError(err.message);
      },
    );
    return () => unsubscribe();
  }, [ideaId]);

  const generateStoryIdea = async (prompt: string) => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/openai/storyidea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, uid: user.uid }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate story idea.");
      }
      const data = await response.json();
      console.log("API response for story idea:", data);
      setIdeaId(data.ideaId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred");
      }
    }
  };

  return {
    storyIdea,
    ideaId,
    isGenerating,
    isLoading,
    error,
    generateStoryIdea,
  };
}
