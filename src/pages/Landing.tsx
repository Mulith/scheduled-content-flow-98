import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, PlayCircle, Calendar, Settings, Upload, Palette, Mic, CheckCircle, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Landing = () => {
  const navigate = useNavigate();
  const features = [{
    icon: Video,
    title: "AI Video Generation",
    description: "Create engaging videos automatically with our advanced AI technology"
  }, {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automatically schedule and publish content across multiple platforms"
  }, {
    icon: Palette,
    title: "Custom Themes",
    description: "Choose from professionally designed themes or create your own"
  }, {
    icon: Mic,
    title: "Voice Selection",
    description: "Pick from premium AI voices or use your own voice recordings"
  }, {
    icon: Upload,
    title: "Multi-Platform",
    description: "Seamlessly publish to YouTube, TikTok, and other social platforms"
  }, {
    icon: Settings,
    title: "Channel Management",
    description: "Manage multiple content channels from a single dashboard"
  }];
  const stats = [{
    value: "10K+",
    label: "Videos Created"
  }, {
    value: "500+",
    label: "Active Creators"
  }, {
    value: "50M+",
    label: "Total Views"
  }, {
    value: "99%",
    label: "Uptime"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ContentAI Studio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/app')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Sign In
              </Button>
              <Button onClick={() => navigate('/app')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30">
            AI-Powered Content Creation
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Create Viral Content
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              With AI Automation
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your content strategy with our AI-powered platform. Generate, schedule, and publish engaging videos across multiple social media platforms automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/app')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8">
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Creating Free
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 h-12 px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>)}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Scale
          </h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools you need to create, manage, and grow your content presence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <Card key={index} className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>)}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <Card className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-white/20 backdrop-blur-sm">
          <CardContent className="p-8 md:p-16 text-center bg-violet-400">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Content?
            </h3>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using ContentAI Studio to grow their audience and automate their content workflow.
            </p>
            <Button onClick={() => navigate('/app')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8">
              Get Started Today
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">ContentAI Studio</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 ContentAI Studio. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;