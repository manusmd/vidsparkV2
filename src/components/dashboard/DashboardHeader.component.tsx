"use client";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <div className="relative pb-2 border-b border-white/10">
      {/* Subtle gradient accent line */}
      <div className="absolute bottom-0 left-0 w-1/3 h-0.5 bg-gradient-to-r from-blue-600/80 to-purple-600/30"></div>
      
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-muted-foreground/80 mt-2">
        {subtitle}
      </p>
    </div>
  );
}; 