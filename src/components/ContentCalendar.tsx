import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, PlayCircle, Edit, ChevronLeft, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScriptPreview } from "@/components/ScriptPreview";

const scheduleOptions = [
  { value: "twice-daily", label: "2x Daily", description: "Morning and evening posts", frequency: "14 posts/week" },
  { value: "daily", label: "Daily", description: "One post every day", frequency: "7 posts/week" },
  { value: "weekly", label: "Weekly", description: "3 posts per week", frequency: "3 posts/week" },
  { value: "monthly", label: "Monthly", description: "8 posts per month", frequency: "2 posts/week" },
];

const mockContentIdeas = [
  {
    id: 1,
    title: "5 Morning Habits That Will Transform Your Day",
    theme: "Productivity",
    scheduledFor: "Tomorrow 8:00 AM",
    status: "script-ready",
    engagement: "High"
  },
  {
    id: 2,
    title: "Why 99% of People Give Up Too Early",
    theme: "Motivation",
    scheduledFor: "Tomorrow 6:00 PM",
    status: "generating",
    engagement: "Very High"
  },
  {
    id: 3,
    title: "The One Habit That Reduces Anxiety Instantly",
    theme: "Wellness",
    scheduledFor: "Dec 18, 8:00 AM",
    status: "scheduled",
    engagement: "Medium"
  },
  {
    id: 4,
    title: "This Simple Trick Will Change How You Think",
    theme: "Self-Improvement",
    scheduledFor: "Dec 18, 6:00 PM",
    status: "scheduled",
    engagement: "High"
  },
  {
    id: 5,
    title: "What Rich People Know That You Don't",
    theme: "Success",
    scheduledFor: "Dec 19, 8:00 AM",
    status: "scheduled",
    engagement: "Very High"
  },
];

export const ContentCalendar = () => {
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState(mockContentIdeas);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);

  const selectedIdea = selectedIdeaId ? generatedIdeas.find(idea => idea.id === selectedIdeaId) : null;

  const handleScheduleSelect = (value: string) => {
    setSelectedSchedule(value);
    toast({
      title: "Schedule Updated",
      description: `Content schedule set to ${scheduleOptions.find(opt => opt.value === value)?.label}`,
    });
  };

  const generateMoreIdeas = () => {
    const newIdeas = [
      {
        id: generatedIdeas.length + 1,
        title: "The Secret to Never Procrastinating Again",
        theme: "Productivity",
        scheduledFor: "Dec 20, 8:00 AM",
        status: "scheduled",
        engagement: "High"
      },
      {
        id: generatedIdeas.length + 2,
        title: "Why Your Brain Sabotages Your Success",
        theme: "Psychology",
        scheduledFor: "Dec 20, 6:00 PM",
        status: "scheduled",
        engagement: "Very High"
      },
    ];
    setGeneratedIdeas([...generatedIdeas, ...newIdeas]);
    toast({
      title: "New Ideas Generated",
      description: "Added 2 new content ideas to your calendar!",
    });
  };

  const handleIdeaClick = (ideaId: number) => {
    setSelectedIdeaId(ideaId);
  };

  const handleBackToIdeas = () => {
    setSelectedIdeaId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "script-ready": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "generating": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "scheduled": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "Very High": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  // If an idea is selected, show the script preview
  if (selectedIdea) {
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
            <h2 className="text-3xl font-bold text-white">{selectedIdea.title}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                {selectedIdea.theme}
              </Badge>
              <span className="text-gray-400 text-sm">{selectedIdea.scheduledFor}</span>
            </div>
          </div>
        </div>
        <ScriptPreview />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Content Calendar</h2>
        <p className="text-gray-400">Set your posting schedule and view AI-generated content ideas</p>
      </div>

      {/* Schedule Selection */}
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

      {/* Generated Content Ideas */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center">
                <PlayCircle className="w-5 h-5 mr-2" />
                AI-Generated Content Ideas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Based on your selected themes and trending topics. Click on any idea to view its script.
              </CardDescription>
            </div>
            <Button 
              onClick={generateMoreIdeas}
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              Generate More Ideas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedIdeas.map((idea) => (
              <div 
                key={idea.id} 
                className="p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleIdeaClick(idea.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-2 hover:text-blue-400 transition-colors">{idea.title}</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                          {idea.theme}
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {idea.scheduledFor}
                      </div>
                      <div className={`flex items-center ${getEngagementColor(idea.engagement)}`}>
                        <span className="text-xs font-medium">
                          {idea.engagement} Engagement
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status === "script-ready" ? "Script Ready" : 
                       idea.status === "generating" ? "Generating..." : "Scheduled"}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality here
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </div>
                
                {idea.status === "script-ready" && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm font-medium">Ready for production!</p>
                    <p className="text-gray-300 text-sm">Script generated • Storyboard created • Voice selected</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
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
    </div>
  );
};
