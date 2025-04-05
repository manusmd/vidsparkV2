"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTemplates } from "@/hooks/data/useTemplates";
import { useTextDesign } from "@/hooks/useTextDesign";
import { useMusic } from "@/providers/useMusic";
import { VideoTemplate, ContentType, ImageType } from "@/app/types";
import { useAuth } from "@/hooks/useAuth";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, BookmarkPlus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  defaultNarration: z.string().optional(),
  textPosition: z.enum(["top", "middle", "bottom"]),
  showTitle: z.boolean(),
});

type SaveTemplateFormData = z.infer<typeof formSchema>;

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  imageType: ImageType;
  voiceId: string;
  narration?: string;
  onSaved?: () => void;
}

export default function SaveTemplateDialog({
  open,
  onOpenChange,
  contentType,
  imageType,
  voiceId,
  narration,
  onSaved,
}: SaveTemplateDialogProps) {
  const { user } = useAuth();
  const { createTemplate } = useTemplates();
  const { textDesign } = useTextDesign();
  const { selectedMusic } = useMusic();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SaveTemplateFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `${contentType.title} Template`,
      defaultNarration: narration || "",
      textPosition: textDesign?.position || "bottom",
      showTitle: textDesign?.showTitle !== undefined ? textDesign.showTitle : true,
    },
  });

  const onSubmit = async (data: SaveTemplateFormData) => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const templateData: Partial<VideoTemplate> = {
        name: data.name,
        contentTypeId: contentType.id,
        imageStyleId: imageType.id,
        voiceId: voiceId,
        defaultNarration: data.defaultNarration || undefined,
        textDesign: {
          fontId: textDesign?.fontId || "default",
          styleId: textDesign?.styleId || "default",
        },
        textPosition: data.textPosition,
        showTitle: data.showTitle,
        musicId: selectedMusic?.id || "default",
      };
      
      await createTemplate(templateData);
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Call onSaved callback if provided
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border text-foreground sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5 text-primary" />
            Save as Template
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a name for your template"
                      className="bg-input"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="defaultNarration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Narration</FormLabel>
                  <FormDescription>
                    Save narration as part of the template (optional)
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter default narration (can be customized later)"
                      className="bg-input resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="textPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Position</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="showTitle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Show Title</FormLabel>
                      <FormDescription>
                        Display title in videos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Template Configuration</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Content Type:</span>
                  <span className="font-medium">{contentType.title}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Image Style:</span>
                  <span className="font-medium">{imageType.title}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Voice:</span>
                  <span className="font-medium">{voiceId}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Text Style:</span>
                  <span className="font-medium">{textDesign?.styleId || "Default"}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Font:</span>
                  <span className="font-medium">{textDesign?.fontId || "Default"}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Music:</span>
                  <span className="font-medium">{selectedMusic?.title || "Default"}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Template"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 