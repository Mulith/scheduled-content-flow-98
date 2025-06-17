
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, TrendingUp, Heart, Lightbulb, Target, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const aiSuggestedThemes = [
  {
    id: "productivity",
    name: "Productivity & Self-Improvement",
    icon: Target,
    description: "Tips for productivity, habits, and personal growth",
    popularity: "Very High",
    exampleTitles: ["5 Morning Habits That Changed My Life", "Why 99% of People Fail at Goals"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "motivation",
    name: "Motivational Content",
    icon: Zap,
    description: "Inspiring quotes, success stories, and mindset shifts",
    popularity: "High",
    exampleTitles: ["The One Thing Successful People Do Differently", "Stop Making These Excuses"],
    color: "from-orange-500 to-red-500"
  },
  {
    id: "wellness",
    name: "Health & Wellness",
    icon: Heart,
    description: "Mental health, fitness, and lifestyle content",
    popularity: "High",
    exampleTitles: ["3 Simple Ways to Reduce Anxiety", "Why You're Always Tired"],
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "knowledge",
    name: "Quick Learning & Facts",
    icon: Lightbulb,
    description: "Educational content, fun facts, and tutorials",
    popularity: "Medium",
    exampleTitles: ["Things They Don't Teach You in School", "This Will Blow Your Mind"],
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "trends",
    name: "Current Events & Trends",
    icon: TrendingUp,
    description: "Commentary on trending topics and news",
    popularity: "Medium",
    exampleTitles: ["Everyone's Talking About This", "The Truth About [Trending Topic]"],
    color: "from-yellow-500 to-orange-500"
  },
];

export const ThemeSelector = () => {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [customThemes, setCustomThemes] = useState<string[]>([]);

  const handleThemeToggle = (themeId: string) => {
    setSelectedThemes(prev => 
      prev.includes(themeId) 
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleGenerateCustomThemes = () => {
    const newThemes = [
      "Relationship Advice & Dating Tips",
      "Money & Financial Freedom",
      "Career Growth & Professional Development",
      "Creative Arts & DIY Projects"
    ];
    setCustomThemes(newThemes);
    toast({
      title: "Custom Themes Generated",
      description: "AI has generated personalized themes based on your content preferences!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Content Themes</h2>
        <p className="text-gray-400">Choose themes for your AI-generated content. Select multiple themes for variety.</p>
      </div>

      <Tabs defaultValue="ai-suggested" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10">
          <TabsTrigger value="ai-suggested" className="text-white data-[state=active]:bg-blue-600">
            AI Suggested
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-white data-[state=active]:bg-blue-600">
            Custom Themes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-suggested" className="space-y-6">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                    AI-Recommended Themes
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Based on current trending topics and engagement data
                  </CardDescription>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {selectedThemes.length} Selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {aiSuggestedThemes.map((theme) => (
                  <Card 
                    key={theme.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedThemes.includes(theme.id)
                        ? "bg-gradient-to-r " + theme.color + " bg-opacity-20 border-2 border-current"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => handleThemeToggle(theme.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${theme.color} flex items-center justify-center`}>
                            <theme.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{theme.name}</h4>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {theme.popularity} Demand
                            </Badge>
                          </div>
                        </div>
                        <Checkbox 
                          checked={selectedThemes.includes(theme.id)}
                          onChange={() => {}}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{theme.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Example titles:</p>
                        {theme.exampleTitles.map((title, index) => (
                          <p key={index} className="text-xs text-gray-300">• {title}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Generate Custom Themes</CardTitle>
              <CardDescription className="text-gray-400">
                Let AI analyze your preferences and create personalized themes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGenerateCustomThemes}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Custom Themes with AI
              </Button>
              
              {customThemes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Your Custom Themes:</h4>
                  {customThemes.map((theme, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white/10"
                    >
                      <span className="text-white">{theme}</span>
                      <Checkbox 
                        checked={false}
                        onChange={() => {}}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Themes Summary */}
      {selectedThemes.length > 0 && (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Selected Themes Summary</CardTitle>
            <CardDescription className="text-gray-400">
              Your content will be generated based on these themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedThemes.map((themeId) => {
                const theme = aiSuggestedThemes.find(t => t.id === themeId);
                return theme ? (
                  <Badge 
                    key={themeId}
                    className={`bg-gradient-to-r ${theme.color} text-white border-0`}
                  >
                    {theme.name}
                  </Badge>
                ) : null;
              })}
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Continue to Content Calendar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
