"use client";
import { motion } from "framer-motion";

export default function FooterSection() {
  return (
    <motion.footer
      className="z-10 mt-24 opacity-70 text-sm text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.8 }}
    >
      © {new Date().getFullYear()} VidSpark. All rights reserved.
    </motion.footer>
  );
}
