import React from "react";
import { ChevronDown, FolderOpen, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CollapsibleSection({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-md transition-colors ${isOpen ? 'bg-indigo-50/5' : ''}`}>
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-indigo-50/10 rounded-md transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-indigo-400" />
          ) : (
            <Folder className="w-4 h-4 text-indigo-300" />
          )}
          <span className={isOpen ? 'text-indigo-400' : ''}>{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180 text-indigo-400" : "rotate-0"}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="py-1 px-2 ml-2 border-l-2 border-indigo-200/20">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
