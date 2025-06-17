
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ScheduleSelectorProps {
  selectedSchedule: string;
  onScheduleSelect: (schedule: string) => void;
}

const scheduleOptions = [
  { value: "monthly", label: "Monthly", price: "$15/month", description: "1 video per month" },
  { value: "weekly", label: "Weekly", price: "$20/month", description: "4 videos per month" },
  { value: "daily", label: "Daily", price: "$30/month", description: "30 videos per month" },
  { value: "twice-daily", label: "2x Daily", price: "$45/month", description: "60 videos per month" },
];

export const ScheduleSelector = ({ selectedSchedule, onScheduleSelect }: ScheduleSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-white">Posting Schedule</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scheduleOptions.map((schedule) => (
          <Card
            key={schedule.value}
            className={`cursor-pointer transition-all ${
              selectedSchedule === schedule.value
                ? "bg-blue-600/20 border-blue-500 border-2"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
            onClick={() => onScheduleSelect(schedule.value)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium">{schedule.label}</h4>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {schedule.price}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm">{schedule.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { scheduleOptions };
