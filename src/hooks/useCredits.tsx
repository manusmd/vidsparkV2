"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserCredits, UserCredits } from "@/services/credits/creditService";

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        setCredits(null);
        setCreditsLoading(false);
        return;
      }

      try {
        setCreditsLoading(true);
        const userCredits = await getUserCredits(user.uid);
        setCredits(userCredits);
        setCreditsError(null);
      } catch (error) {
        console.error("Error fetching credits:", error);
        setCreditsError("Failed to fetch credits");
        setCredits(null);
      } finally {
        setCreditsLoading(false);
      }
    };

    fetchCredits();
  }, [user]);

  return {
    credits,
    creditsLoading,
    creditsError,
  };
} 