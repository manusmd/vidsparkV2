export async function fetchVoicesFromBackend() {
  try {
    const response = await fetch("/api/elevenlabs/voices");

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices; // Returns array of voices
  } catch (error) {
    console.error("Error fetching voices:", error);
    return [];
  }
}
