import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface StatsCardProps {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, bgColor, textColor }) => {
  const Icon = icon;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-0">
      <div className={`${bgColor} h-1.5 w-full`}></div>
      <CardContent className="p-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor} bg-opacity-20`}>
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 