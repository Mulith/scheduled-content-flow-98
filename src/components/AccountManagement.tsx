
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Key, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const AccountManagement = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    joinDate: "September 2025",
    plan: "Pro Plan"
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleResetPassword = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for password reset instructions.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {userInfo.firstName} {userInfo.lastName}
                </h3>
                <p className="text-gray-400 text-sm">Member since {userInfo.joinDate}</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {userInfo.plan}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">First Name</Label>
              <Input
                id="firstName"
                value={userInfo.firstName}
                onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
                disabled={!isEditing}
                className="bg-white/10 border-white/20 text-white disabled:opacity-60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">Last Name</Label>
              <Input
                id="lastName"
                value={userInfo.lastName}
                onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
                disabled={!isEditing}
                className="bg-white/10 border-white/20 text-white disabled:opacity-60"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                disabled={!isEditing}
                className="bg-white/10 border-white/20 text-white disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Password</p>
                <p className="text-gray-400 text-sm">Last updated 30 days ago</p>
              </div>
            </div>
            <Button 
              onClick={handleResetPassword}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Reset Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">Receive updates about your account</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Enabled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-black/40 border-red-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center space-x-2">
            <Trash2 className="w-5 h-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Irreversible actions that will affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-gray-400 text-sm">This action cannot be undone</p>
            </div>
            <Button 
              variant="outline" 
              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
