
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import { ContentItem, StoryboardItem } from "./types";

interface StoryboardProps {
  contentItem: ContentItem;
  storyboard: StoryboardItem[];
}

export const Storyboard = ({ contentItem, storyboard }: StoryboardProps) => {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Visual Storyboard</CardTitle>
        <CardDescription className="text-gray-400">
          AI-generated visual descriptions and video content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {storyboard.map((board, index) => (
            <Card key={index} className="bg-white/5 border border-white/10">
              <CardContent className="p-3">
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {board.videoUrl && board.videoStatus === 'completed' ? (
                    <video 
                      src={board.videoUrl} 
                      className="w-full h-full object-cover rounded-lg"
                      controls
                      muted
                      preload="metadata"
                    />
                  ) : board.videoStatus === 'generating' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Video className="w-6 h-6 text-blue-400 animate-pulse" />
                      <span className="text-xs text-blue-400">Generating...</span>
                    </div>
                  ) : board.videoStatus === 'failed' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Video className="w-6 h-6 text-red-400" />
                      <span className="text-xs text-red-400">Failed</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Scene {board.scene}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white">Scene {board.scene}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      board.videoStatus === 'completed' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : board.videoStatus === 'generating'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : board.videoStatus === 'failed'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {board.videoStatus.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-white text-xs line-clamp-2">{board.description}</p>
                
                {board.errorMessage && (
                  <p className="text-red-400 text-xs mt-1 line-clamp-1" title={board.errorMessage}>
                    Error: {board.errorMessage}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
