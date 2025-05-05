import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LinkedInCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        console.log('Processing LinkedIn OAuth callback');
        console.log('URL search params:', location.search);
        
        // Extract the authorization code from the URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (error) {
          throw new Error(`${error}: ${errorDescription || 'Unknown error'}`);
        }
        
        if (!code || !state) {
          throw new Error('Missing required parameters');
        }
        
        // Forward the authorization code to our backend for token exchange
        const response = await fetch(`/auth/linkedin/callback?code=${code}&state=${state}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText}`);
        }
        
        // Note: The backend will redirect to /social-credentials with the tokens
        // This should not be reached in normal flow, but in case the backend
        // doesn't redirect, we'll do it here
        setTimeout(() => {
          navigate('/social-credentials');
        }, 3000);
        
      } catch (error) {
        console.error('Error processing LinkedIn callback:', error);
        setError(error instanceof Error ? error.message : 'Failed to authenticate with LinkedIn');
        toast.error('LinkedIn authentication failed');
        setTimeout(() => {
          navigate('/social-credentials');
        }, 3000);
      }
    };

    handleLinkedInCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">LinkedIn Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting you back to social credentials page...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-700" />
          <h2 className="text-2xl font-bold mb-2">Connecting to LinkedIn</h2>
          <p className="text-gray-600">Please wait while we complete the LinkedIn authentication...</p>
        </div>
      )}
    </div>
  );
};

export default LinkedInCallback; 