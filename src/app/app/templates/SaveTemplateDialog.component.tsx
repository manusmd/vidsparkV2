"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { VideoTemplate, ContentType, ImageType } from "@/app/types";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/lib/routes";
import { TextDesignSelector } from "@/components/remotion/TextDesignSelector.component";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
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

const textPositionOptions = [
  { value: "top", label: "Top" },
  { value: "middle", label: "Middle" },
  { value: "bottom", label: "Bottom" }
];

const templateFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  defaultNarration: z.string().optional(),
  textPosition: z.enum(["top", "middle", "bottom"]),
  showTitle: z.boolean(),
  textDesign: z.object({
    fontId: z.string(),
    styleId: z.string(),
  }),
});

type SaveTemplateFormData = z.infer<typeof templateFormSchema>;

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  imageType: ImageType;
  voiceId: string;
  narration: string;
  onSaved?: () => void;
  musicId?: string;
}

export default function SaveTemplateDialog({
  open,
  onOpenChange,
  contentType,
  imageType,
  voiceId,
  narration,
  onSaved,
  musicId
}: SaveTemplateDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SaveTemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      defaultNarration: narration || "",
      textPosition: "top",
      showTitle: true,
      textDesign: {
        fontId: "roboto",
        styleId: "default",
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof templateFormSchema>) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Prepare properly typed template data
      const templateData: Partial<VideoTemplate> = {
        name: values.name,
        defaultNarration: values.defaultNarration,
        textPosition: values.textPosition,
        showTitle: values.showTitle,
        contentTypeId: contentType.id,
        imageStyleId: imageType.id,
        voiceId: voiceId,
        musicId: musicId || undefined,
        textDesign: values.textDesign,
      };
      
      const response = await fetch(ROUTES.API.TEMPLATES.BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        onOpenChange(false);
        if (onSaved) onSaved();
      } else {
        console.error("Error saving template:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSubmitting(false);
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
          <DialogDescription>
            Create a reusable template from this video
          </DialogDescription>
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
            
            <FormField
              control={form.control}
              name="textDesign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Design</FormLabel>
                  <FormControl>
                    <div className="border rounded-md p-3 bg-background">
                      <TextDesignSelector 
                        initialDesign={{
                          font: field.value.fontId,
                          variant: field.value.styleId,
                        }}
                        onChange={(design: { font: string; variant: string }) => {
                          field.onChange({
                            fontId: design.font,
                            styleId: design.variant,
                          });
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectTrigger className="bg-input">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {textPositionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                  <FormItem className="flex flex-row items-center justify-between rounded-md border border-border p-3 h-[74px]">
                    <div>
                      <FormLabel>Show Title</FormLabel>
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
            
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline" type="button" className="mr-2">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 