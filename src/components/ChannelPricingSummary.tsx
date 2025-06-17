
import { DollarSign } from "lucide-react";

interface ChannelPricingSummaryProps {
  selectedSchedule: string;
  getSelectedSchedulePrice: () => string;
}

export const ChannelPricingSummary = ({ 
  selectedSchedule, 
  getSelectedSchedulePrice 
}: ChannelPricingSummaryProps) => {
  if (!selectedSchedule) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Subscription Summary</h4>
          <p className="text-gray-400 text-sm">This channel will be added to your billing</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-400">{getSelectedSchedulePrice()}</p>
          <p className="text-xs text-gray-400">per month</p>
        </div>
      </div>
    </div>
  );
};
