"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";

const NarrationSchema = z.object({
  narration: z
    .string()
    .min(5, "Narration must be at least 5 characters")
    .max(2000, "Narration must be 2000 characters or less"),
});

export type NarrationFormValues = z.infer<typeof NarrationSchema>;

interface NarrationFormProps {
  onNext: (values: NarrationFormValues) => void;
  onGenerateStory: () => Promise<void>;
  generating: boolean;
  initialNarration?: string;
}

export function NarrationForm({
  onNext,
  onGenerateStory,
  generating,
  initialNarration = "",
}: NarrationFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NarrationFormValues>({
    resolver: zodResolver(NarrationSchema),
    defaultValues: { narration: initialNarration },
  });
  const narrationValue = useWatch({
    control,
    name: "narration",
    defaultValue: initialNarration,
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialNarration) {
      setValue("narration", initialNarration, { shouldValidate: true });
    }
  }, [initialNarration, setValue]);

  const handleGenerate = async () => {
    await onGenerateStory();
  };

  const handleNext = () => {
    setStep(2);
    onNext({ narration: narrationValue });
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="w-full text-center text-2xl font-bold">
          Video Generation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <form
            onSubmit={handleSubmit(handleNext)}
            className="space-y-4 relative"
          >
            <Controller
              name="narration"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="narration"
                  placeholder="Type your narration here..."
                  {...field}
                  className="w-full h-60 resize-none"
                />
              )}
            />
            {errors.narration && (
              <p className="text-red-500 text-sm mt-1">
                {errors.narration.message}
              </p>
            )}
            <div className="text-right text-xs text-muted-foreground">
              {narrationValue.length} / 2000
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Button onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
