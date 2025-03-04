"use client";

import { Rocket, Film, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground" />
    ); // Prevent hydration mismatch
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background text-foreground transition-colors duration-0">
      {/* Hero Section */}
      <section className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-6">
          Create AI-Generated Short Videos with Ease
        </h1>
        <p className="text-lg mb-8 opacity-80">
          VidSpark helps you generate high-quality AI-powered short-form videos
          in minutes. Choose a genre, let AI generate a script, and publish your
          content effortlessly.
        </p>
        <Button className="px-6 py-3 text-lg">Get Started for Free</Button>
      </section>

      {/* Features Section */}
      <section className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-center">
        <FeatureCard icon={<Rocket size={50} />} title="AI-Powered Creation">
          Generate unique video scripts and visuals instantly.
        </FeatureCard>
        <FeatureCard icon={<Film size={50} />} title="Optimized for Shorts">
          Create content for YouTube Shorts, TikTok, and Reels.
        </FeatureCard>
        <FeatureCard icon={<Upload size={50} />} title="One-Click Upload">
          Publish directly to your YouTube channel.
        </FeatureCard>
      </section>

      {/* Footer */}
      <footer className="mt-16 opacity-60 text-sm">
        © {new Date().getFullYear()} VidSpark. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-card text-card-foreground rounded-lg flex flex-col items-center transition-colors duration-200 shadow-md border border-border">
      {icon}
      <h3 className="text-xl font-semibold mt-4">{title}</h3>
      <p className="opacity-80 text-sm mt-2">{children}</p>
    </div>
  );
}
