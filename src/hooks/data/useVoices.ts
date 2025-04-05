import { useEffect, useState } from "react";
import { useDataContext } from "@/contexts/DataContext";

interface Voice {
  id: string;
  name: string;
  labels: {
    accent?: string;
    age?: string;
    description?: string;
    gender?: string;
    use_case?: string;
  };
}

export function useVoices() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Try to use data from context if available
  try {
    const dataContext = useDataContext();
    
    // Return the data from context instead of making separate API calls
    return {
      voices: dataContext.voices,
      loading: dataContext.voicesLoading,
      error: dataContext.voicesError,
      refreshVoices: dataContext.refreshVoices,
    };
  } catch (e) {
    // If context is not available, fall back to original implementation
    useEffect(() => {
      const fetchVoices = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await fetch("/api/elevenlabs/voices");
          if (!response.ok) {
            throw new Error(`Failed to fetch voices: ${response.statusText}`);
          }

          const data = await response.json();
          setVoices(data.voices);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchVoices();
    }, []);

    const refreshVoices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/elevenlabs/voices");
        if (!response.ok) {
          throw new Error(`Failed to fetch voices: ${response.statusText}`);
        }

        const data = await response.json();
        setVoices(data.voices);
        return data.voices;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return { voices, loading, error, refreshVoices };
  }
}
