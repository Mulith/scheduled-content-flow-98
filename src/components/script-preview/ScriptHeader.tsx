
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Edit, Download, Clock, Eye, Video } from "lucide-react";
import { ContentStatusProgress } from "@/components/ContentStatusProgress";
import { ContentItem, Scene, StoryboardItem } from "./types";
import { formatDuration } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ScriptHeaderProps {
  contentItem: ContentItem;
  scenes: Scene[];
  onGenerateContent: () => void;
  isGenerating: boolean;
  onCreateVideoShort?: () => void;
  isCreatingVideoShort?: boolean;
  storyboard?: StoryboardItem[];
}

export const ScriptHeader = ({ 
  contentItem, 
  scenes, 
  onGenerateContent, 
  isGenerating, 
  onCreateVideoShort, 
  isCreatingVideoShort, 
  storyboard 
}: ScriptHeaderProps) => {
  // Check if all scenes have generated images
  const allScenesGenerated = storyboard?.every(item => 
    item.videoStatus === 'completed' && item.videoUrl
  ) || false;

  // Check if video short has been created
  const hasGeneratedVideo = contentItem.video_status === 'completed';
  const hasVideoFile = hasGeneratedVideo && contentItem.video_file_path;

  const handleDownloadVideo = async () => {
    if (!contentItem.video_file_path) {
      toast({
        title: "Download Error",
        description: "Video file path not found",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔽 Starting video download...');
      console.log('📁 Video file path:', contentItem.video_file_path);

      // Get the signed URL for download
      const { data, error } = await supabase.storage
        .from('generated-videos')
        .download(contentItem.video_file_path);

      if (error) {
        console.error('❌ Download error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from storage');
      }

      console.log('✅ Video data downloaded, size:', data.size);

      // Create blob and download link
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contentItem.title.replace(/[^a-zA-Z0-9]/g, '_')}_video.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(url);

      console.log('🎉 Video download initiated');
      
      toast({
        title: "Download Started! 📥",
        description: "Your video is being downloaded to your device.",
      });

    } catch (error) {
      console.error('💥 Video download failed:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download video",
        variant: "destructive",
      });
    }
  };

  const handleUploadToYouTube = () => {
    toast({
      title: "Coming Soon! 🚀",
      description: "YouTube upload functionality will be available in a future update.",
    });
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white text-xl">{contentItem.title}</CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    {contentItem.theme}
                  </Badge>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(contentItem.duration)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {scenes.length} scenes
                  </span>
                </div>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Edit className="w-4 h-4 mr-2" />
                Edit Script
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={onGenerateContent}
                disabled={isGenerating}
              >
                <Play className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Content"}
              </Button>
              {onCreateVideoShort && allScenesGenerated && (
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={onCreateVideoShort}
                  disabled={isCreatingVideoShort}
                >
                  <Video className="w-4 h-4 mr-2" />
                  {isCreatingVideoShort ? "Creating Video..." : "Create YouTube Short"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Status Progress */}
        {contentItem.generation_stage && (
          <CardContent>
            <ContentStatusProgress
              generationStage={contentItem.generation_stage}
              scriptStatus={contentItem.script_status || 'not_started'}
              videoStatus={contentItem.video_status || 'not_started'}
              musicStatus={contentItem.music_status || 'not_started'}
              postStatus={contentItem.post_status || 'not_started'}
            />
          </CardContent>
        )}
      </Card>

      {/* Generated YouTube Short Video Display */}
      {hasGeneratedVideo && (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Video className="w-5 h-5 mr-2 text-purple-400" />
              Generated YouTube Short
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your AI-generated video is ready for download and YouTube upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Video Ready
                </Badge>
                <span className="text-gray-300 text-sm">
                  Duration: ~{Math.ceil((contentItem.duration_seconds || 60) / 60)} min
                </span>
                {hasVideoFile && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    File Stored
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 mt-2 text-sm">
                {hasVideoFile 
                  ? "Video file is stored and ready for download. The final video combines your script narration with generated visuals."
                  : "Video generation completed but file is not yet available for download."
                }
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleDownloadVideo}
                  disabled={!hasVideoFile}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {hasVideoFile ? "Download Video" : "Video Not Available"}
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleUploadToYouTube}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Upload to YouTube
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
