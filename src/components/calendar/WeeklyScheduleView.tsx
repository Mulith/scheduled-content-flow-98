
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyScheduleViewProps {
  selectedSchedule: string;
}

export const WeeklyScheduleView = ({ selectedSchedule }: WeeklyScheduleViewProps) => {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">This Week's Schedule</CardTitle>
        <CardDescription className="text-gray-400">
          Overview of your content pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-gray-400 text-sm font-medium mb-2">{day}</div>
              <div className="space-y-1">
                {index < 5 && (
                  <>
                    <div className="w-full h-2 bg-blue-600 rounded-full"></div>
                    {selectedSchedule === "twice-daily" && (
                      <div className="w-full h-2 bg-purple-600 rounded-full"></div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
