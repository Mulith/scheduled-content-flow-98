
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useContentQueue = () => {
  const queryClient = useQueryClient();

  // Get generation queue status
  const { data: generationQueue, isLoading: isLoadingQueue } = useQuery({
    queryKey: ['content-generation-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_generation_queue')
        .select(`
          *,
          content_channels(name, schedule)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get monitoring queue status
  const { data: monitoringQueue, isLoading: isLoadingMonitoring } = useQuery({
    queryKey: ['content-monitoring-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_monitoring_queue')
        .select(`
          *,
          content_channels(name, schedule, is_active)
        `)
        .order('next_check_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Manually trigger content monitoring
  const triggerMonitoring = useMutation({
    mutationFn: async () => {
      console.log('Triggering content monitoring...');
      const { data, error } = await supabase.functions.invoke('content-monitor', {
        body: {}
      });
      
      if (error) {
        console.error('Content monitor error:', error);
        throw error;
      }
      
      console.log('Content monitor response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Content monitoring triggered successfully:', data);
      toast({
        title: "Monitoring Triggered",
        description: `Content monitoring completed. Checked ${data?.channelsChecked || 0} channels.`,
      });
      queryClient.invalidateQueries({ queryKey: ['content-generation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['content-monitoring-queue'] });
    },
    onError: (error: Error) => {
      console.error('Error triggering monitoring:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger monitoring",
        variant: "destructive",
      });
    },
  });

  // Manually trigger content generation
  const triggerGeneration = useMutation({
    mutationFn: async () => {
      console.log('Triggering content generation...');
      const { data, error } = await supabase.functions.invoke('content-generator', {
        body: {}
      });
      
      if (error) {
        console.error('Content generator error:', error);
        throw error;
      }
      
      console.log('Content generator response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Content generation triggered successfully:', data);
      toast({
        title: "Generation Triggered",
        description: `Content generation completed. Processed ${data?.processed || 0} requests.`,
      });
      queryClient.invalidateQueries({ queryKey: ['content-generation-queue'] });
    },
    onError: (error: Error) => {
      console.error('Error triggering generation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger generation",
        variant: "destructive",
      });
    },
  });

  return {
    generationQueue,
    monitoringQueue,
    isLoadingQueue,
    isLoadingMonitoring,
    triggerMonitoring,
    triggerGeneration,
  };
};
