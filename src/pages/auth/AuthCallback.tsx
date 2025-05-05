import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthCallback initialized', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      fullURL: window.location.href
    });

    // Check if there's an error parameter in the URL
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('error');
    if (errorMessage) {
      console.error('Error from callback URL:', errorMessage);
      setError(errorMessage);
      toast.error(`Authentication failed: ${errorMessage}`);
      setTimeout(() => navigate('/sign-in'), 3000);
      return;
    }

    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback');

        // Handle the complete URL with hash fragments
        // Supabase automatically processes the hash fragment for token extraction
        if (location.hash && location.hash.includes('access_token')) {
          console.log('Found hash in URL with access_token');
          
          // Get the current session - Supabase should have already processed the hash
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
            
          if (data.session) {
            console.log('Session established successfully');
            toast.success('Successfully authenticated!');
            navigate('/');
            return;
          } else {
            console.error('No session found after hash processing');
            throw new Error('Session could not be established from token');
          }
        }
        
        // Check for code in query parameters (OAuth code flow)
        const code = queryParams.get('code');
        if (code) {
          console.log('Found code in query parameters, exchanging for session');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          
          // Check if the session was established
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          
          if (data.session) {
            console.log('Session established successfully from code');
            toast.success('Successfully authenticated!');
            navigate('/');
            return;
          } else {
            throw new Error('Session could not be established from code');
          }
        }
        
        // If we got here, we don't have a valid auth method
        throw new Error('No valid authentication data found in URL');
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        setError(error?.message || 'Authentication failed');
        toast.error(`Authentication failed: ${error?.message || 'Unknown error'}`);
        setTimeout(() => navigate('/sign-in'), 3000);
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting you back to sign in...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Completing Authentication</h2>
          <p className="text-gray-600">Please wait while we finalize your sign-in...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback; 