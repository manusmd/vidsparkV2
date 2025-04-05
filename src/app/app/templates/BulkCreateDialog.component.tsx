"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ROUTES from "@/lib/routes";
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
  const { createBulkVideos, isProcessing } = useBulkCreate();
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
      const result = await createBulkVideos({
        templateId: template.id,
        count: values.count,
        topicPrompt: values.topicPrompt || "",
      });

      toast("Bulk Creation Started", {
        description: `Successfully started creation of ${values.count} videos from template.`
      });

      // Close the dialog
      onOpenChange(false);
      
      // Optional: Navigate to a status page or dashboard
      router.push(ROUTES.PAGES.APP.MY_VIDEOS.INDEX);
    } catch (error) {
      console.error("Bulk creation error:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to start bulk creation",
        style: { backgroundColor: "red" }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Create Videos</DialogTitle>
          <DialogDescription>
            Create multiple videos from template: {template.name}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
          <h3 className="text-sm font-medium mb-2">Template Details</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Name:</span> {template.name}
          </p>
          {template.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Description:</span> {template.description}
            </p>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            This will create multiple videos using this template's settings.
          </p>
        </div>

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
                      placeholder="1"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    How many videos you want to create (1-20)
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
                  <FormLabel>Custom Topic Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Create videos about tech gadgets for beginners"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to use the content type&apos;s default prompt, or enter a custom prompt for more specific videos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Note:</strong> The AI will automatically generate unique variations for each video.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
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