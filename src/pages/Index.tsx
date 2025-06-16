
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Calendar, Palette, Mic, Video, Upload } from "lucide-react";
import { SocialConnections } from "@/components/SocialConnections";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ContentCalendar } from "@/components/ContentCalendar";
import { VoiceSelector } from "@/components/VoiceSelector";
import { ColorCustomizer } from "@/components/ColorCustomizer";
import { ScriptPreview } from "@/components/ScriptPreview";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    { label: "Videos Created", value: "127", icon: Video },
    { label: "Total Views", value: "45.2K", icon: PlayCircle },
    { label: "Scheduled Posts", value: "23", icon: Calendar },
    { label: "Active Themes", value: "8", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ContentAI Studio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Pro Plan
              </Badge>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: PlayCircle },
              { id: "connections", label: "Social Accounts", icon: Upload },
              { id: "themes", label: "Themes", icon: Palette },
              { id: "calendar", label: "Content Calendar", icon: Calendar },
              { id: "voice", label: "Voice Settings", icon: Mic },
              { id: "scripts", label: "Script Preview", icon: Video },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <stat.icon className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Get started with your content creation workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab("connections")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Connect Social Accounts
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("themes")}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 h-12"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Choose Themes
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("calendar")}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 h-12"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Video generated", title: "5 Morning Productivity Tips", time: "2 hours ago", status: "completed" },
                    { action: "Script created", title: "Why You Need This Habit", time: "4 hours ago", status: "processing" },
                    { action: "Posted to YouTube", title: "Transform Your Day in 60 Seconds", time: "1 day ago", status: "live" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-gray-400 text-sm">{item.action} • {item.time}</p>
                      </div>
                      <Badge 
                        variant={item.status === "live" ? "default" : "secondary"}
                        className={
                          item.status === "live" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : item.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "connections" && <SocialConnections />}
        {activeTab === "themes" && <ThemeSelector />}
        {activeTab === "calendar" && <ContentCalendar />}
        {activeTab === "voice" && (
          <div className="space-y-6">
            <VoiceSelector />
            <ColorCustomizer />
          </div>
        )}
        {activeTab === "scripts" && <ScriptPreview />}
      </main>
    </div>
  );
};

export default Index;
