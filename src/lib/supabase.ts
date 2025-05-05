import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

let supabase;

// Check if we have real Supabase credentials
if (supabaseUrl && supabaseAnonKey) {
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
    supabase = createMockSupabaseClient();
  }
} else {
  console.warn('Using mock Supabase client because environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file for full functionality.');
  supabase = createMockSupabaseClient();
}

// Mock Supabase client that won't throw errors but won't actually connect to any database
function createMockSupabaseClient() {
  return {
    auth: {
      signUp: ({ email, password, options }) => 
        Promise.resolve({ user: null, session: null, error: null }),
      
      signInWithPassword: ({ email, password }) => 
        Promise.resolve({ user: null, session: null, error: null }),
      
      signInWithOAuth: ({ provider, options }) => {
        console.log(`Mock: Sign in with ${provider} OAuth`);
        return Promise.resolve({ error: null });
      },
      
      signOut: () => Promise.resolve({ error: null }),
      
      onAuthStateChange: (callback) => {
        // Return mock subscription with unsubscribe method
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      
      exchangeCodeForSession: (code) => Promise.resolve({ error: null }),
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          data: null,
          error: null
        }),
        data: null,
        error: null
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
        match: () => Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
        match: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export { supabase }; 