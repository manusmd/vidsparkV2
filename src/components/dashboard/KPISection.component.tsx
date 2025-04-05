"use client";

import React from "react";
import { MetricCard } from "./MetricCard.component";
import { 
  Video, 
  FileText,
  Share2,
  TrendingUp
} from "lucide-react";

type KPISectionProps = {
  totalVideos: number;
  videosInProduction: number;
  activeVideos: number;
  formatNumber: (value: number | undefined) => string;
};

export const KPISection = ({
  totalVideos,
  videosInProduction,
  activeVideos,
  formatNumber
}: KPISectionProps) => {
  return (
    <div className="relative mb-12">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 rounded-xl pointer-events-none"></div>
      
      <div className="p-6 bg-card/30 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-white">Dashboard Overview</h3>
          
          <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-white/70">Live Analytics</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            icon={<Video className="w-5 h-5" />} 
            value={formatNumber(totalVideos)} 
            label="Videos Created" 
            description="Total videos created with VidSpark" 
            color="blue"
          />
          
          <MetricCard 
            icon={<Share2 className="w-5 h-5" />} 
            value={formatNumber(activeVideos)} 
            label="Active Videos" 
            description="Videos ready for viewing" 
            color="green"
          />
          
          <MetricCard 
            icon={<FileText className="w-5 h-5" />} 
            value={formatNumber(videosInProduction)} 
            label="Videos in Production" 
            description="Videos in draft or processing stage" 
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}; 