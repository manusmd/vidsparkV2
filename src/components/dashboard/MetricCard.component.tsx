"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
}

export const MetricCard = ({ 
  icon, 
  value, 
  label, 
  description 
}: MetricCardProps) => (
  <Card className="border border-white/10 bg-card/60 backdrop-blur-sm shadow-xl overflow-hidden relative group hover:border-primary/20 transition-all duration-300">
    {/* Subtle gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-80"></div>
    
    <CardHeader className="pb-2 relative">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold text-foreground/90">{label}</CardTitle>
        <div className="p-3 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm">
          {icon}
        </div>
      </div>
      <CardDescription className="text-muted-foreground/80">{description}</CardDescription>
    </CardHeader>
    
    <CardContent className="relative">
      <p className="text-4xl font-bold tracking-tight text-foreground bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
        {value}
      </p>
    </CardContent>
    
    {/* Accent border on hover */}
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/40 to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
  </Card>
); 