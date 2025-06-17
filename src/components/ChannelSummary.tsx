
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scheduleOptions } from "./ScheduleSelector";
import { videoStyleOptions } from "./VideoStyleSelector";
import { useVoices } from "@/hooks/useVoices";

interface ChannelSummaryProps {
  channelName: string;
  selectedSchedule: string;
  selectedVoice: string;
  selectedVideoTypes: string[];
  topicSelection: string;
  selectedTopics: string[];
}

export const ChannelSummary = ({
  channelName,
  selectedSchedule,
  selectedVoice,
  selectedVideoTypes,
  topicSelection,
  selectedTopics
}: ChannelSummaryProps) => {
  const { voices } = useVoices();
  const selectedScheduleData = scheduleOptions.find(s => s.value === selectedSchedule);
  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  if (!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <h4 className="text-white font-medium mb-3">Channel Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Channel Name:</span>
            <span className="text-white">{channelName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Video Styles:</span>
            <span className="text-white">{selectedVideoTypes.length} styles selected</span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 text-sm">Selected Styles:</span>
            <div className="flex flex-wrap gap-1">
              {selectedVideoTypes.map(typeId => {
                const type = videoStyleOptions.find(s => s.id === typeId);
                return (
                  <Badge key={typeId} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {type?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Topic Selection:</span>
            <span className="text-white">
              {topicSelection === "ai-decide" ? "AI Decides" : `${selectedTopics.length} topics selected`}
            </span>
          </div>
          {topicSelection !== "ai-decide" && selectedTopics.length > 0 && (
            <div className="space-y-1">
              <span className="text-gray-400 text-sm">Selected Topics:</span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {selectedTopics.slice(0, 6).map((topic) => (
                  <Badge key={topic} className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                    {topic.length > 20 ? topic.substring(0, 20) + '...' : topic}
                  </Badge>
                ))}
                {selectedTopics.length > 6 && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                    +{selectedTopics.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Schedule:</span>
            <span className="text-white">{selectedScheduleData?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Voice:</span>
            <span className="text-white">{selectedVoiceData?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Monthly Cost:</span>
            <span className="text-white font-medium">{selectedScheduleData?.price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
