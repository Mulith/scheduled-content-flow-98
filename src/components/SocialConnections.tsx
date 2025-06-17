import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Youtube, Music, ExternalLink, Users, Video, CheckCircle, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useYouTubeAuth } from "@/hooks/useYouTubeAuth";

export const SocialConnections = () => {
  const [connections, setConnections] = useState({
    youtube: { connected: false, enabled: false },
    tiktok: { connected: false, enabled: false },
  });
  
  const [youtubeChannels, setYoutubeChannels] = useState<any[]>([]);
  const { isConnecting, isDisconnecting, connectYouTube, disconnectYouTube, handleOAuthCallback, fetchConnectedChannels } = useYouTubeAuth();

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state).then((channel) => {
        if (channel) {
          loadYouTubeChannels();
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    } else {
      loadYouTubeChannels();
    }
  }, []);

  const loadYouTubeChannels = async () => {
    const channels = await fetchConnectedChannels();
    setYoutubeChannels(channels);
    setConnections(prev => ({
      ...prev,
      youtube: { 
        connected: channels.length > 0, 
        enabled: channels.some(c => c.enabled) || false 
      }
    }));
  };

  const handleConnectYouTube = async () => {
    await connectYouTube();
  };

  const handleDisconnectYouTube = async () => {
    try {
      await disconnectYouTube();
      await loadYouTubeChannels();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleConnect = (platform: string) => {
    if (platform === 'youtube') {
      handleConnectYouTube();
      return;
    }
    
    setConnections(prev => ({
      ...prev,
      [platform]: { ...prev[platform], connected: true }
    }));
    toast({
      title: "Connection Successful",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully!`,
    });
  };

  const handleToggle = (platform: string) => {
    setConnections(prev => ({
      ...prev,
      [platform]: { ...prev[platform], enabled: !prev[platform].enabled }
    }));
  };

  const formatNumber = (num: number | string) => {
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
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
                variant={connections.youtube.connected ? "default" : "secondary"}
                className={connections.youtube.connected 
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }
              >
                {connections.youtube.connected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {connections.youtube.connected && youtubeChannels.length > 0 ? (
              <div className="space-y-4">
                {youtubeChannels.map((channel) => (
                  <div key={channel.id} className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      {channel.thumbnail_url && (
                        <img 
                          src={channel.thumbnail_url} 
                          alt={channel.channel_name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-green-400 font-medium">{channel.channel_name}</h4>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-green-400 text-sm">{channel.channel_handle}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-green-300">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{formatNumber(channel.subscriber_count)} subscribers</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Video className="w-3 h-3" />
                            <span>{formatNumber(channel.video_count)} videos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-between">
                  <span className="text-white">Enable auto-posting</span>
                  <Switch 
                    checked={connections.youtube.enabled}
                    onCheckedChange={() => handleToggle('youtube')}
                  />
                </div>

                <Button 
                  onClick={handleDisconnectYouTube}
                  disabled={isDisconnecting}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {isDisconnecting ? (
                    "Disconnecting..."
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Disconnect YouTube
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => handleConnect('youtube')}
                disabled={isConnecting}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isConnecting ? "Connecting..." : "Connect YouTube Account"}
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
                variant={connections.tiktok.connected ? "default" : "secondary"}
                className={connections.tiktok.connected 
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }
              >
                {connections.tiktok.connected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {connections.tiktok.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Enable auto-posting</span>
                  <Switch 
                    checked={connections.tiktok.enabled}
                    onCheckedChange={() => handleToggle('tiktok')}
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
              <Button 
                onClick={() => handleConnect('tiktok')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Connect TikTok Account
              </Button>
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
