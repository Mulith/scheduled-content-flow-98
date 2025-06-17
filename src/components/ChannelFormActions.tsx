
import { Button } from "@/components/ui/button";

interface ChannelFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isCreating: boolean;
  selectedSchedule: string;
  getSelectedSchedulePrice: () => string;
}

export const ChannelFormActions = ({
  onCancel,
  onSubmit,
  isCreating,
  selectedSchedule,
  getSelectedSchedulePrice
}: ChannelFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 mt-6">
      <Button variant="outline" onClick={onCancel} className="border-white/20 text-white hover:bg-white/10">
        Cancel
      </Button>
      <Button 
        onClick={onSubmit} 
        disabled={isCreating}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isCreating ? "Creating..." : selectedSchedule ? `Create Channel (${getSelectedSchedulePrice()})` : "Create Channel"}
      </Button>
    </div>
  );
};
