"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
  color?: "blue" | "green" | "purple" | "amber" | "red";
}

export const MetricCard = ({ 
  icon, 
  value, 
  label, 
  description,
  color = "blue"
}: MetricCardProps) => {
  // Color maps for different elements
  const colorMap = {
    blue: {
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      iconRing: "ring-blue-500/20",
      gradient: "from-blue-500/40 via-blue-400/30 to-transparent",
      valueBg: "from-blue-400 to-blue-500/70",
      hoverBorder: "group-hover:border-blue-500/30"
    },
    green: {
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
      iconRing: "ring-green-500/20",
      gradient: "from-green-500/40 via-green-400/30 to-transparent",
      valueBg: "from-green-400 to-green-500/70",
      hoverBorder: "group-hover:border-green-500/30"
    },
    purple: {
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      iconRing: "ring-purple-500/20",
      gradient: "from-purple-500/40 via-purple-400/30 to-transparent",
      valueBg: "from-purple-400 to-purple-500/70",
      hoverBorder: "group-hover:border-purple-500/30"
    },
    amber: {
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      iconRing: "ring-amber-500/20",
      gradient: "from-amber-500/40 via-amber-400/30 to-transparent",
      valueBg: "from-amber-400 to-amber-500/70",
      hoverBorder: "group-hover:border-amber-500/30"
    },
    red: {
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      iconRing: "ring-red-500/20",
      gradient: "from-red-500/40 via-red-400/30 to-transparent",
      valueBg: "from-red-400 to-red-500/70",
      hoverBorder: "group-hover:border-red-500/30"
    }
  };

  const selectedColor = colorMap[color];

  return (
    <Card className={cn(
      "border border-white/10 bg-card/60 backdrop-blur-sm shadow-xl overflow-hidden relative group transition-all duration-300",
      selectedColor.hoverBorder
    )}>
      {/* Top border accent */}
      <div className={cn("h-0.5 w-full bg-gradient-to-r", selectedColor.gradient)}></div>
      
      <CardHeader className="pb-2 relative">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-foreground/90">{label}</CardTitle>
          <div className={cn("p-3 rounded-full ring-1 shadow-sm", selectedColor.iconBg, selectedColor.iconColor, selectedColor.iconRing)}>
            {icon}
          </div>
        </div>
        <CardDescription className="text-muted-foreground/80">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="relative">
        <p className={cn("text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br", selectedColor.valueBg)}>
          {value}
        </p>
      </CardContent>
      
      {/* Bottom accent */}
      <div className={cn(
        "absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
        selectedColor.gradient
      )}></div>
    </Card>
  );
}; 