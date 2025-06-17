
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Loader2 } from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useVoices } from "@/hooks/useVoices";
import { toast } from "@/hooks/use-toast";

export const ChannelCreation = () => {
  const [channelName, setChannelName] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [topic, setTopic] = useState("");
  
  const { createCheckoutSession, isLoading: checkoutLoading } = useStripeCheckout();
  const { voices, isLoading: voicesLoading } = useVoices();

  const scheduleOptions = [
    { value: "monthly", label: "Monthly", price: "$15/month", description: "1 video per month" },
    { value: "weekly", label: "Weekly", price: "$20/month", description: "4 videos per month" },
    { value: "daily", label: "Daily", price: "$30/month", description: "30 videos per month" },
    { value: "twice-daily", label: "2x Daily", price: "$45/month", description: "60 videos per month" },
  ];

  const handleCreateChannel = async () => {
    if (!channelName || !selectedSchedule || !selectedVoice || !topic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before creating your channel.",
        variant: "destructive",
      });
      return;
    }

    const success = await createCheckoutSession(selectedSchedule, channelName);
    if (success) {
      toast({
        title: "Redirecting to Checkout",
        description: "Opening Stripe checkout in a new tab...",
      });
    }
  };

  const selectedScheduleData = scheduleOptions.find(s => s.value === selectedSchedule);
  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create New Channel
        </CardTitle>
        <CardDescription className="text-gray-400">
          Set up your automated content channel with AI narration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Name */}
        <div className="space-y-2">
          <Label htmlFor="channelName" className="text-white">Channel Name</Label>
          <Input
            id="channelName"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="e.g., Daily Productivity Tips"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-white">Content Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Productivity, Fitness, Business Tips"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Schedule Selection */}
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
                onClick={() => setSelectedSchedule(schedule.value)}
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

        {/* Voice Selection */}
        <div className="space-y-3">
          <Label className="text-white">AI Voice</Label>
          {voicesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-400">Loading voices...</span>
            </div>
          ) : (
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose an AI voice" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id} className="text-white">
                    <div className="flex items-center space-x-2">
                      <span>{voice.name}</span>
                      {voice.type === "premium" && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedVoiceData && (
            <p className="text-gray-400 text-sm">
              {selectedVoiceData.description} • {selectedVoiceData.accent} accent
            </p>
          )}
        </div>

        {/* Summary */}
        {channelName && selectedSchedule && selectedVoice && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <h4 className="text-white font-medium mb-3">Channel Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Channel Name:</span>
                  <span className="text-white">{channelName}</span>
                </div>
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
        )}

        {/* Create Channel Button */}
        <Button
          onClick={handleCreateChannel}
          disabled={!channelName || !selectedSchedule || !selectedVoice || !topic || checkoutLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Checkout...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Create Channel & Subscribe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
