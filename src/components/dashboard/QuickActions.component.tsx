"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import ROUTES from "@/lib/routes";

export const QuickActions = () => {
  const router = useRouter();

  return (
    <div className="relative rounded-xl overflow-hidden mt-6 mb-12">
      {/* Background gradient with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-600/30 to-primary/20 z-0 opacity-80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15] mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10 py-10 px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-primary"></div>
            <h3 className="text-sm font-medium text-white/70">VidSpark Studio</h3>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white">Create your next viral video</h2>
          <p className="text-white/70 max-w-md">
            Transform your ideas into engaging short-form videos with AI-generated scenes, narration, and music.
          </p>
          
          <Button 
            className="mt-4 h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-700/20 border-0 gap-2 text-white rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => router.push(ROUTES.PAGES.APP.STUDIO)}
          >
            <Plus className="w-5 h-5" />
            Open Studio
          </Button>
        </div>
        
        <div className="hidden md:flex justify-end">
          <div className="relative w-64 h-64">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white/80 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 