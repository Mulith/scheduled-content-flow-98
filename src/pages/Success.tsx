
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { SkadooshLogo } from "@/components/SkadooshLogo";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your payment...');
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found in URL');
      return;
    }

    // Simulate processing for now
    const timer = setTimeout(() => {
      setStatus('success');
      setMessage('Your subscription has been activated successfully!');
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  const handleContinue = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SkadooshLogo size="lg" />
          </div>
          <CardTitle className="text-white text-2xl">
            {status === 'loading' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Error'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          
          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <p className="text-gray-300">
                Your content channel is being set up. You can now start creating AI-powered videos!
              </p>
              <Button 
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Go to Dashboard
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-red-400" />
              </div>
              <p className="text-gray-300">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/app')}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Retry
                </Button>
              </div>
            </>
          )}
          
          {sessionId && (
            <p className="text-xs text-gray-500 mt-4">
              Session ID: {sessionId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
