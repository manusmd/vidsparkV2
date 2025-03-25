"use client";
import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step, Video } from "@/app/types";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
  return step.status;
}

interface ProgressStepsProps {
  steps: Step[];
  video: Video;
  onGenerate?: () => void;
  onRender?: () => Promise<void>;
  onUpload?: () => void;
}

export function ProgressSteps({
  steps,
  video,
  onGenerate,
  onRender,
  onUpload,
}: ProgressStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    {},
  );

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  return (
    <Card className="p-4 space-y-3 shadow-md border border-border bg-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Processing Progress
        </h2>
        {video.status === "draft" && onGenerate && (
          <Button onClick={onGenerate}>Generate Video</Button>
        )}
      </div>
      <div className="space-y-1">
        {steps.map((step, stepIdx) => {
          let effectiveStatus = computeEffectiveStatus(step);
          if (
            step.id === "processing:video" &&
            (video.renderStatus?.progress === 1 ||
              video.renderStatus?.statusMessage === "completed" ||
              video.status === "render:complete")
          ) {
            effectiveStatus = "complete";
          }
          const isStepComplete = effectiveStatus === "complete";
          const isStepCurrent = effectiveStatus === "current";
          const isStepFailed = effectiveStatus === "failed";
          const isProgressBarStep =
            step.id === "processing:voices" || step.id === "processing:images";
          const stepIcon = isStepComplete ? (
            <Check className="h-4 w-4" />
          ) : isStepFailed ? (
            <X className="h-4 w-4" />
          ) : (
            stepIdx + 1
          );
          let headerContent;
          if (isProgressBarStep) {
            const overallProgress =
              step.subSteps && step.subSteps.length > 0
                ? step.subSteps.reduce((acc, sub) => acc + sub.progress, 0) /
                  step.subSteps.length
                : 0;
            headerContent = (
              <div className="flex items-center justify-between w-full p-2 hover:bg-muted transition rounded-md">
                <div className="flex items-center gap-2 flex-1 text-left">
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
                  <h3 className="text-sm font-medium text-left transition-all">
                    {step.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {overallProgress === 1 ? (
                    <span className="text-sm text-emerald-500">Completed</span>
                  ) : (
                    <>
                      <Progress
                        value={overallProgress * 100}
                        className="h-1 w-24"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(overallProgress * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          } else {
            const isCollapsible = step.subSteps && step.subSteps.length > 0;
            const isExpanded = expandedSteps[step.id] || false;
            headerContent = (
              <>
                <div className="flex items-center gap-2 flex-1 text-left">
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
                  <h3 className="text-sm font-medium text-left transition-all">
                    {step.name}
                  </h3>
                </div>
                {isCollapsible && (
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform",
                      isExpanded ? "rotate-180" : "rotate-0",
                    )}
                  />
                )}
              </>
            );
          }
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col space-y-1"
            >
              {isProgressBarStep ? (
                headerContent
              ) : (
                <>
                  {step.subSteps && step.subSteps.length > 0 ? (
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="flex items-center justify-between w-full gap-2 p-2 rounded-md hover:bg-muted transition"
                    >
                      {headerContent}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full gap-2 p-2">
                      {headerContent}
                      {step.id === "processing:video" &&
                        (video.status === "assets:ready" ||
                          video.status === "render:error") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onRender}
                          >
                            Render Video
                          </Button>
                        )}
                      {step.id === "processing:upload" &&
                        (video.status === "assets:ready" ||
                          video.status === "render:complete" ||
                          video.status === "render:error") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onUpload}
                          >
                            Upload to YouTube 🚀
                          </Button>
                        )}
                    </div>
                  )}
                  {step.subSteps &&
                    step.subSteps.length > 0 &&
                    expandedSteps[step.id] && (
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
                              <p className="text-xs font-bold text-white">
                                Scene {subStep.index + 1}
                              </p>
                              <div className="flex items-center space-x-2">
                                {isProcessing && (
                                  <div className="h-2 w-2 rounded-full bg-white animate-ping"></div>
                                )}
                                {isCompleted && (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                )}
                                {isFailed && (
                                  <X className="h-3 w-3 text-destructive" />
                                )}
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
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
