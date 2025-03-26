import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { StripeProduct } from "@/contexts/StripeProductsContext";
import Stripe from "stripe";

// Define the schema for feature validation
const featureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  lookup_key: z.string().optional(),
});

// Define the type for the form data
type FeatureFormData = z.infer<typeof featureSchema>;

interface FeatureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeatureFormData) => Promise<void>;
  feature?: Stripe.Entitlements.Feature;
  product?: StripeProduct;
  isSubmitting: boolean;
  title: string;
}

export function FeatureForm({
  isOpen,
  onClose,
  onSubmit,
  feature,
  product,
  isSubmitting,
  title,
}: FeatureFormProps) {
  // Initialize the form with default values or existing feature data
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: feature?.name || "",
      lookup_key: feature?.lookup_key || "",
    },
  });

  // Reset the form when the feature changes
  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: feature?.name || "",
        lookup_key: feature?.lookup_key || "",
      });
    }
  }, [feature, isOpen, reset]);

  // Handle form submission
  const onFormSubmit = async (data: FeatureFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting feature form:", error);
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {feature
              ? "Edit the feature details below."
              : product
                ? "Fill in the details to create a new feature for " +
                  product.name
                : "Fill in the details to create a new general feature"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" placeholder="Feature name" {...field} />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lookup_key">Lookup Key</Label>
            <Controller
              name="lookup_key"
              control={control}
              render={({ field }) => (
                <Textarea
                  disabled
                  id="lookup_key"
                  placeholder="Feature lookup key"
                  {...field}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {feature ? "Updating..." : "Creating..."}
                </>
              ) : feature ? (
                "Update Feature"
              ) : (
                "Create Feature"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
