
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsRequest, createErrorResponse, createSuccessResponse } from './cors.ts';
import { fetchActiveChannels } from './database.ts';
import { processChannel } from './content-logic.ts';
import { MonitoringSummary } from './types.ts';

serve(async (req) => {
  console.log('Content monitor function started');
  
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  try {
    console.log('Creating Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');

    const { data: activeChannels, error: channelsError } = await fetchActiveChannels(supabase);

    if (channelsError) {
      return createErrorResponse(channelsError, 'Failed to fetch active channels');
    }

    console.log(`Found ${activeChannels?.length || 0} active channels:`, activeChannels?.map(c => c.name));

    let channelsProcessed = 0;

    for (const channel of activeChannels || []) {
      const success = await processChannel(supabase, channel);
      if (success) {
        channelsProcessed++;
      }
    }

    const summary: MonitoringSummary = {
      success: true, 
      channelsChecked: channelsProcessed,
      totalChannelsFound: activeChannels?.length || 0,
      timestamp: new Date().toISOString()
    };

    console.log('Content monitoring completed successfully:', summary);
    return createSuccessResponse(summary);

  } catch (error) {
    return createErrorResponse(error, error.stack);
  }
});
