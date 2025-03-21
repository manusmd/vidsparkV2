"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TextOptionsProps {
  textPosition: string;
  onTextPositionChange: (value: string) => void;
  showTitle: boolean;
  onShowTitleChange: (value: boolean) => void;
}

export function TextOptions({
  textPosition,
  onTextPositionChange,
  showTitle,
  onShowTitleChange,
}: TextOptionsProps) {
  const options = [
    { value: "top", label: "Top" },
    { value: "center", label: "Center" },
    { value: "bottom", label: "Bottom" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Text Position
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => (
            <Card
              key={option.value}
              onClick={() => onTextPositionChange(option.value)}
              className={`cursor-pointer p-3 text-center border-2 ${
                textPosition === option.value
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label
          htmlFor="display-title"
          className="text-sm font-medium text-foreground"
        >
          Display Video Title
        </Label>
        <Switch
          id="display-title"
          checked={showTitle}
          onCheckedChange={(checked) => onShowTitleChange(checked as boolean)}
        />
      </div>
    </div>
  );
}
