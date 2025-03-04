import { useEffect, useState } from "react";

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

  return { voices, loading, error };
}
