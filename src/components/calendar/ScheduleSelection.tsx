
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { scheduleOptions } from "@/constants/scheduleOptions";
import { toast } from "@/hooks/use-toast";

interface ScheduleSelectionProps {
  selectedSchedule: string;
  onScheduleSelect: (schedule: string) => void;
}

export const ScheduleSelection = ({ selectedSchedule, onScheduleSelect }: ScheduleSelectionProps) => {
  const handleScheduleSelect = (value: string) => {
    onScheduleSelect(value);
    toast({
      title: "Schedule Updated",
      description: `Content schedule set to ${scheduleOptions.find(opt => opt.value === value)?.label}`,
    });
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Posting Schedule
        </CardTitle>
        <CardDescription className="text-gray-400">
          Choose how frequently you want to post content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scheduleOptions.map((option) => (
            <Card 
              key={option.value}
              className={`cursor-pointer transition-all duration-200 ${
                selectedSchedule === option.value
                  ? "bg-blue-600/20 border-blue-500 border-2"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              onClick={() => handleScheduleSelect(option.value)}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <h4 className="text-white font-semibold">{option.label}</h4>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {option.frequency}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
