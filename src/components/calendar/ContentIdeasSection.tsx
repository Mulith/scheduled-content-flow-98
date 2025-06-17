import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw, Trash2, Play } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ContentStatusProgress } from "@/components/ContentStatusProgress";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";

interface ContentItem {
  id: string;
  title: string;
  theme: string;
  scheduledFor: string;
  status: string;
  engagement: string;
  channel: string;
  script: string;
  duration?: number;
  // New status fields
  generation_stage?: string;
  script_status?: string;
  video_status?: string;
  music_status?: string;
  post_status?: string;
}

interface ContentIdeasProps {
  contentItems: ContentItem[];
  isLoading: boolean;
  onIdeaClick: (ideaId: string) => void;
  onRefetch: () => void;
}

export const ContentIdeasSection = ({ contentItems, isLoading, onIdeaClick, onRefetch }: ContentIdeasProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { generateVideos, isGenerating } = useVideoGeneration();

  const deleteContentItem = useMutation({
    mutationFn: async (contentId: string) => {
      console.log('🗑️ Deleting content item:', contentId);
      
      // First delete scenes
      const { error: scenesError } = await supabase
        .from('content_scenes')
        .delete()
        .eq('content_item_id', contentId);

      if (scenesError) {
        console.error('Error deleting scenes:', scenesError);
        throw new Error(`Failed to delete scenes: ${scenesError.message}`);
      }

      // Then delete the content item
      const { error: contentError } = await supabase
        .from('content_items')
        .delete()
        .eq('id', contentId);

      if (contentError) {
        console.error('Error deleting content item:', contentError);
        throw new Error(`Failed to delete content item: ${contentError.message}`);
      }

      console.log('✅ Content item deleted successfully');
      return contentId;
    },
    onSuccess: () => {
      toast({
        title: "Content Deleted",
        description: "Content item has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      onRefetch();
      setDeletingId(null);
    },
    onError: (error: Error) => {
      console.error('💥 Error deleting content:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete content item",
        variant: "destructive",
      });
      setDeletingId(null);
    },
  });

  const handleDelete = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    setDeletingId(contentId);
    deleteContentItem.mutate(contentId);
  };

  const handleGenerateVideos = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    generateVideos.mutate(contentId);
  };

  const canGenerateVideos = (item: ContentItem) => {
    return item.script_status === 'completed' && 
           item.video_status !== 'completed' && 
           item.video_status !== 'in_progress';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Content Ideas</h3>
          <p className="text-gray-400 text-sm">AI-generated content ready for production</p>
        </div>
        <Button 
          onClick={onRefetch}
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/5 border border-white/10 animate-pulse">
              <CardHeader>
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : contentItems.length === 0 ? (
        <Card className="bg-white/5 border border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wand2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Content Yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Your AI content generator will create engaging videos based on your channel settings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentItems.map((item) => (
            <Card 
              key={item.id} 
              className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={() => onIdeaClick(item.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {item.scheduledFor}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    {canGenerateVideos(item) && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
                        onClick={(e) => handleGenerateVideos(e, item.id)}
                        disabled={isGenerating}
                        title="Generate Videos"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deletingId === item.id}
                      title="Delete Content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Show progress if we have status information */}
                {item.generation_stage && (
                  <div className="mb-4">
                    <ContentStatusProgress
                      generationStage={item.generation_stage}
                      scriptStatus={item.script_status || 'not_started'}
                      videoStatus={item.video_status || 'not_started'}
                      musicStatus={item.music_status || 'not_started'}
                      postStatus={item.post_status || 'not_started'}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`border-${
                        item.status === 'ready' ? 'green' : 
                        item.status === 'processing' ? 'yellow' : 'gray'
                      }-500/30 text-${
                        item.status === 'ready' ? 'green' : 
                        item.status === 'processing' ? 'yellow' : 'gray'
                      }-400`}
                    >
                      {item.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                      {item.engagement} engagement
                    </Badge>
                  </div>
                  {item.duration && (
                    <span className="text-xs text-gray-400">
                      {item.duration}s
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                  {item.script.substring(0, 100)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
