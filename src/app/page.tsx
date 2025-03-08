"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/sections/HeroSection.component";
import FeaturesSection from "@/components/sections/FeaturesSection.component";
import HowSection from "@/components/sections/HowSection.component";
import TestimonialsSection from "@/components/sections/TestimonialSection.component";
import PricingSection from "@/components/sections/PricingSection.component";
import FooterSection from "@/components/sections/FooterSection.component";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen w-full bg-background" />;

  return (
    <div className="relative pb-8 flex flex-col items-center justify-center min-h-screen w-full overflow-hidden transition-colors duration-300 bg-gradient-to-br from-gray-900 to-black text-foreground">
      {/* Background Animation */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <svg
          className="absolute left-1/2 transform -translate-x-1/2"
          width="800"
          height="800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="400" cy="400" r="400" fill="#1e293b" opacity="0.1" />
        </svg>
      </motion.div>
      <HeroSection />
      <FeaturesSection />
      <HowSection />
      <PricingSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}
