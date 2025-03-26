import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { StripeProduct, useStripeProducts } from "@/contexts/StripeProductsContext";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  metadata: z
    .object({
      popular: z.string().optional(),
      credits: z.string().optional(),
      features: z.string().optional(),
    })
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product?: StripeProduct;
  isSubmitting: boolean;
  title: string;
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  product,
  isSubmitting,
  title,
}: ProductFormProps) {
  const { } = useStripeProducts();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      active: product?.active ?? true,
      metadata: {
        features: product?.metadata?.features || "",
        popular: product?.metadata?.popular || "",
        credits: product?.metadata?.credits || "",
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: product?.name || "",
        description: product?.description || "",
        active: product?.active ?? true,
        metadata: {
          features: product?.metadata?.features || "",
          popular: product?.metadata?.popular || "",
          credits: product?.metadata?.credits || "",
        },
      });
    }
  }, [product, isOpen, reset]);

  const onFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting product form:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {product
              ? "Edit the product details below."
              : "Fill in the details to create a new product."}
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
                <Input
                  id="name"
                  placeholder="Product name"
                  {...field}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Product description"
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="space-y-4">
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">Credits</Label>
            <Controller
              name="metadata.credits"
              control={control}
              render={({ field }) => (
                <Input
                  id="credits"
                  type="number"
                  placeholder="Number of credits"
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="metadata.popular"
              control={control}
              render={({ field }) => (
                <Switch
                  id="popular"
                  checked={field.value === "true"}
                  onCheckedChange={(checked) =>
                    field.onChange(checked ? "true" : "false")
                  }
                />
              )}
            />
            <Label htmlFor="popular">Mark as Popular</Label>
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
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}