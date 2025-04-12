"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import storyAnimation from "./storyAnimation.json";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoGenerationOverlayProps {
  onComplete: () => void;
  isProcessing: boolean;
}

const stages = [
  {
    id: "preparing",
    title: "Brewing story ideas...",
    description: "Waking up the creative gremlins in our AI's brain",
    duration: 2000,
  },
  {
    id: "generating",
    title: "Crafting the perfect plot...",
    description: "Our AI is having an existential crisis choosing the best words",
    duration: 3000,
  },
  {
    id: "processing",
    title: "Adding dramatic flair...",
    description: "Sprinkling in just the right amount of drama and intrigue",
    duration: 2500,
  },
  {
    id: "rendering",
    title: "Connecting the dots...",
    description: "Making sure your story doesn't end like Game of Thrones",
    duration: 3000,
  },
  {
    id: "completing",
    title: "Final storytelling touches...",
    description: "Teaching our AI to avoid clichés (it's harder than it looks)",
    duration: 2000,
  },
];

export default function VideoGenerationOverlay({ onComplete, isProcessing }: VideoGenerationOverlayProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [waitingForCompletion, setWaitingForCompletion] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (waitingForCompletion && !isProcessing) {
      setTimeout(() => {
        setCompletedStages(prev => [...prev, stages[stages.length - 1].id]);
        setProgress(100);
        setTimeout(() => {
          onComplete();
        }, 1000);
      }, 500);
    }
  }, [isProcessing, waitingForCompletion, onComplete]);

  useEffect(() => {
    if (!initialized) return;
    
    let stageTimeout: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    
    const advanceStage = (index: number) => {
      if (index >= stages.length) {
        setWaitingForCompletion(true);
        clearInterval(progressInterval);
        setProgress(95);
        return;
      }
      
      const currentStage = stages[index];
      setCurrentStageIndex(index);
      
      const startTime = Date.now();
      const stageDuration = currentStage.duration;
      
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stageProgress = Math.min(elapsed / stageDuration, 1);
        const overallProgress = Math.min((index + stageProgress) / stages.length, 0.95);
        setProgress(overallProgress * 100);
        
        if (stageProgress >= 1) {
          clearInterval(progressInterval);
          setCompletedStages(prev => [...prev, currentStage.id]);
          
          stageTimeout = setTimeout(() => {
            advanceStage(index + 1);
          }, 500);
        }
      }, 50);
    };
    
    advanceStage(0);
    
    return () => {
      clearTimeout(stageTimeout);
      clearInterval(progressInterval);
    };
  }, [initialized]);
  
  const currentStage = stages[currentStageIndex] || stages[stages.length - 1];

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-background/70 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-card rounded-xl p-8 shadow-lg border border-border">
        <div className="mb-6 flex justify-center">
          <Lottie
            animationData={storyAnimation}
            loop={true}
            className="w-32 h-32"
          />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={waitingForCompletion ? "waiting" : currentStage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-8"
          >
            {waitingForCompletion ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Polishing your masterpiece...</h2>
                <p className="text-muted-foreground">Our AI is adding Oxford commas and debating semicolons</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">{currentStage.title}</h2>
                <p className="text-muted-foreground">{currentStage.description}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.id);
            const isCurrent = index === currentStageIndex && !waitingForCompletion;
            const isWaiting = waitingForCompletion && index === stages.length - 1;
            
            return (
              <div 
                key={stage.id}
                className="flex flex-col items-center gap-2"
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground shadow-md shadow-primary/20",
                    isCurrent && "bg-primary/20 text-primary border-2 border-primary animate-pulse",
                    isWaiting && "bg-primary/20 text-primary border-2 border-primary animate-pulse",
                    !isCompleted && !isCurrent && !isWaiting && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                {index < stages.length - 1 && (
                  <div className="w-full h-0.5 mt-5 relative">
                    <div className="absolute inset-0 bg-muted rounded-full" />
                    <motion.div 
                      className="absolute inset-0 bg-primary rounded-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: isCompleted ? 1 : 
                                isCurrent ? progress % (100/stages.length) / (100/stages.length) : 0 
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 