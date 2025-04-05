"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Wand2, ArrowRight, Lightbulb, Info } from "lucide-react";
import { motion } from "framer-motion";

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
    formState: { errors, isValid },
  } = useForm<NarrationFormValues>({
    resolver: zodResolver(NarrationSchema),
    defaultValues: { narration: initialNarration },
    mode: "onChange",
  });
  const narrationValue = useWatch({
    control,
    name: "narration",
    defaultValue: initialNarration,
  });
  const [lastSavedNarration, setLastSavedNarration] = useState(initialNarration);
  const hasChanges = narrationValue !== lastSavedNarration;

  useEffect(() => {
    if (initialNarration && initialNarration !== lastSavedNarration) {
      setValue("narration", initialNarration, { shouldValidate: true });
      setLastSavedNarration(initialNarration);
    }
  }, [initialNarration, setValue, lastSavedNarration]);

  const handleGenerate = async () => {
    await onGenerateStory();
  };

  const handleNext = (data: NarrationFormValues) => {
    setLastSavedNarration(data.narration);
    onNext(data);
  };

  // Calculate character count color based on limit
  const getCharCountColor = () => {
    const length = narrationValue.length;
    if (length > 1800) return "text-orange-500 dark:text-orange-400";
    if (length > 1500) return "text-amber-500 dark:text-amber-400";
    return "text-muted-foreground";
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((narrationValue.length / 2000) * 100, 100);

  return (
    <Card className="shadow-md border-border/60 overflow-hidden">
      <CardHeader className="bg-card/50 backdrop-blur-sm border-b border-border/20 space-y-1">
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm mr-2">1</span>
          Video Narration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Write or generate the narration for your video
        </p>
      </CardHeader>
      
      <CardContent className="pt-6 relative">
        <form
          onSubmit={handleSubmit(handleNext)}
          className="space-y-4"
        >
          <div className="relative">
            <Controller
              name="narration"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="narration"
                  placeholder="Start typing your narration or click 'Generate with AI' for ideas..."
                  {...field}
                  className="min-h-[250px] resize-none p-4 text-base focus-visible:ring-primary/70"
                />
              )}
            />
            
            {errors.narration && (
              <motion.p 
                className="text-destructive text-sm mt-1 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Info className="h-3.5 w-3.5 mr-1.5" />
                {errors.narration.message}
              </motion.p>
            )}
            
            {/* Character count + progress bar */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>A good narration is between 1000-1500 words</span>
                </div>
                <div className={`text-xs font-medium ${getCharCountColor()}`}>
                  {narrationValue.length} / 2000
                </div>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    progressPercentage > 90 ? 'bg-orange-500' : 
                    progressPercentage > 75 ? 'bg-amber-500' : 
                    'bg-primary'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              {generating ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate with AI
                </span>
              )}
            </Button>
            
            <Button 
              type="submit"
              disabled={!isValid || generating}
              className="relative group"
            >
              <span className="flex items-center">
                Next Step
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              
              {/* Pulsing indicator when changes are present */}
              {hasChanges && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2.5 w-2.5 bg-primary rounded-full">
                  <span className="absolute inset-0 rounded-full animate-ping bg-primary/70"></span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
