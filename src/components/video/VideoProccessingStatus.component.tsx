"use client";

import { Loader2 } from "lucide-react";

interface VideoProcessingStatusProps {
  status: string;
}

export function VideoProcessingStatus({ status }: VideoProcessingStatusProps) {
  let title = "";
  let message = "";
  let bgClass = "";

  if (status === "draft") {
    title = "Draft Video";
    message =
      "Your video is in draft mode. Generate the video to display the preview.";
    bgClass = "bg-gray-500";
  } else if (status.startsWith("processing")) {
    title = "Processing Assets";
    message = "Your video assets are currently being processed. Please wait...";
    bgClass = "bg-gradient-to-r from-blue-500 to-purple-500";
  } else {
    title = "Status Unknown";
    message = "Please check your video status.";
    bgClass = "bg-yellow-500";
  }

  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-full ${bgClass} rounded-lg p-4 text-white`}
    >
      {status !== "draft" && (
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
      )}
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-center">{message}</p>
    </div>
  );
}
