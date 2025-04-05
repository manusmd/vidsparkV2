"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import storyAnimation from "./storyAnimation.json";
import { CheckCircle2 } from "lucide-react";

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
    // Set initialized after the first render to avoid the progress bar jumping
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    // Check if processing is complete and we're in the waiting stage
    if (waitingForCompletion && !isProcessing) {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setCompletedStages(prev => [...prev, stages[stages.length - 1].id]);
        setProgress(100);
        
        // Wait a moment before completing
        setTimeout(() => {
          onComplete();
        }, 1000);
      }, 500);
    }
  }, [isProcessing, waitingForCompletion, onComplete]);

  useEffect(() => {
    if (!initialized) return;
    
    // Set up the sequence of staged animations
    let stageTimeout: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    
    const advanceStage = (index: number) => {
      if (index >= stages.length) {
        // We've gone through all stages but need to wait for server processing to complete
        setWaitingForCompletion(true);
        clearInterval(progressInterval);
        
        // Hold progress at 95% until processing completes
        setProgress(95);
        return;
      }
      
      const currentStage = stages[index];
      setCurrentStageIndex(index);
      
      // Start progress animation for this stage
      const startTime = Date.now();
      const stageDuration = currentStage.duration;
      
      // Update progress every 50ms
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stageProgress = Math.min(elapsed / stageDuration, 1);
        
        // Calculate overall progress (each stage is equal weight)
        // Limit to 95% until processing is complete
        const overallProgress = Math.min((index + stageProgress) / stages.length, 0.95);
        setProgress(overallProgress * 100);
        
        if (stageProgress >= 1) {
          clearInterval(progressInterval);
          setCompletedStages(prev => [...prev, currentStage.id]);
          
          // Schedule next stage
          stageTimeout = setTimeout(() => {
            advanceStage(index + 1);
          }, 500);
        }
      }, 50);
    };
    
    // Start the sequence
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
            className="text-center mb-6"
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
        
        {/* Progress bar */}
        {initialized && (
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-8">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
        )}
        
        {/* Stage indicators */}
        <div className="grid grid-cols-5 gap-2">
          {stages.map((stage, index) => (
            <div 
              key={stage.id}
              className="flex flex-col items-center"
            >
              <div 
                className={`
                  w-8 h-8 flex items-center justify-center rounded-full
                  ${(index === currentStageIndex && !waitingForCompletion) ? 'border-2 border-primary animate-pulse' : ''}
                  ${waitingForCompletion && index === stages.length - 1 ? 'border-2 border-primary animate-pulse' : ''}
                  ${completedStages.includes(stage.id) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                `}
              >
                {completedStages.includes(stage.id) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {initialized && (
                <div className="h-1 w-full mt-2 rounded-full bg-muted">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: completedStages.includes(stage.id) ? "100%" : 
                             index < currentStageIndex ? "100%" : 
                             index === currentStageIndex && !waitingForCompletion ? `${((progress % (100/stages.length)) / (100/stages.length)) * 100}%` : 
                             waitingForCompletion && index === stages.length - 1 ? "90%" :
                             "0%" 
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 