
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Zap, Clock, CheckCircle, Star, LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleHeaderButtonClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Login Button */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold text-xl">AutoContent Pro</div>
          <Button
            onClick={handleHeaderButtonClick}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {user ? (
              <>
                <User className="w-4 h-4 mr-2" />
                Go to Dashboard
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
            ✨ AI-Powered Content Automation
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            AutoContent Pro
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Create, schedule, and manage engaging content across all your social media platforms with AI-powered automation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Scale Your Content
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From AI content generation to advanced scheduling, we've got your social media strategy covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">AI Content Generation</CardTitle>
              <CardDescription className="text-gray-400">
                Generate engaging posts, captions, and scripts tailored to your brand voice
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Smart Scheduling</CardTitle>
              <CardDescription className="text-gray-400">
                Automatically schedule content at optimal times for maximum engagement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Multi-Platform</CardTitle>
              <CardDescription className="text-gray-400">
                Manage YouTube, TikTok, Instagram, and more from one dashboard
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Time Saving</CardTitle>
              <CardDescription className="text-gray-400">
                Save 10+ hours per week with automated content workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Quality Control</CardTitle>
              <CardDescription className="text-gray-400">
                Review and approve all content before it goes live
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Analytics & Insights</CardTitle>
              <CardDescription className="text-gray-400">
                Track performance and optimize your content strategy
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 text-lg">
            Pay per channel, scale as you grow
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <p className="text-white font-medium">2x Daily</p>
              <p className="text-2xl font-bold text-purple-400">$45</p>
              <p className="text-gray-400 text-sm">per month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <p className="text-white font-medium">Daily</p>
              <p className="text-2xl font-bold text-blue-400">$30</p>
              <p className="text-gray-400 text-sm">per month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <p className="text-white font-medium">Weekly</p>
              <p className="text-2xl font-bold text-green-400">$20</p>
              <p className="text-gray-400 text-sm">per month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <p className="text-white font-medium">Monthly</p>
              <p className="text-2xl font-bold text-yellow-400">$15</p>
              <p className="text-gray-400 text-sm">per month</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-12 text-center border border-purple-500/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators and businesses who've automated their social media success
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};
