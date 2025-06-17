
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Play } from "lucide-react";

interface ContentStatusProgressProps {
  generationStage: string;
  scriptStatus: string;
  videoStatus: string;
  musicStatus: string;
  postStatus: string;
}

export const ContentStatusProgress = ({ 
  generationStage, 
  scriptStatus, 
  videoStatus, 
  musicStatus, 
  postStatus 
}: ContentStatusProgressProps) => {
  
  const stages = [
    { key: 'script_generation', label: 'Script & Scenes', status: scriptStatus },
    { key: 'video_creation', label: 'Video Content', status: videoStatus },
    { key: 'music_creation', label: 'Music', status: musicStatus },
    { key: 'post_generation', label: 'Final Post', status: postStatus },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.key === generationStage);
  };

  const getOverallProgress = () => {
    const completedStages = stages.filter(stage => stage.status === 'completed').length;
    return (completedStages / stages.length) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Content Generation Progress</span>
        <span className="text-sm text-gray-300">{Math.round(getOverallProgress())}%</span>
      </div>
      
      <Progress value={getOverallProgress()} className="h-2" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((stage, index) => {
          const isActive = stage.key === generationStage;
          const isPast = index < getCurrentStageIndex();
          
          return (
            <div 
              key={stage.key} 
              className={`p-3 rounded-lg border ${
                isActive 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : isPast 
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-gray-600/30 bg-gray-600/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">
                  {stage.label}
                </span>
                {getStatusIcon(stage.status)}
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(stage.status)}`}
              >
                {stage.status.replace('_', ' ')}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};
