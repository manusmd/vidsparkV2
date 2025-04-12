"use client";

import React, { useState } from "react";
import { useTemplates } from "@/hooks/data/useTemplates";
import { useCachedData } from "@/hooks/data/useCachedData";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useImageTypes } from "@/hooks/data/useImageTypes";
import { useVoices } from "@/hooks/data/useVoices";
import { Bookmark, Trash2, Loader2, Pencil, Copy } from "lucide-react";
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
import { toast } from "sonner";
import { BulkCreateDialog } from "./BulkCreateDialog.component";
import { Input } from "@/components/ui/input";

export default function TemplatesPage() {
  const router = useRouter();
  const { data, isLoading: dataLoading } = useCachedData();
  const { contentTypes, voices, imageTypes } = data;
  const { templates, loading: templatesLoading, deleteTemplate } = useTemplates();
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [emptyTemplate, setEmptyTemplate] = useState<VideoTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<VideoTemplate | null>(null);
  const [bulkCreateTemplate, setBulkCreateTemplate] = useState<VideoTemplate | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplateToDelete(id);
      try {
        await deleteTemplate(id);
        toast("Your template has been deleted successfully");
      } catch (error) {
        console.error("Failed to delete template:", error);
        toast("Failed to delete template", {
          style: { backgroundColor: "red" }
        });
      } finally {
        setTemplateToDelete(null);
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
    toast("Your template has been updated successfully");
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return "Unknown";
    }
  };

  const createFromTemplate = (template: VideoTemplate) => {
    router.push(`${ROUTES.PAGES.APP.STUDIO}/${template.contentTypeId}?template=${template.id}`);
  };

  const handleCreateTemplate = () => {
    const defaultTemplate: VideoTemplate = {
      id: '',
      name: '',
      userId: '',
      contentTypeId: contentTypes.length > 0 ? contentTypes[0].id : '',
      imageStyleId: imageTypes.length > 0 ? imageTypes[0].id : '',
      voiceId: voices.length > 0 ? voices[0].id : '',
      textPosition: 'top',
      showTitle: true,
      createdAt: '',
      lastUsedAt: '',
      styling: {
        font: 'default',
        variant: 'default'
      },
      musicId: '',
      musicVolume: 0.5
    };
    
    setEmptyTemplate(defaultTemplate);
    setCreateTemplateOpen(true);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredTemplates = templates.filter((template) =>
    template.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          onClick={handleCreateTemplate}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Bookmark className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex items-center pb-4 gap-2">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={handleSearchInput}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={() => setSearchQuery("")}>
          Clear
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
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(template)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkCreate(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Bulk Create
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(template.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Content Type</span>
                    <span className="text-sm font-medium">{findContentTypeName(template.contentTypeId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Style</span>
                    <span className="text-sm font-medium">{findImageTypeName(template.imageStyleId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Voice</span>
                    <span className="text-sm font-medium">{findVoiceName(template.voiceId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Used</span>
                    <span className="text-sm font-medium">{getTemplateLastUsed(template)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => createFromTemplate(template)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {editDialogOpen && editingTemplate && (
        <EditTemplateDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          template={editingTemplate}
          onSaved={handleEditSaved}
        />
      )}

      {bulkDialogOpen && bulkCreateTemplate && (
        <BulkCreateDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          template={bulkCreateTemplate}
        />
      )}
    </div>
  );
} 