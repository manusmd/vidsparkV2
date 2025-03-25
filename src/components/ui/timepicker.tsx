"use client";

import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimePickerProps {
  time?: Date;
  setTime: (t: Date) => void;
  buttonId?: string;
}

export function TimePicker({ time, setTime, buttonId }: TimePickerProps) {
  // Default to 12:00 if no time is provided.
  const initialHours = time ? time.getHours() : 12;
  const initialMinutes = time ? time.getMinutes() : 0;
  const [hours, setHours] = useState<number>(initialHours);
  const [minutes, setMinutes] = useState<number>(initialMinutes);

  useEffect(() => {
    const newTime = new Date();
    newTime.setHours(hours, minutes, 0, 0);
    setTime(newTime);
  }, [hours, minutes, setTime]);

  return (
    <div className="flex gap-2">
      {/* Hours Selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={buttonId ? `${buttonId}-hours` : undefined}
            variant="outline"
            className="w-full justify-start text-left"
          >
            <Clock className="mr-2" />
            {String(hours).padStart(2, "0")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 24 }, (_, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={() => setHours(i)}
              >
                {String(i).padStart(2, "0")}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {/* Minutes Selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={buttonId ? `${buttonId}-minutes` : undefined}
            variant="outline"
            className="w-full justify-start text-left"
          >
            <Clock className="mr-2" />
            {String(minutes).padStart(2, "0")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 60 }, (_, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={() => setMinutes(i)}
              >
                {String(i).padStart(2, "0")}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
