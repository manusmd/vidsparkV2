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
  const dataContext = useDataContext();

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

  useEffect(() => {
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

  if (dataContext) {
    return {
      voices: dataContext.voices,
      loading: dataContext.voicesLoading,
      error: dataContext.voicesError,
      refreshVoices: dataContext.refreshVoices,
    };
  }

  return { voices, loading, error, refreshVoices };
}
