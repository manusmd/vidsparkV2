"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { TimePicker } from "@/components/ui/timepicker";
import { Account } from "@/app/types";

export interface YouTubeUploadData {
  channelId: string;
  publishAt: Date;
  timezone: string;
  privacy: "public" | "private" | "unlisted";
}

interface YouTubeUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: YouTubeUploadData) => Promise<void>;
  channels: Account[];
}

export const YoutubeUploadModal: React.FC<YouTubeUploadModalProps> = ({
  open,
  onClose,
  onSubmit,
  channels,
}) => {
  const [channelId, setChannelId] = useState<string>(
    channels.length > 0 ? channels[0].id : "",
  );
  const [publishDate, setPublishDate] = useState<Date | undefined>(undefined);
  const [publishTime, setPublishTime] = useState<Date | undefined>(undefined);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [privacy, setPrivacy] = useState<"public" | "private" | "unlisted">(
    "public",
  );

  // When submitting, merge date and time into a single Date object.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishDate || !publishTime) return;
    // Merge publishDate and publishTime into one Date object.
    const merged = new Date(publishDate);
    merged.setHours(publishTime.getHours(), publishTime.getMinutes(), 0, 0);
    await onSubmit({
      channelId,
      publishAt: merged,
      timezone,
      privacy,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Video to YouTube</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select YouTube Channel
            </label>
            <Select value={channelId} onValueChange={setChannelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Upload Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Schedule Upload Date
            </label>
            <DatePicker date={publishDate} setDate={setPublishDate} />
          </div>

          {/* Schedule Upload Time */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Schedule Upload Time
            </label>
            <TimePicker time={publishTime} setTime={setPublishTime} />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"].map(
                  (tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium mb-1">Privacy</label>
            <Select
              value={privacy}
              onValueChange={(val) =>
                setPrivacy(val as "public" | "private" | "unlisted")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Upload Video</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
