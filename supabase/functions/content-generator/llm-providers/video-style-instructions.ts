
export function getVideoStyleInstructions(videoTypes: string[]): string {
  const styleInstructions = {
    'story': `Story Format - Create narrative-driven content with a clear beginning, middle, and end. Tell a compelling story with characters, conflict, and resolution. Use storytelling techniques like hooks, tension, and emotional payoffs. Examples: personal transformation stories, case studies, customer success stories, behind-the-scenes narratives.`,
    
    'top5': `Top 5 Lists - Create countdown and ranking format content. Structure as "Top 5 [Topic]", "5 Best [Things]", or "5 Worst [Mistakes]". Start with #5 and build to #1 for maximum engagement. Each point should be distinct and valuable. Use clear transitions between items.`,
    
    'bestof': `Best of All Time - Create ultimate guides and definitive lists. Position content as the "ultimate", "definitive", or "complete" guide to a topic. Present authoritative information as if it's the final word on the subject. Use superlatives and definitive language.`,
    
    'howto': `How-To Tutorial - Create step-by-step instructional content. Break down complex processes into simple, actionable steps. Use clear, direct language. Number your steps clearly (Step 1, Step 2, etc.). Focus on practical, implementable advice.`,
    
    'reaction': `Reaction & Commentary - Create response and opinion-based content. React to trends, news, or common situations. Share personal opinions and insights. Use phrases like "Here's what I think...", "My take on this is...", "What people don't realize is...". Be conversational and authentic.`,
    
    'quicktips': `Quick Tips - Create short, actionable advice format. Present rapid-fire tips and hacks. Use bullet-point style delivery. Focus on immediate value and quick wins. Start with "Quick tip:", "Pro tip:", or "Here's a hack:". Keep each tip concise and actionable.`
  };

  return videoTypes.map(type => styleInstructions[type] || `${type} format content`).join(' Combined with: ');
}
