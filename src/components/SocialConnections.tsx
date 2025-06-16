
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Youtube, Music, Users, Video, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useYouTubeChannels } from "@/hooks/useYouTubeChannels";

export const SocialConnections = () => {
  const [tiktokConnection, setTiktokConnection] = useState({
    connected: false, 
    enabled: false 
  });

  const { 
    channels: youtubeChannels, 
    loading: youtubeLoading, 
    connectYouTube, 
    disconnectChannel 
  } = useYouTubeChannels();

  const handleConnectTikTok = () => {
    setTiktokConnection(prev => ({ ...prev, connected: true }));
    toast({
      title: "Connection Successful",
      description: "TikTok account connected successfully!",
    });
  };

  const handleToggleTikTok = () => {
    setTiktokConnection(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleDisconnectYouTube = async (channelId: string) => {
    await disconnectChannel(channelId);
    toast({
      title: "Channel Disconnected",
      description: "YouTube channel has been disconnected successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Social Media Connections</h2>
        <p className="text-gray-400">Connect your social media accounts to start automated posting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YouTube Connection */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">YouTube</CardTitle>
                  <CardDescription className="text-gray-400">Connect your YouTube channel</CardDescription>
                </div>
              </div>
              <Badge 
                variant={youtubeChannels.length > 0 ? "default" : "secondary"}
                className={youtubeChannels.length > 0
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }
              >
                {youtubeChannels.length > 0 ? `${youtubeChannels.length} Connected` : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {youtubeLoading ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">Loading YouTube channels...</p>
              </div>
            ) : youtubeChannels.length > 0 ? (
              <div className="space-y-4">
                {youtubeChannels.map((channel) => (
                  <div key={channel.id} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {channel.thumbnail_url && (
                          <img 
                            src={channel.thumbnail_url} 
                            alt={channel.channel_name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="text-green-400 font-medium">{channel.channel_name}</p>
                          {channel.channel_handle && (
                            <p className="text-green-300 text-sm">@{channel.channel_handle}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnectYouTube(channel.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">
                          {channel.subscriber_count.toLocaleString()} subscribers
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Video className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">
                          {channel.video_count.toLocaleString()} videos
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={connectYouTube}
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  Connect Another Channel
                </Button>
              </div>
            ) : (
              <Button 
                onClick={connectYouTube}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Youtube className="w-4 h-4 mr-2" />
                Connect YouTube Account
              </Button>
            )}
          </CardContent>
        </Card>

        {/* TikTok Connection */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/20">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">TikTok</CardTitle>
                  <CardDescription className="text-gray-400">Connect your TikTok profile</CardDescription>
                </div>
              </div>
              <Badge 
                variant={tiktokConnection.connected ? "default" : "secondary"}
                className={tiktokConnection.connected 
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }
              >
                {tiktokConnection.connected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tiktokConnection.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Enable auto-posting</span>
                  <Switch 
                    checked={tiktokConnection.enabled}
                    onCheckedChange={handleToggleTikTok}
                  />
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✓ Connected to: @yourusername
                  </p>
                  <p className="text-green-400 text-sm">
                    ✓ Permissions: Upload videos, manage account
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={handleConnectTikTok}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Connect TikTok Account
                </Button>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ TikTok integration is coming soon! Currently in development.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Instructions */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">How It Works</CardTitle>
          <CardDescription className="text-gray-400">
            Understanding the connection process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">1. Secure OAuth</h4>
              <p className="text-gray-400 text-sm">
                We use secure OAuth 2.0 to connect your accounts safely
              </p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-2">2. Limited Permissions</h4>
              <p className="text-gray-400 text-sm">
                We only request permissions needed for posting content
              </p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">3. Full Control</h4>
              <p className="text-gray-400 text-sm">
                You can disconnect or modify permissions anytime
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
