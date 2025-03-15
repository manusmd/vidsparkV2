/**
 * Returns a user-friendly status message for a given video status.
 *
 * @param status - The video status.
 * @returns A friendly status message.
 */
export function getFriendlyStatus(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "processing:assets":
      return "Processing Assets";
    case "processing:upload":
      return "Uploading Video";
    case "processing:render":
      return "Rendering Video";
    case "render:complete":
      return "Render Complete";
    case "render:error":
      return "Error during Rendering";
    case "assets:ready":
      return "Assets Ready";
    case "completed":
      return "Video Completed";
    case "failed":
      return "Processing Failed";
    default:
      return "Unknown status";
  }
}
