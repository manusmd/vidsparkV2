import React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  id,
  title,
  description,
  isOpen,
  onToggle,
  children,
  icon,
}: {
  id: string;
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-lg overflow-hidden border transition-all duration-200",
      isOpen 
        ? "border-primary/20 bg-primary/5 shadow-sm" 
        : "border-border/40 hover:border-border/80 bg-card/30"
    )}>
      <button
        onClick={() => onToggle(id)}
        className={cn(
          "w-full flex items-center justify-between p-4 transition-all duration-200",
          isOpen
            ? "bg-primary/10" 
            : "hover:bg-card/80"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
            isOpen
              ? "bg-primary/20 text-primary" 
              : "bg-muted/50 text-muted-foreground"
          )}>
            {icon}
          </div>
          <div className="text-left">
            <div className={cn(
              "text-sm font-medium transition-colors",
              isOpen ? "text-primary" : "text-foreground"
            )}>
              {title}
            </div>
            {description && (
              <div className="text-xs text-muted-foreground mt-1 max-w-md">
                {description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
