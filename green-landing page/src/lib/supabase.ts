import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

const isMobile = Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseConfig = {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: !isMobile,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);

// Handle auth state on mobile
if (isMobile) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      // Handle successful sign in
      console.log('Signed in:', session?.user?.email);
    } else if (event === 'SIGNED_OUT') {
      // Handle sign out
      console.log('Signed out');
    }
  });
}