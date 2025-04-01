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
  <Card className="border border-border shadow-md transition-all hover:shadow-lg">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg">{label}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </CardContent>
  </Card>
); 