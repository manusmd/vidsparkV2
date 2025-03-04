"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />; // Prevents hydration mismatch

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative overflow-hidden bg-muted transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Animated Icons */}
        <Sun
          className={`absolute transition-transform duration-500 ${
            resolvedTheme === "dark"
              ? "rotate-90 opacity-0 scale-75"
              : "rotate-0 opacity-100 scale-100"
          }`}
          size={22}
        />
        <Moon
          className={`absolute transition-transform duration-500 ${
            resolvedTheme === "dark"
              ? "rotate-0 opacity-100 scale-100"
              : "-rotate-90 opacity-0 scale-75"
          }`}
          size={22}
        />
      </div>
    </Button>
  );
}
