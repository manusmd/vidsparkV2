import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/charts/PieChart";

interface AudienceDemographicsChartProps {
  data?: {
    ageGroups?: Array<{
      name: string;
      value: number;
    }>;
    genderDistribution?: {
      male: number;
      female: number;
    };
  };
}

export function AudienceDemographicsChart({ data }: AudienceDemographicsChartProps) {
  // Generate sample data if no data is provided
  const ageData = React.useMemo(() => {
    if (data?.ageGroups && data.ageGroups.length > 0) return data.ageGroups;

    // Sample age distribution data
    return [
      { name: "18-24", value: 25, fill: "var(--chart-1)" },
      { name: "25-34", value: 35, fill: "var(--chart-2)" },
      { name: "35-44", value: 20, fill: "var(--chart-3)" },
      { name: "45+", value: 20, fill: "var(--chart-4)" },
    ];
  }, [data?.ageGroups]);

  const genderData = React.useMemo(() => {
    if (data?.genderDistribution) {
      return [
        { name: "Male", value: data.genderDistribution.male },
        { name: "Female", value: data.genderDistribution.female },
      ];
    }

    // Sample gender distribution data
    return [
      { name: "Male", value: 65 },
      { name: "Female", value: 35 },
    ];
  }, [data?.genderDistribution]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Demographics</CardTitle>
        <CardDescription>
          Understand your audience better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] relative">
          <h4 className="text-sm font-medium mb-2">Age Distribution</h4>
          <div className="w-full h-[250px]">
            <PieChart
              data={ageData}
              height={250}
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={2}
            />
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Gender Distribution</h4>
          <div className="flex items-center space-x-2">
            <div 
              className="h-4 bg-primary rounded-l-full" 
              style={{ width: `${genderData[0].value}%` }}
            ></div>
            <div 
              className="h-4 bg-secondary rounded-r-full" 
              style={{ width: `${genderData[1].value}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs">Male ({genderData[0].value}%)</span>
            <span className="text-xs">Female ({genderData[1].value}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
