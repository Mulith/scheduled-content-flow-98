
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Edit, Download, Clock, Eye, Wand2 } from "lucide-react";

const mockScript = {
  title: "5 Morning Habits That Will Transform Your Day",
  theme: "Productivity",
  duration: "60 seconds",
  scenes: [
    {
      id: 1,
      timestamp: "0:00-0:08",
      text: "What if I told you that just 5 simple habits could completely transform your entire day?",
      visual: "Person waking up energetically, stretching in bed with sunlight streaming through window",
      voiceNote: "Enthusiastic, hook the viewer immediately"
    },
    {
      id: 2,
      timestamp: "0:08-0:15",
      text: "Habit number one: Wake up at the same time every day, even on weekends.",
      visual: "Clock showing consistent wake-up time, person getting out of bed confidently",
      voiceNote: "Clear and authoritative"
    },
    {
      id: 3,
      timestamp: "0:15-0:23",
      text: "Your body craves routine. When you wake up at the same time, you're programming your internal clock for success.",
      visual: "Animation showing internal body clock, peaceful sleeping and waking cycle",
      voiceNote: "Educational tone, explaining the science"
    },
    {
      id: 4,
      timestamp: "0:23-0:30",
      text: "Habit two: Drink a full glass of water immediately. Your body is dehydrated after 8 hours.",
      visual: "Person drinking water, refreshing close-up shots, body hydration visualization",
      voiceNote: "Practical and health-focused"
    },
    {
      id: 5,
      timestamp: "0:30-0:38",
      text: "Three: Make your bed. It's your first accomplishment of the day and sets a productive tone.",
      visual: "Satisfying bed-making sequence, neat organized bedroom",
      voiceNote: "Motivational and empowering"
    },
    {
      id: 6,
      timestamp: "0:38-0:45",
      text: "Four: Write down three things you're grateful for. Gratitude rewires your brain for positivity.",
      visual: "Hand writing in journal, peaceful morning light, grateful expressions",
      voiceNote: "Warm and reflective"
    },
    {
      id: 7,
      timestamp: "0:45-0:52",
      text: "And five: Move your body for just 5 minutes. A quick walk or stretch energizes your entire system.",
      visual: "Quick exercise montage, stretching, short walk, energetic movement",
      voiceNote: "Energetic and encouraging"
    },
    {
      id: 8,
      timestamp: "0:52-1:00",
      text: "Try these for just one week. Your future self will thank you. What's your morning routine?",
      visual: "Success transformation, before/after energy levels, call-to-action text overlay",
      voiceNote: "Concluding with a question to boost engagement"
    }
  ],
  storyboard: [
    { scene: 1, description: "Wide shot of bedroom with morning sunlight" },
    { scene: 2, description: "Close-up of alarm clock, person's feet hitting floor" },
    { scene: 3, description: "Animation graphics showing circadian rhythm" },
    { scene: 4, description: "Macro shot of water being poured and consumed" },
    { scene: 5, description: "Time-lapse of bed being made perfectly" },
    { scene: 6, description: "Overhead shot of journal with handwriting" },
    { scene: 7, description: "Quick cuts of various exercises and stretches" },
    { scene: 8, description: "Split screen showing tired vs energized person" }
  ]
};

export const ScriptPreview = () => {
  const [selectedScene, setSelectedScene] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Script Preview</h2>
        <p className="text-gray-400">Review and edit your AI-generated video script</p>
      </div>

      {/* Script Header */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white text-xl">{mockScript.title}</CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    {mockScript.theme}
                  </Badge>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {mockScript.duration}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {mockScript.scenes.length} scenes
                  </span>
                </div>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Edit className="w-4 h-4 mr-2" />
                Edit Script
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Generate Video
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Script Content */}
      <Tabs defaultValue="script" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10">
          <TabsTrigger value="script" className="text-white data-[state=active]:bg-blue-600">
            Script Timeline
          </TabsTrigger>
          <TabsTrigger value="storyboard" className="text-white data-[state=active]:bg-blue-600">
            Storyboard
          </TabsTrigger>
          <TabsTrigger value="production" className="text-white data-[state=active]:bg-blue-600">
            Production Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scene List */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="text-white font-medium">Scenes</h4>
              {mockScript.scenes.map((scene) => (
                <Card 
                  key={scene.id}
                  className={`cursor-pointer transition-all ${
                    selectedScene === scene.id
                      ? "bg-blue-600/20 border-blue-500"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedScene(scene.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Scene {scene.id}
                      </Badge>
                      <span className="text-xs text-gray-400">{scene.timestamp}</span>
                    </div>
                    <p className="text-white text-sm line-clamp-2">{scene.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scene Details */}
            <div className="lg:col-span-2">
              {mockScript.scenes.find(scene => scene.id === selectedScene) && (
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Scene {selectedScene} • {mockScript.scenes.find(scene => scene.id === selectedScene)?.timestamp}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Script Text */}
                    <div>
                      <h5 className="text-white font-medium mb-2">Script Text</h5>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white text-lg leading-relaxed">
                          {mockScript.scenes.find(scene => scene.id === selectedScene)?.text}
                        </p>
                      </div>
                    </div>

                    {/* Visual Description */}
                    <div>
                      <h5 className="text-white font-medium mb-2">Visual Description</h5>
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-purple-200">
                          {mockScript.scenes.find(scene => scene.id === selectedScene)?.visual}
                        </p>
                      </div>
                    </div>

                    {/* Voice Notes */}
                    <div>
                      <h5 className="text-white font-medium mb-2">Voice Direction</h5>
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-200">
                          {mockScript.scenes.find(scene => scene.id === selectedScene)?.voiceNote}
                        </p>
                      </div>
                    </div>

                    {/* Scene Actions */}
                    <div className="flex space-x-3">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Scene
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Play className="w-4 h-4 mr-2" />
                        Preview Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="storyboard">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Visual Storyboard</CardTitle>
              <CardDescription className="text-gray-400">
                AI-generated visual descriptions for video production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockScript.storyboard.map((board, index) => (
                  <Card key={index} className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Scene {board.scene}</span>
                      </div>
                      <p className="text-white text-sm">{board.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Production Pipeline</CardTitle>
              <CardDescription className="text-gray-400">
                Automated video generation workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: "Script Analysis", status: "completed", description: "AI analyzed script for timing and content" },
                  { step: "Voice Generation", status: "completed", description: "AI voice narration generated with selected voice" },
                  { step: "Visual Assets", status: "processing", description: "Requesting video clips from AI models (VEO 3)" },
                  { step: "Final Assembly", status: "pending", description: "Merging clips, adding overlays and effects" }
                ].map((item, index) => (
                  <Card key={index} className="bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-medium text-sm">{item.step}</h5>
                        <Badge 
                          className={
                            item.status === "completed" 
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : item.status === "processing"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12">
                  <Wand2 className="w-5 h-5 mr-2" />
                  Start Video Production
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
