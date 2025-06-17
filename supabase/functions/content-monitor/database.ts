
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ContentChannel, GenerationQueueItem } from './types.ts';

export async function fetchActiveChannels(supabase: any): Promise<{ data: ContentChannel[] | null, error: any }> {
  console.log('Fetching active channels...');
  
  const { data, error } = await supabase
    .from('content_channels')
    .select(`
      id,
      name,
      schedule,
      is_active,
      selected_topics,
      topic_mode,
      selected_video_types,
      user_id
    `)
    .eq('is_active', true);

  return { data, error };
}

export async function countContentItems(supabase: any, channelId: string): Promise<{ count: number | null, error: any }> {
  console.log(`Counting content for channel ${channelId}...`);
  
  const { count, error } = await supabase
    .from('content_items')
    .select('*', { count: 'exact', head: true })
    .eq('channel_id', channelId)
    .in('status', ['ready', 'published']);

  return { count, error };
}

export async function getContentRequirements(supabase: any, scheduleType: string): Promise<{ data: number | null, error: any }> {
  console.log(`Getting requirements for schedule: ${scheduleType}`);
  
  const { data, error } = await supabase
    .rpc('get_content_requirements', { schedule_type: scheduleType });

  return { data, error };
}

export async function checkExistingGeneration(supabase: any, channelId: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from('content_generation_queue')
    .select('*')
    .eq('channel_id', channelId)
    .in('status', ['pending', 'processing'])
    .maybeSingle();

  return { data, error };
}

export async function addToGenerationQueue(supabase: any, queueItem: Omit<GenerationQueueItem, 'id'>): Promise<{ error: any }> {
  const { error } = await supabase
    .from('content_generation_queue')
    .insert(queueItem);

  return { error };
}
