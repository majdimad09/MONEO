import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isRecoveryMode: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  // Immediately true when the URL contains a recovery token so the password
  // form shows before any async session exchange completes.
  const [isRecoveryMode, setIsRecoveryMode] = useState(() =>
    typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      } else if (event === 'USER_UPDATED') {
        // Password was successfully changed — exit recovery mode.
        setIsRecoveryMode(false);
      }
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
        // Use the current origin so the confirmation link works on any deployment.
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
      // Redirect back to the app origin — Supabase appends #type=recovery tokens.
      redirectTo: window.location.origin,
    });
    return error ? friendlyError(error.message) : null;
  };

  const updatePassword = async (password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setIsRecoveryMode(false);
    return error ? friendlyError(error.message) : null;
  };

  return {
    user, session, loading, isConfigured: isSupabaseConfigured, isRecoveryMode,
    signIn, signUp, signOut, resetPassword, updatePassword,
  };
}

function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
    return 'Invalid email or password.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email first — check your inbox for a confirmation link.';
  }
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (m.includes('password should be') || m.includes('password must be') || m.includes('weak password')) {
    return 'Password must be at least 6 characters.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment.';
  }
  if (m.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  return msg;
}
