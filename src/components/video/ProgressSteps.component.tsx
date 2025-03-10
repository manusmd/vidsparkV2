"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Step } from "@/app/types";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

/**
 * Computes the effective status for a step based on its subSteps.
 * If there are no subSteps, returns the step's own status.
 */
function computeEffectiveStatus(
  step: Step,
): "complete" | "current" | "failed" | "upcoming" {
  if (step.subSteps && step.subSteps.length > 0) {
    if (step.subSteps.every((sub) => sub.status === "completed")) {
      return "complete";
    } else if (step.subSteps.some((sub) => sub.status === "processing")) {
      return "current";
    } else if (step.subSteps.some((sub) => sub.status === "failed")) {
      return "failed";
    } else {
      return "upcoming";
    }
  }
  // If there are no subSteps, use the provided status.
  return step.status;
}

interface ProgressStepsProps {
  steps: Step[];
  videoStatus: string;
  onGenerate?: () => void;
}

export function ProgressSteps({
  steps,
  videoStatus,
  onGenerate,
}: ProgressStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    {},
  );

  // Auto-expand steps whose effective status is "current"
  useEffect(() => {
    setExpandedSteps((prevExpanded) => {
      const updatedExpanded = { ...prevExpanded };

      steps.forEach((step) => {
        const effectiveStatus = computeEffectiveStatus(step);
        if (effectiveStatus === "current") {
          updatedExpanded[step.id] = true; // Auto-expand current processing step
        } else if (
          effectiveStatus === "complete" ||
          effectiveStatus === "failed"
        ) {
          updatedExpanded[step.id] = false; // Collapse complete or failed steps
        }
      });

      return updatedExpanded;
    });
  }, [steps]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  return (
    <Card className="p-4 space-y-3 shadow-md border border-border bg-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Processing Progress
        </h2>
        {videoStatus === "draft" && onGenerate && (
          <Button onClick={onGenerate}>Generate Video</Button>
        )}
      </div>

      <div className="space-y-1">
        {steps.map((step, stepIdx) => {
          const effectiveStatus = computeEffectiveStatus(step);
          const isStepComplete = effectiveStatus === "complete";
          const isStepCurrent = effectiveStatus === "current";
          const isStepFailed = effectiveStatus === "failed";
          const isExpanded = expandedSteps[step.id];

          // Determine icon or number for the step header.
          const stepIcon = isStepComplete ? (
            <Check className="h-4 w-4" />
          ) : isStepFailed ? (
            <X className="h-4 w-4" />
          ) : (
            stepIdx + 1
          );

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col space-y-1"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.id)}
                className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted transition"
              >
                <div className="flex items-center space-x-2">
                  {/* Step Number / Status Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-full text-sm font-semibold transition-all",
                      isStepComplete
                        ? "bg-emerald-500 text-white"
                        : isStepCurrent
                          ? "border-2 border-primary text-primary animate-pulse"
                          : isStepFailed
                            ? "bg-destructive text-white"
                            : "border border-border text-muted-foreground",
                    )}
                  >
                    {stepIcon}
                  </div>
                  <h3
                    className={cn(
                      "text-sm font-medium transition-all",
                      isStepComplete
                        ? "text-emerald-500"
                        : isStepFailed
                          ? "text-destructive"
                          : isStepCurrent
                            ? "text-primary"
                            : "text-muted-foreground",
                    )}
                  >
                    {step.name}
                  </h3>
                </div>

                {/* Expand/Collapse Icon */}
                {step.subSteps && step.subSteps.length > 0 && (
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform",
                      isExpanded ? "rotate-180" : "rotate-0",
                    )}
                  />
                )}
              </button>

              {/* Substeps (Collapsible) */}
              <AnimatePresence>
                {isExpanded && step.subSteps && step.subSteps.length > 0 && (
                  <motion.div
                    className="ml-8 mt-1 space-y-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.subSteps.map((subStep) => {
                      const isProcessing = subStep.status === "processing";
                      const isCompleted = subStep.status === "completed";
                      const isFailed = subStep.status === "failed";

                      return (
                        <div
                          key={subStep.index}
                          className="flex flex-col space-y-1"
                        >
                          {/* Scene Title */}
                          <p className="text-xs font-bold text-white">
                            Scene {subStep.index + 1}
                          </p>

                          {/* Scene Details */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground truncate line-clamp-1">
                                  {step.id === "processing:voices"
                                    ? truncateText(
                                        subStep.narration ||
                                          "Generating voice...",
                                        50,
                                      )
                                    : truncateText(
                                        subStep.imagePrompt ||
                                          "Generating image...",
                                        50,
                                      )}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                {step.id === "processing:voices"
                                  ? subStep.narration
                                  : subStep.imagePrompt}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Progress Indicator */}
                          <div className="flex items-center space-x-2">
                            {/* Blinking Dot */}
                            {isProcessing && (
                              <div className="h-2 w-2 rounded-full bg-white animate-ping"></div>
                            )}
                            {isCompleted && (
                              <Check className="h-3 w-3 text-emerald-500" />
                            )}
                            {isFailed && (
                              <X className="h-3 w-3 text-destructive" />
                            )}

                            {/* Progress Bar with Label */}
                            <div className="flex items-center w-full">
                              <Progress
                                value={subStep.progress * 100}
                                className="h-1 flex-1"
                              />
                              <span className="ml-2 text-xs text-muted-foreground">
                                {Math.round(subStep.progress * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
