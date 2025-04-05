"use client";

import React, { useState } from "react";
import { useTemplates } from "@/hooks/data/useTemplates";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useImageTypes } from "@/hooks/data/useImageTypes";
import { useVoices } from "@/hooks/data/useVoices";
import { Bookmark, Trash2, Loader2, PlusCircle, Pencil, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { VideoTemplate } from "@/app/types";
import { useRouter } from "next/navigation";
import EditTemplateDialog from "./EditTemplateDialog.component";
import ROUTES from "@/lib/routes";
import { toast } from "@/components/ui/use-toast";
import { BulkCreateDialog } from "./BulkCreateDialog.component";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function TemplatesPage() {
  const router = useRouter();
  const { templates, loading: templatesLoading, deleteTemplate } = useTemplates();
  const { contentTypes } = useContentTypes();
  const { imageTypes } = useImageTypes();
  const { voices } = useVoices();
  
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<VideoTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkCreateTemplate, setBulkCreateTemplate] = useState<VideoTemplate | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setDeleting(id);
      try {
        await deleteTemplate(id);
        toast("Template deleted", {
          description: "Your template has been deleted successfully"
        });
      } catch (error) {
        console.error("Failed to delete template:", error);
        toast("Error", {
          description: "Failed to delete template",
          style: { backgroundColor: "red" }
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleEdit = (template: VideoTemplate) => {
    setEditingTemplate(template);
    setEditDialogOpen(true);
  };

  const handleBulkCreate = (template: VideoTemplate) => {
    setBulkCreateTemplate(template);
    setBulkDialogOpen(true);
  };

  const handleEditSaved = () => {
    toast("Template updated", {
      description: "Your template has been updated successfully"
    });
  };

  const findContentTypeName = (id: string) => {
    return contentTypes.find((type) => type.id === id)?.title || "Unknown Content Type";
  };

  const findImageTypeName = (id: string) => {
    return imageTypes.find((type) => type.id === id)?.title || "Unknown Style";
  };

  const findVoiceName = (id: string) => {
    return voices.find((voice) => voice.id === id)?.name || "Unknown Voice";
  };
  
  const getTemplateLastUsed = (template: VideoTemplate) => {
    try {
      return formatDistanceToNow(new Date(template.lastUsedAt), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const createFromTemplate = (template: VideoTemplate) => {
    // Navigate to create video page with template ID as a query parameter
    // We need to navigate to a specific content type URL with the template param
    router.push(`${ROUTES.PAGES.APP.STUDIO}/${template.contentTypeId}?template=${template.id}`);
  };

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
        <span className="text-xl font-medium">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Video Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved templates to quickly create videos
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Video
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-muted/40 border rounded-lg p-10 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Save your video creation settings as templates to quickly create videos with the same style and voice.
          </p>
          <Button
            onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Create Your First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card border rounded-lg overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold break-words pr-6">
                    {template.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mt-1">
                        <span className="sr-only">Open menu</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                          <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEdit(template)}
                        className="text-primary focus:text-primary"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkCreate(template)}
                        className="focus:text-primary"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Bulk Create
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(template.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        {deleting === template.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground min-w-24">Content Type:</span>
                    <span className="text-sm font-medium">{findContentTypeName(template.contentTypeId)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground min-w-24">Image Style:</span>
                    <span className="text-sm font-medium">{findImageTypeName(template.imageStyleId)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground min-w-24">Voice:</span>
                    <span className="text-sm font-medium">{findVoiceName(template.voiceId)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground min-w-24">Last Used:</span>
                    <span className="text-sm text-muted-foreground">{getTemplateLastUsed(template)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => createFromTemplate(template)}
                  className="w-full bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600"
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {editingTemplate && (
        <EditTemplateDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          template={editingTemplate}
          onSaved={handleEditSaved}
        />
      )}

      {bulkCreateTemplate && (
        <BulkCreateDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          template={bulkCreateTemplate}
        />
      )}
    </div>
  );
} 