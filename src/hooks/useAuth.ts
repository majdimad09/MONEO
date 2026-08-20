import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Load existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? friendlyError(error.message) : null;
  };

  const signUp = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect to wherever the app is currently deployed (works for both Vercel and local).
        emailRedirectTo: window.location.origin,
      },
    });
    return error ? friendlyError(error.message) : null;
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return error ? friendlyError(error.message) : null;
  };

  return { user, session, loading, isConfigured: isSupabaseConfigured, signIn, signUp, signOut, resetPassword };
}

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Invalid email or password.';
  if (msg.includes('Email not confirmed')) return 'Please confirm your email before signing in.';
  if (msg.includes('already registered') || msg.includes('already exists')) return 'An account with this email already exists.';
  if (msg.includes('Password should be')) return 'Password must be at least 6 characters.';
  if (msg.includes('rate limit')) return 'Too many attempts. Please wait a moment.';
  return msg;
}
