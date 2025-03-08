"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <motion.header
      className="z-10 text-center max-w-4xl px-4 pt-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-5xl sm:text-7xl font-bold mb-4 leading-tight">
        AI-Generated Short Videos
      </h1>
      <p className="text-xl sm:text-2xl opacity-80 mb-8">
        Create stunning videos with auto-generated voiceovers, visuals, and
        scripts.
      </p>
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
        <Link href="#pricing">
          <Button size="lg" className="px-8 py-4 text-xl">
            Get Started
          </Button>
        </Link>
      </motion.div>
    </motion.header>
  );
}
