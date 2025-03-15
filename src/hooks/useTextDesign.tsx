import { useVideoDetail } from "@/hooks/data/useVideoDetail";

export function useTextDesign(videoId: string) {
  const { video, loading, error } = useVideoDetail(videoId);
  const styling = video?.styling || null;

  const updateStyling = async (variant: string, font: string) => {
    const res = await fetch(`/api/video/styling`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, variant, font }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error updating styling");
    }
    return res.json();
  };

  return { styling, loading, error, updateStyling };
}
