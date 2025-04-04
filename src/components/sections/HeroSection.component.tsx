"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
    <motion.header
      className="z-10 text-center max-w-5xl px-4 pt-16 relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-10 -left-20 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.2, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1,
        }}
      />

      {/* Badge */}
      <motion.div
        className="inline-block mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          ✨ Next-Generation Video Creation
        </span>
      </motion.div>

      <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
        AI-Generated Short Videos
      </h1>
      <p className="text-xl sm:text-2xl opacity-80 mb-6 text-gray-300 max-w-3xl mx-auto">
        Create stunning videos with auto-generated voiceovers, visuals, and
        scripts in minutes, not hours. Includes powerful analytics to track performance.
      </p>

      {/* Feature badges */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <motion.div 
          className="bg-purple-500/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-500/30 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-sm font-medium text-purple-300">🎬 AI Video Generation</span>
        </motion.div>
        <motion.div 
          className="bg-blue-500/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-500/30 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm font-medium text-blue-300">📊 Performance Analytics</span>
        </motion.div>
        <motion.div 
          className="bg-green-500/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-500/30 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-sm font-medium text-green-300">🔊 Auto Voiceovers</span>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Link href="/api/auth/signin">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Link href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-medium border-purple-500/50 text-white hover:bg-purple-500/10"
            >
              How It Works
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Preview image with glow effect */}
      <motion.div
        className="relative mx-auto max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 z-10 pointer-events-none"></div>
        <Image
          src="/create-stories-screenshot.png"
          alt="VidSpark Content Creation Interface"
          width={1200}
          height={675}
          className="w-full h-auto"
          priority
        />
      </motion.div>
    </motion.header>
  );
}
