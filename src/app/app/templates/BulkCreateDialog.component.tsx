"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PAGES } from "@/lib/routes";
import { useBulkCreate } from "@/hooks/data/useBulkCreate";
import { toast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VideoTemplate } from "@/app/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  count: z
    .number()
    .min(1, "Must create at least 1 video")
    .max(20, "Maximum 20 videos at once")
    .int("Must be a whole number")
    .default(1),
  topicPrompt: z
    .string()
    .max(200, "Topic prompt must be at most 200 characters")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BulkCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: VideoTemplate;
}

export function BulkCreateDialog({
  open,
  onOpenChange,
  template,
}: BulkCreateDialogProps) {
  const router = useRouter();
  const { createBulkVideos } = useBulkCreate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      count: 1,
      topicPrompt: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!template.id) {
      toast("Error", {
        description: "Invalid template. Please try again.",
        style: { backgroundColor: "red" }
      });
      return;
    }

    setSubmitting(true);

    try {
      await createBulkVideos({
        templateId: template.id,
        count: values.count,
        topicPrompt: values.topicPrompt || "",
      });

      toast("Success", {
        description: `Creating ${values.count} videos using template &quot;${template.name}&quot;`
      });

      onOpenChange(false);
      router.push(PAGES.APP.DASHBOARD.INDEX);
    } catch {
      toast("Error", {
        description: "Failed to create videos. Please try again.",
        style: { backgroundColor: "red" }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Create Videos</DialogTitle>
          <DialogDescription>
            Create multiple videos using this template. Each video will be unique based on the topic prompt.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Videos</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many videos would you like to create? (max 20)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topicPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a topic or theme for the videos..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will help generate unique content for each video
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Videos...
                  </>
                ) : (
                  "Create Videos"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 