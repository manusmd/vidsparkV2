"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface TextPositionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextPositionSelector({
  value,
  onChange,
  disabled = false,
}: TextPositionSelectorProps) {
  const options = [
    { value: "top", label: "Top" },
    { value: "middle", label: "Middle" },
    { value: "bottom", label: "Bottom" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <Card
          key={option.value}
          onClick={() => {
            if (!disabled) {
              onChange(option.value);
            }
          }}
          className={`cursor-pointer p-3 text-center border-2 transition-all ${
            value === option.value
              ? "border-primary bg-primary/5"
              : "border-border hover:border-border/80 hover:bg-muted/30"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <span className="text-sm font-medium">{option.label}</span>
        </Card>
      ))}
    </div>
  );
} 