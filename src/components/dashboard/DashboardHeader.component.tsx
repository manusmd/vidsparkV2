"use client";

import { motion } from "framer-motion";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative pb-4 border-b border-white/10 mb-3"
    >
      {/* Animated gradient accent line */}
      <motion.div 
        initial={{ width: "0%" }}
        animate={{ width: "33%" }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600/80 via-indigo-600/60 to-purple-600/30"
      />
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 rounded-sm bg-gradient-to-b from-blue-400 to-primary-600"></div>
          <motion.h1 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-muted-foreground/80 mt-1 ml-3.5"
        >
          {subtitle}
        </motion.p>
      </div>
    </motion.div>
  );
}; 