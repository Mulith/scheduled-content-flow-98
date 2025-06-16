
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [processing, setProcessing] = useState(true);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          toast({
            title: "Connection Failed",
            description: `OAuth error: ${error}`,
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (code && state && session?.access_token) {
          // Call the callback edge function
          const response = await supabase.functions.invoke('youtube-callback', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            }
          });

          if (response.error) {
            console.error('Callback error:', response.error);
            toast({
              title: "Connection Failed",
              description: "Failed to complete YouTube connection",
              variant: "destructive",
            });
          } else if (response.data?.success) {
            toast({
              title: "Success!",
              description: `YouTube channel "${response.data.channel.name}" connected successfully!`,
            });
          }
        } else {
          toast({
            title: "Invalid Request",
            description: "Missing required parameters for OAuth callback",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        toast({
          title: "Connection Error",
          description: "An unexpected error occurred during connection",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleCallback();
  }, [navigate, session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">
          {processing ? 'Connecting your YouTube channel...' : 'Connection complete!'}
        </h2>
        <p className="text-gray-400">
          {processing ? 'Please wait while we set up your account.' : 'Redirecting you back to the dashboard.'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
