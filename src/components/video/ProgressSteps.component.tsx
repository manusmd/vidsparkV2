"use client";
import { useState } from "react";
import { Check, ChevronDown, X, RefreshCw, YoutubeIcon, Play, Download } from "lucide-react";
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
    <Card className={cn("border border-border/50 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3 border-b border-border/30 bg-card/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary/60" />
            Processing Steps
          </CardTitle>
          {video.status === "draft" && onGenerate && (
            <Button 
              onClick={onGenerate}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-sm"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Generate
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
            
            // Special case for YouTube upload step
            if (
              step.id === "processing:upload" &&
              video.uploadStatus?.youtube?.videoUrl
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
              statusBadge = <Badge className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30 font-medium">Completed</Badge>;
            } else if (isStepCurrent) {
              statusBadge = (
                <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/30 font-medium">
                  <motion.span
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Processing
                  </motion.span>
                </Badge>
              );
            } else if (isStepFailed) {
              statusBadge = <Badge className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30 font-medium">Failed</Badge>;
            } else {
              statusBadge = <Badge className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border-gray-400/30 font-medium">Pending</Badge>;
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
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm"
                          : isStepCurrent
                            ? "border-2 border-blue-400 text-blue-500 bg-blue-500/5 shadow-sm"
                            : isStepFailed
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"
                              : "border border-gray-300 text-gray-400 bg-background/60",
                      )}
                    >
                      {isStepCurrent ? (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7] 
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {stepIcon}
                        </motion.div>
                      ) : (
                        stepIcon
                      )}
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
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm"
                          : isStepCurrent
                            ? "border-2 border-blue-400 text-blue-500 bg-blue-500/5 shadow-sm"
                            : isStepFailed
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"
                              : "border border-gray-300 text-gray-400 bg-background/60",
                      )}
                    >
                      {isStepCurrent ? (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7] 
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {stepIcon}
                        </motion.div>
                      ) : (
                        stepIcon
                      )}
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
                transition={{ duration: 0.3, delay: stepIdx * 0.05 }}
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
                              size="sm"
                              onClick={handleRender}
                              disabled={isRendering}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm ml-2"
                            >
                              {isRendering ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  Rendering...
                                </>
                              ) : (
                                <>
                                  <Play className="h-3.5 w-3.5 mr-1.5" />
                                  Render Video
                                </>
                              )}
                            </Button>
                          )}

                        {/* Upload button */}
                        {step.id === "processing:upload" &&
                          video.status === "render:complete" &&
                          onUpload && 
                          !video.uploadStatus?.youtube?.videoUrl && (
                            <Button
                              size="sm"
                              onClick={onUpload}
                              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-sm ml-2"
                            >
                              <YoutubeIcon className="h-3.5 w-3.5 mr-1.5" />
                              Upload
                            </Button>
                          )}

                        {/* Download button */}
                        {step.id === "processing:download" &&
                          video.status === "render:complete" &&
                          video.renderStatus?.videoUrl && (
                            <Button
                              size="sm"
                              asChild
                              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-sm ml-2"
                            >
                              <a href={video.renderStatus.videoUrl} download>
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Download
                              </a>
                            </Button>
                          )}
                      </div>
                    )}

                    {/* Sub-steps */}
                    <AnimatePresence>
                      {expandedSteps[step.id] && step.subSteps && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden border-t border-border/10 bg-accent/20"
                        >
                          <div className="py-1 px-2">
                            {step.subSteps.map((subStep, subIdx) => (
                              <div
                                key={`${step.id}-${subIdx}`}
                                className="flex items-center justify-between px-5 py-2.5 text-sm border-b border-border/10 last:border-0"
                              >
                                <div className="flex items-center gap-3.5 flex-1">
                                  <div
                                    className={cn(
                                      "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium transition-all",
                                      subStep.status === "completed"
                                        ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm"
                                        : subStep.status === "processing"
                                        ? "border-2 border-blue-400 text-blue-500 bg-blue-500/5 shadow-sm"
                                        : subStep.status === "failed"
                                        ? "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm"
                                        : "border border-gray-300 text-gray-400 bg-background/60",
                                    )}
                                  >
                                    {subStep.status === "completed" ? (
                                      <Check className="h-3 w-3" />
                                    ) : subStep.status === "processing" ? (
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                      >
                                        <RefreshCw className="h-3 w-3" />
                                      </motion.div>
                                    ) : subStep.status === "failed" ? (
                                      <X className="h-3 w-3" />
                                    ) : (
                                      <span>{subIdx + 1}</span>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">
                                    {subStep.message || `Scene ${subStep.scene || subStep.index + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  {subStep.progress !== undefined && subStep.progress < 1 && (
                                    <>
                                      <Progress
                                        value={subStep.progress * 100}
                                        className="h-1.5 w-16"
                                      />
                                      <span className="font-medium">
                                        {Math.round(subStep.progress * 100)}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
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
