
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react";

export const BillingManagement = () => {
  const [currentPlan] = useState({
    name: "Pro Plan",
    price: "$45/month",
    billingCycle: "Monthly",
    nextBilling: "December 16, 2025",
    status: "Active"
  });

  const [billingHistory] = useState([
    {
      id: 1,
      date: "Nov 16, 2025",
      amount: "$45.00",
      status: "Paid",
      description: "Pro Plan - Monthly",
      invoice: "INV-001"
    },
    {
      id: 2,
      date: "Oct 16, 2025",
      amount: "$45.00",
      status: "Paid",
      description: "Pro Plan - Monthly",
      invoice: "INV-002"
    },
    {
      id: 3,
      date: "Sep 16, 2025",
      amount: "$45.00",
      status: "Paid",
      description: "Pro Plan - Monthly",
      invoice: "INV-003"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Current Plan</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-white">{currentPlan.name}</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {currentPlan.status}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm">Billed {currentPlan.billingCycle}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{currentPlan.price}</p>
              <p className="text-xs text-gray-400">Next billing: {currentPlan.nextBilling}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Change Plan
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Update Payment Method
            </Button>
            <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
              Cancel Subscription
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
          <div className="space-y-3">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
