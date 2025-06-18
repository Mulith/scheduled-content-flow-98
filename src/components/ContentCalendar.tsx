
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Trash2, Wand2 } from "lucide-react";
import { ScriptPreview } from "@/components/ScriptPreview";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useContentItemWithScenes } from "@/hooks/useContentItemWithScenes";

export const ContentCalendar = () => {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch content items
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['content-items'],
    queryFn: async () => {
      console.log('Fetching content items...');
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content items:', error);
        throw error;
      }

      console.log('Fetched content items:', data);
      return data;
    },
  });

  // Fetch selected content item with scenes
  const { data: selectedContentItem } = useContentItemWithScenes(selectedContentId);

  // Delete content item mutation
  const deleteContentItem = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting content item:', id);
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Content item deleted successfully');
    },
    onSuccess: () => {
      toast({
        title: "Content Deleted",
        description: "Content item has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      setSelectedContentId(null);
    },
    onError: (error) => {
      console.error('Error deleting content item:', error);
      toast({
        title: "Error",
        description: "Failed to delete content item",
        variant: "destructive",
      });
    },
  });

  const handleDeleteContent = (id: string) => {
    deleteContentItem.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'published':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (selectedContentItem) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => setSelectedContentId(null)}
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
        >
          ← Back to Calendar
        </Button>
        <ScriptPreview contentItem={selectedContentItem} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Content Calendar</h2>
        <p className="text-gray-400">Manage your scheduled and published content</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading content...</p>
        </div>
      ) : !contentItems || contentItems.length === 0 ? (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Content Yet</h3>
            <p className="text-gray-400 mb-4">
              Your content calendar is empty. Create your first channel to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {contentItems.map((item) => (
            <Card key={item.id} className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{item.duration_seconds ? `${item.duration_seconds}s` : 'Duration not set'}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-300 line-clamp-3">
                  {item.script ? item.script.substring(0, 150) + '...' : 'No script available'}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setSelectedContentId(item.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleDeleteContent(item.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      disabled={deleteContentItem.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
