import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Determine if we're using mock Supabase
const isMockSupabase = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock user for development when Supabase credentials are missing
const MOCK_USER: User = {
  id: "mock-user-id",
  app_metadata: {},
  user_metadata: { name: "Mock User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  error: Error | null;
  isMockAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMockAuth] = useState<boolean>(isMockSupabase);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    // If using mock Supabase, set a mock user and skip real auth
    if (isMockSupabase) {
      console.log('AuthProvider: Using mock authentication');
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError);
          setLoading(false);
          return;
        }

        console.log('AuthProvider: Session loaded', session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('AuthProvider: Error during initialization:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider: Auth state changed', { event, session });
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isMockSupabase]);

  const signIn = async (email: string, password: string) => {
    // If using mock Supabase, simulate a successful sign-in
    if (isMockSupabase) {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(MOCK_USER);
      setLoading(false);
      toast.success('Signed in successfully (Mock)');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // If using mock Supabase, simulate a successful Google sign-in
    if (isMockSupabase) {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Create a mock Google user
      const mockGoogleUser = {
        ...MOCK_USER,
        id: "google-mock-user-id",
        user_metadata: { 
          name: "Google Mock User",
          avatar_url: "https://lh3.googleusercontent.com/a/mock-google-avatar",
          email: "mock.google.user@gmail.com"
        }
      } as User;
      
      setUser(mockGoogleUser);
      setLoading(false);
      toast.success('Signed in with Google successfully (Mock)');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the full URL for the redirect
      const redirectUrl = new URL('/auth/callback', window.location.origin).toString();
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) throw error;
      
      // With Supabase OAuth, we don't need to handle the redirect here
      // The user will be redirected to the provider's login page
      console.log('Redirecting to Google login...', data);
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Error signing in with Google');
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // If using mock Supabase, simulate a successful sign-up
    if (isMockSupabase) {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(MOCK_USER);
      setLoading(false);
      toast.success('Account created successfully! (Mock)');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      toast.success('Account created successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Error creating account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // If using mock Supabase, simulate a successful sign-out
    if (isMockSupabase) {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      setLoading(false);
      toast.success('Signed out successfully (Mock)');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    loading,
    error,
    isMockAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 