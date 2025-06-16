
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, Plus, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AccountManagement } from "./AccountManagement";
import { BillingManagement } from "./BillingManagement";

export const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">AutoContent Pro</h1>
              <p className="text-gray-400">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Channel
              </Button>
              <Button 
                variant="ghost" 
                onClick={signOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border-white/10">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="channels" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">Channels</TabsTrigger>
            <TabsTrigger value="billing" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">Billing</TabsTrigger>
            <TabsTrigger value="account" className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Active Channels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">2</p>
                  <p className="text-gray-400 text-sm">YouTube, TikTok</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Posts This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">47</p>
                  <p className="text-gray-400 text-sm">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Monthly Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">$75</p>
                  <p className="text-gray-400 text-sm">Next billing: Dec 16</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest posts and channel updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Productivity Tips - Daily Post</p>
                      <p className="text-gray-400 text-sm">Posted to YouTube • 2 hours ago</p>
                    </div>
                    <div className="text-green-400 text-sm">✓ Published</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Motivational Moments - Morning Post</p>
                      <p className="text-gray-400 text-sm">Posted to TikTok • 4 hours ago</p>
                    </div>
                    <div className="text-green-400 text-sm">✓ Published</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Content Channels</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your social media channels and content scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Channel management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <BillingManagement />
          </TabsContent>

          <TabsContent value="account">
            <AccountManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
