"use client";
import { useState } from "react";
import { Check, ChevronDown, X, RefreshCw, YoutubeIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step, Video } from "@/app/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  className?: string;
}

export function ProgressSteps({
  steps,
  video,
  onGenerate,
  onRender,
  onUpload,
  className,
}: ProgressStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    {},
  );
  const [isRendering, setIsRendering] = useState(false);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleRender = async () => {
    if (onRender) {
      setIsRendering(true);
      try {
        await onRender();
      } finally {
        setIsRendering(false);
      }
    }
  };

  return (
    <Card className={cn("border border-border/50 shadow-sm overflow-hidden", className)}>
      <CardHeader className="pb-3 border-b border-border/30 bg-card/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Processing Steps
          </CardTitle>
          {video.status === "draft" && onGenerate && (
            <Button 
              onClick={onGenerate}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Play className="w-4 h-4 mr-1" />
              Generate Video
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div>
          {steps.map((step, stepIdx) => {
            let effectiveStatus = computeEffectiveStatus(step);
            
            // Special case for video processing
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
            
            // Determine the status indicator
            const stepIcon = isStepComplete ? (
              <Check className="h-4 w-4" />
            ) : isStepFailed ? (
              <X className="h-4 w-4" />
            ) : (
              stepIdx + 1
            );
            
            // Determine the status badge
            let statusBadge = null;
            if (isStepComplete) {
              statusBadge = <Badge className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
            } else if (isStepCurrent) {
              statusBadge = <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/30 animate-pulse">Processing</Badge>;
            } else if (isStepFailed) {
              statusBadge = <Badge className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30">Failed</Badge>;
            } else {
              statusBadge = <Badge className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border-gray-400/30">Pending</Badge>;
            }
            
            // Content for progress bar steps
            let headerContent;
            if (isProgressBarStep) {
              const overallProgress =
                step.subSteps && step.subSteps.length > 0
                  ? step.subSteps.reduce((acc, sub) => acc + sub.progress, 0) /
                    step.subSteps.length
                  : 0;
              
              headerContent = (
                <div className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3.5 flex-1 text-left">
                    <div
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-all",
                        isStepComplete
                          ? "bg-green-500 text-white"
                          : isStepCurrent
                            ? "border-2 border-blue-400 text-blue-500 animate-pulse bg-blue-500/5"
                            : isStepFailed
                              ? "bg-red-500 text-white"
                              : "border border-gray-300 text-gray-400 bg-background/60",
                      )}
                    >
                      {stepIcon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-left">
                        {step.name}
                      </h3>
                      {step.message && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isStepComplete ? (
                      statusBadge
                    ) : (
                      <div className="flex items-center gap-2">
                        <Progress
                          value={overallProgress * 100}
                          className="h-1.5 w-20"
                        />
                        <span className="text-xs font-medium">
                          {Math.round(overallProgress * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              const isCollapsible = step.subSteps && step.subSteps.length > 0;
              const isExpanded = expandedSteps[step.id] || false;
              
              headerContent = (
                <>
                  <div className="flex items-center gap-3.5 flex-1 text-left">
                    <div
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-all",
                        isStepComplete
                          ? "bg-green-500 text-white"
                          : isStepCurrent
                            ? "border-2 border-blue-400 text-blue-500 animate-pulse bg-blue-500/5"
                            : isStepFailed
                              ? "bg-red-500 text-white"
                              : "border border-gray-300 text-gray-400 bg-background/60",
                      )}
                    >
                      {stepIcon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-left">
                        {step.name}
                      </h3>
                      {step.message && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {statusBadge}
                    {isCollapsible && (
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform text-muted-foreground",
                          isExpanded ? "rotate-180" : "rotate-0",
                        )}
                      />
                    )}
                  </div>
                </>
              );
            }
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative border-b border-border/20 last:border-0"
              >
                {isProgressBarStep ? (
                  headerContent
                ) : (
                  <>
                    {step.subSteps && step.subSteps.length > 0 ? (
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="flex items-center justify-between w-full gap-3 px-5 py-3.5 hover:bg-accent/40 transition-colors"
                      >
                        {headerContent}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full gap-3 px-5 py-3.5 hover:bg-accent/40 transition-colors">
                        {headerContent}
                        
                        {/* Render button */}
                        {step.id === "processing:video" &&
                          (video.status === "assets:ready" ||
                            video.status === "render:error") && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleRender}
                              disabled={isRendering}
                              className="ml-auto"
                            >
                              {isRendering ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                  Rendering...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                  Render Video
                                </>
                              )}
                            </Button>
                          )}
                          
                        {/* Upload button */}
                        {step.id === "processing:upload" &&
                          (video.status === "assets:ready" ||
                            video.status === "render:complete" ||
                            video.status === "render:error") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={onUpload}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30 ml-auto"
                            >
                              <YoutubeIcon className="w-3.5 h-3.5 mr-1.5" />
                              Upload to YouTube
                            </Button>
                          )}
                      </div>
                    )}
                    
                    {/* Expanded substeps */}
                    <AnimatePresence>
                      {step.subSteps &&
                        step.subSteps.length > 0 &&
                        expandedSteps[step.id] && (
                          <motion.div
                            className="pl-16 pr-5 pb-4 pt-1 space-y-3 bg-accent/20"
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
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium">
                                      Scene {subStep.index + 1}
                                    </p>
                                    {subStep.message && (
                                      <p className="text-xs text-muted-foreground">{subStep.message}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-3">
                                    <div className="w-5 flex-shrink-0">
                                      {isProcessing && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                      )}
                                      {isCompleted && (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                      )}
                                      {isFailed && (
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center w-full">
                                      <Progress
                                        value={subStep.progress * 100}
                                        className={cn(
                                          "h-1.5 flex-1",
                                          isCompleted ? "bg-green-100" : 
                                          isProcessing ? "bg-blue-100" : 
                                          isFailed ? "bg-red-100" : "bg-gray-100"
                                        )}
                                      />
                                      <span className="ml-2 text-xs text-muted-foreground w-8 text-right">
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
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
