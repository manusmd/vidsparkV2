"use client";

import { Video, CreditCard, FileText } from "lucide-react";
import { MetricCard } from "./MetricCard.component";

interface KPISectionProps {
  totalVideos: number;
  availableCredits: number;
  videosInProduction: number;
  formatNumber: (num: number) => string;
}

export const KPISection = ({
  totalVideos,
  availableCredits,
  videosInProduction,
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
        icon={<CreditCard className="w-5 h-5" />} 
        value={formatNumber(availableCredits)} 
        label="Available Credits" 
        description="Credits for video creation" 
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