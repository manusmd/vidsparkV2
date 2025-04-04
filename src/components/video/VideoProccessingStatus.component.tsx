"use client";

import { Loader2, Film, AlertCircle, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface VideoProcessingStatusProps {
  status: string;
}

export function VideoProcessingStatus({ status }: VideoProcessingStatusProps) {
  // Configuration for different status types
  const statusConfig = {
    draft: {
      title: "Ready to Generate",
      message: "Click 'Generate' to start creating your video",
      icon: <Film className="w-12 h-12 text-white/90" />,
      bgClass: "from-gray-800 to-gray-900",
      accent: "border-gray-500",
    },
    "processing:story": {
      title: "Creating Your Story",
      message: "We're crafting the perfect narrative for your video",
      icon: <Loader2 className="w-12 h-12 text-white/90 animate-spin" />,
      bgClass: "from-blue-800 to-indigo-900",
      accent: "border-blue-400",
    },
    "processing:assets": {
      title: "Processing Assets",
      message: "Generating images and audio for your scenes",
      icon: <Loader2 className="w-12 h-12 text-white/90 animate-spin" />,
      bgClass: "from-indigo-800 to-purple-900",
      accent: "border-indigo-400",
    },
    "processing:video": {
      title: "Rendering Your Video",
      message: "Almost there! We're putting everything together",
      icon: <Loader2 className="w-12 h-12 text-white/90 animate-spin" />,
      bgClass: "from-purple-800 to-pink-900",
      accent: "border-purple-400",
    },
    "assets:ready": {
      title: "Ready to Render",
      message: "Your assets are ready! Click 'Render Video' to continue",
      icon: <Sparkles className="w-12 h-12 text-white/90" />,
      bgClass: "from-emerald-800 to-teal-900",
      accent: "border-emerald-400",
    },
    default: {
      title: "Processing",
      message: "Your video is being prepared",
      icon: <Clock className="w-12 h-12 text-white/90" />,
      bgClass: "from-gray-800 to-slate-900",
      accent: "border-gray-400",
    },
    error: {
      title: "Error Processing",
      message: "Something went wrong. Please try again",
      icon: <AlertCircle className="w-12 h-12 text-white/90" />,
      bgClass: "from-red-800 to-red-900",
      accent: "border-red-500",
    },
  };

  // Determine which config to use based on status
  let config;
  if (status === "draft") {
    config = statusConfig.draft;
  } else if (status === "processing:story") {
    config = statusConfig["processing:story"];
  } else if (status === "processing:assets") {
    config = statusConfig["processing:assets"];
  } else if (status === "processing:video") {
    config = statusConfig["processing:video"];
  } else if (status === "assets:ready") {
    config = statusConfig["assets:ready"];
  } else if (status === "failed" || status === "render:error") {
    config = statusConfig.error;
  } else {
    config = statusConfig.default;
  }

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.15 
      } 
    }
  };

  const itemVariants = {
    initial: { y: 15, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className={`flex flex-col items-center justify-center w-full h-full bg-gradient-to-br ${config.bgClass} rounded-md p-6 text-white overflow-hidden relative border-2 border-opacity-20 shadow-inner ${config.accent}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-16 -right-16 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"
          animate={{ 
            scale: [0.95, 1, 0.95],
            opacity: [0.05, 0.08, 0.05]
          }} 
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-16 -left-16 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl"
          animate={{ 
            scale: [0.9, 1.05, 0.9],
            opacity: [0.04, 0.07, 0.04]
          }} 
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Glow effect behind icon */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5 blur-xl" />

      {/* Icon */}
      <motion.div 
        variants={itemVariants}
        className="relative z-10 mb-5"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 blur-md" />
          </div>
          {config.icon}
        </div>
      </motion.div>

      {/* Text content */}
      <motion.h2 
        variants={itemVariants}
        className="text-2xl font-bold text-center relative z-10 text-white/95"
      >
        {config.title}
      </motion.h2>
      
      <motion.p 
        variants={itemVariants}
        className="mt-2 text-center text-white/80 max-w-xs relative z-10"
      >
        {config.message}
      </motion.p>

      {/* Progress dots for processing states */}
      {status.startsWith("processing") && (
        <motion.div 
          variants={itemVariants}
          className="flex mt-6 gap-1.5 relative z-10"
        >
          <motion.div 
            className="w-2 h-2 bg-white rounded-full"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1, 0.8], 
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity,
              repeatType: "mirror",
              delay: 0,
            }}
          />
          <motion.div 
            className="w-2 h-2 bg-white rounded-full"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1, 0.8], 
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity,
              repeatType: "mirror",
              delay: 0.4,
            }}
          />
          <motion.div 
            className="w-2 h-2 bg-white rounded-full"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1, 0.8], 
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity,
              repeatType: "mirror",
              delay: 0.8,
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
