import React from "react";
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
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { StripePrice, StripeProduct } from "@/contexts/StripeProductsContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Define the schema for price validation
const priceSchema = z.object({
  unit_amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  active: z.boolean().default(true),
  type: z.enum(["one_time", "recurring"]),
  recurring: z.object({
    interval: z.enum(["day", "week", "month", "year"]).optional(),
    interval_count: z.coerce.number().min(1).optional(),
    trial_period_days: z.coerce.number().min(0).optional().nullable(),
  }).optional(),
});

// Define the type for the form data
type PriceFormData = z.infer<typeof priceSchema>;

interface PriceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PriceFormData) => Promise<void>;
  price?: StripePrice;
  product: StripeProduct;
  isSubmitting: boolean;
  title: string;
}

export function PriceForm({
  isOpen,
  onClose,
  onSubmit,
  price,
  product,
  isSubmitting,
  title,
}: PriceFormProps) {
  // Initialize the form with default values or existing price data
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PriceFormData>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      unit_amount: price ? price.unit_amount / 100 : 0, // Convert from cents to dollars for display
      currency: price?.currency || "usd",
      active: price?.active ?? true,
      type: price?.type || "one_time",
      recurring: price?.recurring || {
        interval: "month",
        interval_count: 1,
        trial_period_days: null,
      },
    },
  });

  // Watch the type field to conditionally render recurring fields
  const priceType = watch("type");

  // Reset the form when the price changes
  React.useEffect(() => {
    if (isOpen) {
      reset({
        unit_amount: price ? price.unit_amount / 100 : 0, // Convert from cents to dollars for display
        currency: price?.currency || "usd",
        active: price?.active ?? true,
        type: price?.type || "one_time",
        recurring: price?.recurring || {
          interval: "month",
          interval_count: 1,
          trial_period_days: null,
        },
      });
    }
  }, [price, isOpen, reset]);

  // Handle form submission
  const onFormSubmit = async (data: PriceFormData) => {
    try {
      // Convert amount from dollars to cents for Stripe
      const formattedData = {
        ...data,
        unit_amount: Math.round(data.unit_amount * 100),
      };
      
      await onSubmit(formattedData);
      onClose();
    } catch (error) {
      console.error("Error submitting price form:", error);
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {price ? "Edit the price details below." : "Fill in the details to create a new price for " + product.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unit_amount">Amount <span className="text-destructive">*</span></Label>
            <Controller
              name="unit_amount"
              control={control}
              render={({ field }) => (
                <Input
                  id="unit_amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...field}
                />
              )}
            />
            {errors.unit_amount && (
              <p className="text-sm text-destructive">{errors.unit_amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency <span className="text-destructive">*</span></Label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD (C$)</SelectItem>
                    <SelectItem value="aud">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.currency && (
              <p className="text-sm text-destructive">{errors.currency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Price Type <span className="text-destructive">*</span></Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select price type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {priceType === "recurring" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="recurring.interval">Billing Interval <span className="text-destructive">*</span></Label>
                <Controller
                  name="recurring.interval"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="recurring.interval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Daily</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.recurring?.interval && (
                  <p className="text-sm text-destructive">{errors.recurring.interval.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurring.interval_count">Interval Count <span className="text-destructive">*</span></Label>
                <Controller
                  name="recurring.interval_count"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="recurring.interval_count"
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                    />
                  )}
                />
                {errors.recurring?.interval_count && (
                  <p className="text-sm text-destructive">{errors.recurring.interval_count.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurring.trial_period_days">Trial Period (days)</Label>
                <Controller
                  name="recurring.trial_period_days"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="recurring.trial_period_days"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  )}
                />
                {errors.recurring?.trial_period_days && (
                  <p className="text-sm text-destructive">{errors.recurring.trial_period_days.message}</p>
                )}
              </div>
            </>
          )}

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {price ? "Updating..." : "Creating..."}
                </>
              ) : (
                price ? "Update Price" : "Create Price"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}