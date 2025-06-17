
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChannelBasicInfoProps {
  channelName: string;
  setChannelName: (name: string) => void;
}

export const ChannelBasicInfo = ({ channelName, setChannelName }: ChannelBasicInfoProps) => {
  return (
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
  );
};
