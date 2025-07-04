
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Edit, Download, Clock, Eye, Video } from "lucide-react";
import { ContentStatusProgress } from "@/components/ContentStatusProgress";
import { ContentItem, Scene, StoryboardItem } from "./types";
import { formatDuration } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Check if all scenes have generated images
  const allScenesGenerated = storyboard?.every(item => 
    item.videoStatus === 'completed' && item.videoUrl
  ) || false;

  // Check if video short has been created
  const hasGeneratedVideo = contentItem.video_status === 'completed';
  const hasVideoFile = hasGeneratedVideo && contentItem.video_file_path;

  // Get video URL when component mounts or video file path changes
  useEffect(() => {
    const getVideoUrl = async () => {
      if (!hasVideoFile || !contentItem.video_file_path) return;
      
      setIsLoadingVideo(true);
      try {
        console.log('🎥 Getting video URL for preview:', contentItem.video_file_path);
        
        const { data } = supabase.storage
          .from('generated-videos')
          .getPublicUrl(contentItem.video_file_path);
        
        if (data?.publicUrl) {
          console.log('✅ Video URL obtained:', data.publicUrl);
          setVideoUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('❌ Error getting video URL:', error);
      } finally {
        setIsLoadingVideo(false);
      }
    };

    getVideoUrl();
  }, [hasVideoFile, contentItem.video_file_path]);

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
              Your AI-generated video is ready for preview and YouTube upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
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
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={handleDownloadVideo}
                      disabled={!hasVideoFile}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleUploadToYouTube}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Upload to YouTube
                    </Button>
                  </div>
                </div>

                {/* Video Preview */}
                {hasVideoFile && (
                  <div className="mt-4">
                    {isLoadingVideo ? (
                      <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Video className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                          <p>Loading video preview...</p>
                        </div>
                      </div>
                    ) : videoUrl ? (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-full object-contain"
                          poster="/placeholder.svg"
                        >
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Video className="w-8 h-8 mx-auto mb-2" />
                          <p>Video preview not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-gray-400 mt-4 text-sm text-center">
                  {hasVideoFile 
                    ? "Your generated video combines AI narration with dynamic visuals, ready for YouTube Shorts!"
                    : "Video generation completed but file is not yet available for preview."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
