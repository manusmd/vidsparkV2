import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Edit,
  Settings,
  Image,
  FileText,
  ListVideo,
  Share2,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      id: "upload",
      title: "Upload Video",
      description: "Upload a new video to YouTube",
      icon: Upload,
      variant: "default",
    },
    {
      id: "edit",
      title: "Quick Edit",
      description: "Edit video details and settings",
      icon: Edit,
      variant: "outline",
    },
    {
      id: "playlist",
      title: "Manage Playlists",
      description: "Organize your video playlists",
      icon: ListVideo,
      variant: "outline",
    },
    {
      id: "thumbnail",
      title: "Customize Thumbnails",
      description: "Create and edit video thumbnails",
      icon: Image,
      variant: "outline",
    },
    {
      id: "description",
      title: "Update Descriptions",
      description: "Edit video descriptions and metadata",
      icon: FileText,
      variant: "outline",
    },
    {
      id: "settings",
      title: "Channel Settings",
      description: "Manage your channel settings",
      icon: Settings,
      variant: "outline",
    },
    {
      id: "share",
      title: "Share Channel",
      description: "Share your channel with others",
      icon: Share2,
      variant: "outline",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant as "default" | "outline"}
              className="h-auto py-4 px-4 flex flex-col items-start justify-start space-y-2"
            >
              <action.icon className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 