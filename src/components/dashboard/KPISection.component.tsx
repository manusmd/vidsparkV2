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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard 
        icon={<Video className="w-5 h-5" />} 
        value={formatNumber(totalVideos)} 
        label="Videos Created" 
        description="Total videos created with VidSpark" 
      />
      
      <MetricCard 
        icon={<Share2 className="w-5 h-5" />} 
        value={formatNumber(activeVideos)} 
        label="Active Videos" 
        description="Videos ready for viewing" 
      />
      
      <MetricCard 
        icon={<FileText className="w-5 h-5" />} 
        value={formatNumber(videosInProduction)} 
        label="Videos in Production" 
        description="Videos in draft or processing stage" 
      />
    </div>
  );
}; 