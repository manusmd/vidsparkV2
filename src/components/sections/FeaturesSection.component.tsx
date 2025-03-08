"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Settings, Zap } from "lucide-react";

export default function FeaturesSection() {
  return (
    <motion.section
      className="z-10 mt-20 grid gap-8 md:grid-cols-3 max-w-6xl px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <CardContent className="p-6 text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-blue-500" />
          <h3 className="text-2xl font-semibold mb-2">
            Innovative Storytelling
          </h3>
          <p className="opacity-80">
            Engage your audience with compelling AI-crafted narratives.
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <CardContent className="p-6 text-center">
          <Settings size={48} className="mx-auto mb-4 text-purple-500" />
          <h3 className="text-2xl font-semibold mb-2">Seamless Automation</h3>
          <p className="opacity-80">
            Automate your video creation process from script to upload.
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <CardContent className="p-6 text-center">
          <Zap size={48} className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-2xl font-semibold mb-2">Lightning Fast</h3>
          <p className="opacity-80">
            Generate and publish videos in minutes, not hours.
          </p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
