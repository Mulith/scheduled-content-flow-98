
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, AlertCircle } from "lucide-react";
import { ContentItem, StoryboardItem } from "./types";

interface StoryboardProps {
  contentItem: ContentItem;
  storyboard: StoryboardItem[];
}

export const Storyboard = ({ contentItem, storyboard }: StoryboardProps) => {
  console.log('🎨 Storyboard rendering with data:', {
    contentItemId: contentItem.id,
    storyboardItems: storyboard.length,
    items: storyboard.map(item => ({
      scene: item.scene,
      status: item.videoStatus,
      hasUrl: !!item.videoUrl,
      videoUrl: item.videoUrl, // Log the actual URL
      urlType: typeof item.videoUrl,
      urlLength: item.videoUrl?.length,
      error: item.errorMessage
    }))
  });

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Visual Storyboard</CardTitle>
        <CardDescription className="text-gray-400">
          AI-generated visual descriptions and video content
        </CardDescription>
        {contentItem.video_status && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Overall Status:</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                contentItem.video_status === 'completed' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : contentItem.video_status === 'in_progress'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : contentItem.video_status === 'failed'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {contentItem.video_status.replace('_', ' ')}
            </Badge>
          </div>
        )}
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
                      onError={(e) => {
                        console.error('❌ Video load error for scene', board.scene, '- URL:', board.videoUrl, 'Error:', e);
                        console.error('❌ Video element error details:', {
                          src: e.currentTarget.src,
                          networkState: e.currentTarget.networkState,
                          readyState: e.currentTarget.readyState,
                          error: e.currentTarget.error
                        });
                      }}
                      onLoadStart={() => {
                        console.log('▶️ Video loading started for scene', board.scene, '- URL:', board.videoUrl);
                      }}
                      onLoadedData={() => {
                        console.log('✅ Video loaded successfully for scene', board.scene);
                      }}
                      onCanPlay={() => {
                        console.log('🎯 Video can start playing for scene', board.scene);
                      }}
                    />
                  ) : board.videoStatus === 'generating' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Video className="w-6 h-6 text-blue-400 animate-pulse" />
                      <span className="text-xs text-blue-400">Generating...</span>
                      <Clock className="w-4 h-4 text-blue-300 animate-spin" />
                    </div>
                  ) : board.videoStatus === 'failed' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                      <span className="text-xs text-red-400">Failed</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Video className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-400 text-sm text-center">Scene {board.scene}</span>
                      <span className="text-gray-500 text-xs">Not started</span>
                    </div>
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
                
                <p className="text-white text-xs line-clamp-2 mb-2">{board.description}</p>
                
                {board.errorMessage && (
                  <p className="text-red-400 text-xs mt-1 line-clamp-2 bg-red-500/10 p-1 rounded" title={board.errorMessage}>
                    Error: {board.errorMessage}
                  </p>
                )}

                {board.videoUrl && (
                  <div className="mt-1">
                    <p className="text-green-400 text-xs truncate" title={board.videoUrl}>
                      ✓ Video URL: {board.videoUrl.length > 30 ? board.videoUrl.substring(0, 30) + '...' : board.videoUrl}
                    </p>
                    <p className="text-blue-400 text-xs">
                      Status: {board.videoStatus} | Length: {board.videoUrl.length} chars
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
