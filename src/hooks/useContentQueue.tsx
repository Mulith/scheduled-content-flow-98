
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
      const response = await fetch('/api/content-monitor', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to trigger monitoring');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Monitoring Triggered",
        description: "Content monitoring has been manually triggered",
      });
      queryClient.invalidateQueries({ queryKey: ['content-generation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['content-monitoring-queue'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manually trigger content generation
  const triggerGeneration = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/content-generator', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to trigger generation');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Generation Triggered",
        description: "Content generation has been manually triggered",
      });
      queryClient.invalidateQueries({ queryKey: ['content-generation-queue'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
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
