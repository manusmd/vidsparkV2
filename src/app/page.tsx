import HeroSection from "@/components/sections/HeroSection.component";
import HowSection from "@/components/sections/HowSection.component";
import TestimonialsSection from "@/components/sections/TestimonialSection.component";
// Temporarily commenting out pricing section
// import PricingSection from "@/components/sections/PricingSection.component";
import FooterSection from "@/components/sections/FooterSection.component";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { Suspense } from "react";

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function LandingPage() {
  // Reminder to manually add the screenshot image
  if (typeof window !== 'undefined') {
    console.log('IMPORTANT: Please manually add the create-stories-screenshot.png file to the public directory');
  }
  
  return (
    <div className="relative pb-8 flex flex-col items-center justify-center min-h-screen w-full overflow-hidden transition-colors duration-300 bg-gradient-to-br from-gray-900 to-black text-foreground">
      {/* Client-side animated background */}
      <AnimatedBackground />

      {/* Use Suspense for client components */}
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
        <HowSection />
        {/* Temporarily removed pricing section */}
        {/* <PricingSection /> */}
        <TestimonialsSection />
        <FooterSection />
      </Suspense>
    </div>
  );
}
