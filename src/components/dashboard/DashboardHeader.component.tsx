"use client";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">
        {subtitle}
      </p>
    </div>
  );
}; 