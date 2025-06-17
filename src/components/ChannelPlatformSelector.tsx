
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Music } from "lucide-react";

interface ChannelPlatformSelectorProps {
  platform: string;
  accountName: string;
  onPlatformChange: (platform: string) => void;
  onAccountChange: (account: string) => void;
  connectedYouTubeChannels: any[];
  mockTikTokAccounts: string[];
}

export const ChannelPlatformSelector = ({
  platform,
  accountName,
  onPlatformChange,
  onAccountChange,
  connectedYouTubeChannels,
  mockTikTokAccounts
}: ChannelPlatformSelectorProps) => {
  const getAvailableAccounts = () => {
    if (!platform) return [];
    
    if (platform === 'youtube') {
      return connectedYouTubeChannels.map(channel => ({
        id: channel.channel_id,
        name: channel.channel_name,
        handle: channel.channel_handle,
        thumbnail: channel.thumbnail_url,
      }));
    }
    
    return mockTikTokAccounts.map(account => ({ id: account, name: account, handle: account }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Social Platform</Label>
        <Select value={platform} onValueChange={(value) => {
          onPlatformChange(value);
          onAccountChange("");
        }}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="youtube" className="text-white hover:bg-gray-700 focus:bg-gray-700">
              <div className="flex items-center space-x-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube</span>
              </div>
            </SelectItem>
            <SelectItem value="tiktok" className="text-white hover:bg-gray-700 focus:bg-gray-700">
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-pink-500" />
                <span>TikTok</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="account">Connected Account</Label>
        <Select 
          value={accountName} 
          onValueChange={onAccountChange}
          disabled={!platform}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder={platform ? "Select account" : "Choose platform first"} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {platform === 'youtube' ? (
              connectedYouTubeChannels.length > 0 ? (
                connectedYouTubeChannels.map((channel) => (
                  <SelectItem key={channel.channel_id} value={channel.channel_name} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center space-x-2">
                      {channel.thumbnail_url && (
                        <img src={channel.thumbnail_url} alt="" className="w-4 h-4 rounded-full" />
                      )}
                      <span>{channel.channel_name}</span>
                      <span className="text-xs text-gray-400">({channel.channel_handle})</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-accounts" disabled className="text-gray-400">
                  No YouTube channels connected
                </SelectItem>
              )
            ) : (
              getAvailableAccounts().map((account) => (
                <SelectItem key={account.id} value={account.name} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                  {account.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {platform === 'youtube' && connectedYouTubeChannels.length === 0 && (
          <p className="text-xs text-yellow-400">
            No YouTube channels connected. Go to Social Accounts to connect your YouTube channel first.
          </p>
        )}
        {platform === 'tiktok' && (
          <p className="text-xs text-yellow-400">
            TikTok integration coming soon. Connect your TikTok account in Social Accounts.
          </p>
        )}
      </div>
    </div>
  );
};
