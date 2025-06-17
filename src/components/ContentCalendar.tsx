
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { ScriptPreview } from "@/components/ScriptPreview";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleSelection } from "@/components/calendar/ScheduleSelection";
import { ContentIdeasSection } from "@/components/calendar/ContentIdeasSection";
import { WeeklyScheduleView } from "@/components/calendar/WeeklyScheduleView";

export const ContentCalendar = () => {
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // Fetch real content items from the database
  const { data: contentItems = [], isLoading, refetch } = useQuery({
    queryKey: ['content-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          content_channels (
            name,
            schedule,
            platform
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content items:', error);
        throw error;
      }

      // Transform data to match the expected format
      return data.map(item => ({
        id: item.id,
        title: item.title,
        theme: item.content_channels?.name || 'Unknown Channel',
        scheduledFor: getScheduledDate(item.created_at, item.content_channels?.schedule || 'daily'),
        status: item.status,
        engagement: getEngagementLevel(item.topic_keywords?.length || 0),
        channel: item.content_channels?.name || 'Unknown Channel',
        script: item.script,
        duration: item.duration_seconds
      }));
    },
  });

  // Fetch scenes for the selected content item
  const { data: selectedContentWithScenes } = useQuery({
    queryKey: ['content-item-with-scenes', selectedIdeaId],
    queryFn: async () => {
      if (!selectedIdeaId) return null;

      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .select(`
          *,
          content_channels (
            name,
            schedule,
            platform
          ),
          content_scenes (
            scene_number,
            start_time_seconds,
            end_time_seconds,
            visual_description,
            narration_text
          )
        `)
        .eq('id', selectedIdeaId)
        .single();

      if (contentError) {
        console.error('Error fetching content item with scenes:', contentError);
        throw contentError;
      }

      return {
        id: contentItem.id,
        title: contentItem.title,
        theme: contentItem.content_channels?.name || 'Unknown Channel',
        scheduledFor: getScheduledDate(contentItem.created_at, contentItem.content_channels?.schedule || 'daily'),
        status: contentItem.status,
        engagement: getEngagementLevel(contentItem.topic_keywords?.length || 0),
        channel: contentItem.content_channels?.name || 'Unknown Channel',
        script: contentItem.script,
        duration: contentItem.duration_seconds,
        scenes: contentItem.content_scenes || []
      };
    },
    enabled: !!selectedIdeaId,
  });

  const getScheduledDate = (createdAt: string, schedule: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return created.toLocaleDateString();
  };

  const getEngagementLevel = (topicCount: number) => {
    if (topicCount >= 5) return "Very High";
    if (topicCount >= 3) return "High";
    if (topicCount >= 1) return "Medium";
    return "Low";
  };

  const handleIdeaClick = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
  };

  const handleBackToIdeas = () => {
    setSelectedIdeaId(null);
  };

  // If an idea is selected, show the script preview with real data including scenes
  if (selectedContentWithScenes) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleBackToIdeas}
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Content Ideas
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-white">{selectedContentWithScenes.title}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                {selectedContentWithScenes.theme}
              </Badge>
              <span className="text-gray-400 text-sm">{selectedContentWithScenes.scheduledFor}</span>
            </div>
          </div>
        </div>
        <ScriptPreview contentItem={selectedContentWithScenes} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Content Calendar</h2>
        <p className="text-gray-400">Set your posting schedule and view AI-generated content ideas</p>
      </div>

      <ScheduleSelection 
        selectedSchedule={selectedSchedule}
        onScheduleSelect={setSelectedSchedule}
      />

      <ContentIdeasSection 
        contentItems={contentItems}
        isLoading={isLoading}
        onIdeaClick={handleIdeaClick}
        onRefetch={refetch}
      />

      <WeeklyScheduleView selectedSchedule={selectedSchedule} />
    </div>
  );
};
