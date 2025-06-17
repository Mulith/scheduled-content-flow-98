
import { ContentChannel } from './types.ts';
import { 
  countContentItems, 
  getContentRequirements, 
  checkExistingGeneration, 
  addToGenerationQueue 
} from './database.ts';

export async function processChannel(supabase: any, channel: ContentChannel): Promise<boolean> {
  console.log(`Processing channel: ${channel.name} (ID: ${channel.id})`);
  
  // Count existing content items
  const { count: contentCount, error: countError } = await countContentItems(supabase, channel.id);

  if (countError) {
    console.error(`Error counting content for channel ${channel.id}:`, countError);
    return false;
  }

  console.log(`Channel ${channel.name} currently has ${contentCount || 0} content items`);

  // Get content requirements based on schedule
  const { data: requirementData, error: reqError } = await getContentRequirements(supabase, channel.schedule);

  if (reqError) {
    console.error(`Error getting requirements for channel ${channel.id}:`, reqError);
    return false;
  }

  const requiredCount = requirementData;
  const currentCount = contentCount || 0;
  
  console.log(`Channel ${channel.name}: has ${currentCount} content items, needs ${requiredCount} (schedule: ${channel.schedule})`);

  // If we need more content, add to generation queue
  if (currentCount < requiredCount) {
    const itemsToGenerate = requiredCount - currentCount;
    console.log(`Channel ${channel.name} needs ${itemsToGenerate} more content items`);

    // Check if there's already a pending or processing generation request
    const { data: existingGeneration, error: existingError } = await checkExistingGeneration(supabase, channel.id);

    if (existingError) {
      console.error(`Error checking existing generation queue for channel ${channel.id}:`, existingError);
      return false;
    }

    if (!existingGeneration) {
      console.log(`Adding ${itemsToGenerate} items to generation queue for channel ${channel.name}`);
      
      const queueItem = {
        channel_id: channel.id,
        items_to_generate: itemsToGenerate,
        priority: channel.schedule === 'twice-daily' ? 3 : 
                 channel.schedule === 'daily' ? 2 : 1,
        status: 'pending'
      };

      const { error: insertError } = await addToGenerationQueue(supabase, queueItem);

      if (insertError) {
        console.error(`Error adding to generation queue for channel ${channel.id}:`, insertError);
        return false;
      } else {
        console.log(`✅ Successfully added ${itemsToGenerate} items to generation queue for channel ${channel.name}`);
      }
    } else {
      console.log(`Channel ${channel.name} already has a ${existingGeneration.status} generation request for ${existingGeneration.items_to_generate} items`);
    }
  } else {
    console.log(`✅ Channel ${channel.name} has sufficient content (${currentCount}/${requiredCount})`);
  }

  return true;
}
