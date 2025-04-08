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
  const { styling } = useTextDesign();
  const { musicUrl } = useMusic();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SaveTemplateFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `${contentType.title} Template`,
      defaultNarration: narration || "",
      textPosition: "bottom",
      showTitle: true,
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
          fontId: styling?.font || "roboto",
          styleId: styling?.variant || "default",
        },
        musicId: musicUrl ? "default" : undefined,
        userId: user.uid,
      };

      await createTemplate(templateData);
      
      if (onSaved) {
        onSaved();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template name" {...field} />
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
                  <FormControl>
                    <Textarea 
                      placeholder="Enter default narration text" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This text will be used as the default narration when creating videos from this template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                        <SelectValue placeholder="Select text position" />
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Title</FormLabel>
                    <FormDescription>
                      Display the title text in the video
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
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 