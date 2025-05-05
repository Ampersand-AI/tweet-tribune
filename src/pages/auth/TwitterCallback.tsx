import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TwitterCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleTwitterCallback = async () => {
      try {
        console.log('Processing Twitter OAuth callback');
        console.log('URL search params:', location.search);
        
        // Extract the code and state from the URL
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
        
        // Forward these to our backend for token exchange
        const response = await fetch(`http://localhost:3001/auth/twitter/callback?code=${code}&state=${state}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText}`);
        }
        
        // Get the response data
        const data = await response.json();
        
        // Store the credentials in localStorage
        if (data.twitter_username) {
          localStorage.setItem('twitter_username', data.twitter_username);
        }
        if (data.twitter_access_token) {
          localStorage.setItem('twitter_access_token', data.twitter_access_token);
        }
        if (data.twitter_refresh_token) {
          localStorage.setItem('twitter_refresh_token', data.twitter_refresh_token);
        }
        
        // Close the popup window
        window.close();
        
      } catch (error) {
        console.error('Error processing Twitter callback:', error);
        setError(error instanceof Error ? error.message : 'Failed to authenticate with Twitter');
        toast.error('Twitter authentication failed');
        // Close the popup window after a delay
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleTwitterCallback();
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Twitter Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Closing this window...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Connecting to Twitter</h2>
          <p className="text-gray-600">Please wait while we complete the Twitter authentication...</p>
        </div>
      )}
    </div>
  );
};

export default TwitterCallback; 