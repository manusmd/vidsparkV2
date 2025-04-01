"use client";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <motion.div
      className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--brand-primary)]/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--brand-secondary)]/10 rounded-full filter blur-[100px] animate-pulse [animation-delay:2s]"></div>

      {/* Subtle stars/particles */}
      <div className="stars absolute inset-0">
        <style jsx global>{`
          .stars {
            background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), 
                              radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), 
                              radial-gradient(1px 1px at 90px 40px, #ddd, rgba(0,0,0,0));
            background-size: 200px 200px;
            opacity: 0.1;
          }
        `}</style>
      </div>
    </motion.div>
  );
}