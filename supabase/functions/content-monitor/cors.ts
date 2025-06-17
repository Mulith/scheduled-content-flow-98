
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function handleCorsRequest(): Response {
  return new Response('ok', { headers: corsHeaders });
}

export function createErrorResponse(error: any, details: string, status: number = 500): Response {
  console.error('Content monitor error:', error);
  return new Response(JSON.stringify({ 
    error: error.message,
    details: details
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

export function createSuccessResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
