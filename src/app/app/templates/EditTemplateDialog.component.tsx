"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTemplates } from "@/hooks/data/useTemplates";
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useImageTypes } from "@/hooks/data/useImageTypes";
import { useVoices } from "@/hooks/data/useVoices";
import { useMusicTracks } from "@/hooks/data/useMusicTracks";
import { VideoTemplate } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { TextPositionSelector } from "@/components/video/TextPositionSelector.component";
import { TextDesignSelector } from "@/components/remotion/TextDesignSelector.component";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";

const templateFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  defaultNarration: z.string().optional(),
  textPosition: z.enum(["top", "middle", "bottom"]),
  showTitle: z.boolean(),
  contentTypeId: z.string().min(1, { message: "Content type is required" }),
  imageStyleId: z.string().min(1, { message: "Image style is required" }),
  voiceId: z.string().min(1, { message: "Voice is required" }),
  musicId: z.string().optional(),
  textDesign: z.object({
    fontId: z.string(),
    styleId: z.string(),
  }),
});

type FormValues = z.infer<typeof templateFormSchema>;

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: VideoTemplate;
  onSaved?: () => void;
}

export default function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  onSaved
}: EditTemplateDialogProps) {
  const { user } = useAuth();
  const { updateTemplate } = useTemplates();
  const { contentTypes } = useContentTypes();
  const { imageTypes } = useImageTypes();
  const { voices } = useVoices();
  const { musicTracks } = useMusicTracks();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template.name || "",
      defaultNarration: template.defaultNarration || "",
      textPosition: template.textPosition || "top",
      showTitle: template.showTitle || true,
      contentTypeId: template.contentTypeId || "",
      imageStyleId: template.imageStyleId || "",
      voiceId: template.voiceId || "",
      musicId: template.musicId ? template.musicId : "none",
      textDesign: template.textDesign || {
        fontId: "roboto",
        styleId: "default",
      },
    }
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  useEffect(() => {
    if (open && template) {
      form.reset({
        name: template.name || "",
        defaultNarration: template.defaultNarration || "",
        textPosition: template.textPosition || "top",
        showTitle: template.showTitle || true,
        contentTypeId: template.contentTypeId || "",
        imageStyleId: template.imageStyleId || "",
        voiceId: template.voiceId || "",
        musicId: template.musicId ? template.musicId : "none",
        textDesign: template.textDesign || {
          fontId: "roboto",
          styleId: "default",
        },
      });
    }
  }, [form, open, template]);
  
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const updateData: Partial<VideoTemplate> = {
        name: data.name,
        defaultNarration: data.defaultNarration,
        textPosition: data.textPosition,
        showTitle: data.showTitle,
        contentTypeId: data.contentTypeId,
        imageStyleId: data.imageStyleId,
        voiceId: data.voiceId,
        textDesign: data.textDesign,
        musicId: data.musicId === "none" ? "" : data.musicId
      };
      
      await updateTemplate(template.id, updateData);
      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Update your template settings. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <div className="px-6">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="basic" className="px-6 space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="My Awesome Template" 
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
                      <FormLabel>Default Narration (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a default narration text..." 
                          className="resize-none min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="content" className="px-6 space-y-4 pt-2">
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="contentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.title}
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
                    name="imageStyleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Style</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select image style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {imageTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="voiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select voice" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {voices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="design" className="px-6 space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="textPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Position</FormLabel>
                      <FormControl>
                        <TextPositionSelector 
                          value={field.value} 
                          onChange={field.onChange} 
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
                
                <FormField
                  control={form.control}
                  name="showTitle"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Show Title</FormLabel>
                        <FormDescription>
                          Display the video title at the beginning
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
              </TabsContent>
              
              <TabsContent value="audio" className="px-6 space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="musicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Music</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select music" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Music</SelectItem>
                          {musicTracks.map((track) => (
                            <SelectItem key={track.id} value={track.id}>
                              {track.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="px-6 pb-4 pt-2 flex justify-end gap-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 