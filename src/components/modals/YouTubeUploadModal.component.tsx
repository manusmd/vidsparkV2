"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Clock, Globe, Lock, Youtube } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from "embla-carousel-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [privacy, setPrivacy] = useState<"public" | "private" | "unlisted">(
    "public",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    channelId?: string;
    publishDate?: string;
    publishTime?: string;
  }>({});

  // Set up Embla carousel for channel selection
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });

  // Scroll to the selected channel when channelId changes
  useEffect(() => {
    if (emblaApi && channelId) {
      const index = channels.findIndex(c => c.id === channelId);
      if (index !== -1) {
        emblaApi.scrollTo(index);
      }
    }
  }, [emblaApi, channelId, channels]);

  // Set privacy to private when scheduling
  useEffect(() => {
    if (publishMode === "schedule") {
      setPrivacy("private");
    }
  }, [publishMode]);

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: {
      channelId?: string;
      publishDate?: string;
      publishTime?: string;
    } = {};

    if (!channelId) {
      newErrors.channelId = "Please select a YouTube channel";
    }

    // Only validate date and time if scheduling
    if (publishMode === "schedule") {
      if (!publishDate) {
        newErrors.publishDate = "Please select a date";
      }

      if (!publishTime) {
        newErrors.publishTime = "Please select a time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // When submitting, merge date and time into a single Date object.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let publishAt: Date;

      if (publishMode === "now") {
        // Use current date/time if publishing now
        publishAt = new Date();
      } else {
        // Merge publishDate and publishTime into one Date object.
        publishAt = new Date(publishDate!);
        publishAt.setHours(publishTime!.getHours(), publishTime!.getMinutes(), 0, 0);
      }

      await onSubmit({
        channelId,
        publishAt,
        timezone,
        privacy,
      });

      onClose();
    } catch (error) {
      console.error("Error uploading to YouTube:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Youtube className="h-5 w-5 text-red-600" />
            Upload Video to YouTube
          </DialogTitle>
          <DialogDescription>
            Schedule your video to be published on YouTube. Select a channel, date, time, and privacy setting.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Channel Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">
                YouTube Channel
              </Label>
              {errors.channelId && (
                <span className="text-xs text-destructive">{errors.channelId}</span>
              )}
            </div>
            <Card className="border border-input overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Carousel Navigation */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button"
                      className="h-8 w-8 rounded-full bg-background/80 shadow-md"
                      onClick={() => emblaApi?.scrollPrev()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button"
                      className="h-8 w-8 rounded-full bg-background/80 shadow-md"
                      onClick={() => emblaApi?.scrollNext()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Channel Carousel */}
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                      {channels.map((channel) => (
                        <motion.div 
                          key={channel.id} 
                          className={cn(
                            "flex-[0_0_auto] min-w-[180px] p-4 cursor-pointer transition-all",
                            channelId === channel.id ? "scale-100" : "scale-95 opacity-70"
                          )}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setChannelId(channel.id)}
                        >
                          <div className={cn(
                            "flex flex-col items-center gap-3 p-3 rounded-lg transition-all",
                            channelId === channel.id ? "bg-primary/10 shadow-md" : "hover:bg-muted"
                          )}>
                            <div className="relative">
                              <Avatar className="h-16 w-16 border-2 shadow-md">
                                <AvatarImage src={channel.channelThumbnail} alt={channel.accountName} />
                                <AvatarFallback className="text-lg">{channel.accountName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {channelId === channel.id && (
                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-md">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm truncate max-w-[150px]">{channel.accountName}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">YouTube</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Publication Options Tabs */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Publication Options
            </Label>
            <Tabs value={publishMode} onValueChange={(value) => setPublishMode(value as "now" | "schedule")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="now">Now</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="now" className="pt-4">
                <Card className="border border-input">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-base font-medium">Publish Immediately</p>
                        <p className="text-sm text-muted-foreground">
                          Your video will be published as soon as processing is complete
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">
                      Schedule Publication
                    </Label>
                    {(errors.publishDate || errors.publishTime) && (
                      <span className="text-xs text-destructive">
                        {errors.publishDate || errors.publishTime}
                      </span>
                    )}
                  </div>
                  <Card className="border border-input">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        {/* Selected Date/Time Display */}
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={`${publishDate?.toISOString() || 'no-date'}-${publishTime?.toISOString() || 'no-time'}`}
                          >
                            {publishDate && publishTime ? (
                              <>
                                <p className="text-2xl font-semibold">
                                  {format(publishDate, 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-lg text-muted-foreground mt-1">
                                  at {format(publishTime, 'h:mm a')} ({timezone})
                                </p>
                              </>
                            ) : (
                              <p className="text-lg text-muted-foreground">
                                Select a date and time to schedule your video
                              </p>
                            )}
                          </motion.div>
                        </div>

                        {/* Date/Time Selector Tabs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div 
                            className={cn(
                              "relative overflow-hidden rounded-lg border p-3 cursor-pointer transition-all",
                              publishDate ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="h-5 w-5 text-primary" />
                              <span className="font-medium">Date</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {publishDate ? format(publishDate, 'MMM d, yyyy') : 'Select a date'}
                            </p>
                            <div className="relative mt-2">
                              <DatePicker 
                                date={publishDate} 
                                setDate={setPublishDate}
                              />
                            </div>
                          </div>

                          <div 
                            className={cn(
                              "relative overflow-hidden rounded-lg border p-3 cursor-pointer transition-all",
                              publishTime ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <span className="font-medium">Time</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {publishTime ? format(publishTime, 'h:mm a') : 'Select a time'}
                            </p>
                            <div className="relative mt-2">
                              <TimePicker 
                                time={publishTime} 
                                setTime={setPublishTime}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Timezone and Privacy Settings */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Additional Settings
            </Label>
            <Card className="border border-input">
              <CardContent className="p-3 space-y-4">
                {/* Timezone */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="timezone" className="text-xs text-muted-foreground">
                      Timezone
                    </Label>
                  </div>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "UTC",
                        "America/New_York",
                        "America/Los_Angeles",
                        "America/Chicago",
                        "Europe/London",
                        "Europe/Paris",
                        "Europe/Berlin",
                        "Asia/Tokyo",
                        "Asia/Singapore",
                        "Australia/Sydney",
                      ].map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Privacy */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="privacy" className="text-xs text-muted-foreground">
                      Privacy Setting
                    </Label>
                    {publishMode === "schedule" && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        (Locked to Private for scheduled uploads)
                      </span>
                    )}
                  </div>
                  {publishMode === "now" ? (
                    <Select
                      value={privacy}
                      onValueChange={(val) =>
                        setPrivacy(val as "public" | "private" | "unlisted")
                      }
                    >
                      <SelectTrigger id="privacy" className="w-full">
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Public - Visible to everyone
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            Private - Only visible to you
                          </div>
                        </SelectItem>
                        <SelectItem value="unlisted">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                            Unlisted - Only visible with the link
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      <span>Private - Only visible to you</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Uploading</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                "Upload Video"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
