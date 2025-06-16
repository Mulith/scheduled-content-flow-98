
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar, DollarSign, Youtube, Music, Settings } from "lucide-react";

interface ContentChannel {
  id: string;
  name: string;
  socialAccount: {
    platform: "youtube" | "tiktok";
    accountName: string;
    connected: boolean;
  };
  schedule: string;
  status: "active" | "paused" | "setup";
}

export const BillingManagement = () => {
  const [channels] = useState<ContentChannel[]>([
    {
      id: "1",
      name: "Productivity Tips",
      socialAccount: {
        platform: "youtube",
        accountName: "ProductivityMaster",
        connected: true
      },
      schedule: "daily",
      status: "active"
    },
    {
      id: "2",
      name: "Motivational Moments",
      socialAccount: {
        platform: "tiktok",
        accountName: "@motivationhub",
        connected: true
      },
      schedule: "twice-daily",
      status: "active"
    }
  ]);

  const [billingHistory] = useState([
    {
      id: 1,
      date: "Nov 16, 2025",
      amount: "$75.00",
      status: "Paid",
      description: "Monthly Billing - All Channels",
      invoice: "INV-001",
      breakdown: [
        { channel: "Productivity Tips", schedule: "Daily", amount: "$30.00" },
        { channel: "Motivational Moments", schedule: "Twice Daily", amount: "$45.00" }
      ]
    },
    {
      id: 2,
      date: "Oct 16, 2025",
      amount: "$75.00",
      status: "Paid",
      description: "Monthly Billing - All Channels",
      invoice: "INV-002",
      breakdown: [
        { channel: "Productivity Tips", schedule: "Daily", amount: "$30.00" },
        { channel: "Motivational Moments", schedule: "Twice Daily", amount: "$45.00" }
      ]
    }
  ]);

  const getSchedulePrice = (schedule: string) => {
    switch (schedule) {
      case "twice-daily": return "$45";
      case "daily": return "$30";
      case "weekly": return "$20";
      case "monthly": return "$15";
      default: return "$0";
    }
  };

  const getScheduleLabel = (schedule: string) => {
    switch (schedule) {
      case "twice-daily": return "2x Daily";
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      default: return "Unknown";
    }
  };

  const totalMonthlyBilling = channels
    .filter(channel => channel.status === "active")
    .reduce((total, channel) => {
      const price = parseInt(getSchedulePrice(channel.schedule).replace("$", ""));
      return total + price;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Current Channels & Billing */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Active Channel Subscriptions</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Per-channel billing based on posting frequency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Monthly Billing */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Total Monthly Billing</h3>
              <p className="text-gray-400 text-sm">{channels.filter(c => c.status === "active").length} active channels</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${totalMonthlyBilling}/month</p>
              <p className="text-xs text-gray-400">Next billing: December 16, 2025</p>
            </div>
          </div>

          {/* Individual Channel Billing */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Channel Breakdown</h4>
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {channel.socialAccount.platform === "youtube" ? (
                      <Youtube className="w-5 h-5 text-white" />
                    ) : (
                      <Music className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{channel.name}</p>
                    <p className="text-gray-400 text-sm">{channel.socialAccount.accountName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Schedule</p>
                    <p className="text-white font-medium">{getScheduleLabel(channel.schedule)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Monthly Cost</p>
                    <p className="text-white font-bold">{getSchedulePrice(channel.schedule)}</p>
                  </div>
                  <Badge className={
                    channel.status === "active" 
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }>
                    {channel.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4 border-t border-white/10">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Manage Channels
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Update Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Billing History</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{bill.description}</p>
                      <p className="text-gray-400 text-sm">{bill.date} • {bill.invoice}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-white font-medium">{bill.amount}</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        {bill.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Billing Breakdown */}
                <div className="ml-14 space-y-2">
                  <p className="text-gray-400 text-sm">Channel Breakdown:</p>
                  {bill.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{item.channel} - {item.schedule}</span>
                      <span className="text-white">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Pricing Plans</CardTitle>
          <CardDescription className="text-gray-400">
            Per-channel pricing based on posting frequency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { schedule: "twice-daily", label: "2x Daily", price: "$45" },
              { schedule: "daily", label: "Daily", price: "$30" },
              { schedule: "weekly", label: "Weekly", price: "$20" },
              { schedule: "monthly", label: "Monthly", price: "$15" }
            ].map((plan) => (
              <div key={plan.schedule} className="p-4 bg-white/5 rounded-lg text-center">
                <p className="text-white font-medium">{plan.label}</p>
                <p className="text-2xl font-bold text-blue-400">{plan.price}</p>
                <p className="text-gray-400 text-sm">per month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
