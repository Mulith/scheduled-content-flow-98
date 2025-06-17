
import { AlertCircle } from "lucide-react";

interface ChannelSubscriptionNoticeProps {
  selectedSchedule: string;
  getSelectedSchedulePrice: () => string;
}

export const ChannelSubscriptionNotice = ({ 
  selectedSchedule, 
  getSelectedSchedulePrice 
}: ChannelSubscriptionNoticeProps) => {
  return (
    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
        <div>
          <h4 className="text-blue-400 font-medium">Subscription Impact</h4>
          <p className="text-gray-300 text-sm">
            Creating a new channel will add to your monthly subscription. Each channel is billed separately based on its posting frequency.
          </p>
          {selectedSchedule && (
            <div className="mt-2 p-2 bg-blue-500/20 rounded border border-blue-500/30">
              <p className="text-white font-medium">Selected Plan: {getSelectedSchedulePrice()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
