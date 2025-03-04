"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Step } from "@/app/types";

interface ProgressIndicatorProps {
  steps: Step[];
}

export function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completedSteps = steps.findIndex((step) => step.status === "current");
    if (completedSteps !== -1) {
      setCurrentStep(completedSteps);
    }
  }, [steps]);

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center space-x-3">
          {index < currentStep ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : index === currentStep ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : (
            <div className="w-5 h-5 border border-gray-400 rounded-full" />
          )}
          <p
            className={`text-sm ${index === currentStep ? "font-bold" : "text-gray-500"}`}
          >
            {step.name}
          </p>
        </div>
      ))}
    </div>
  );
}
