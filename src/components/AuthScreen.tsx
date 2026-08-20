import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LogoWordmark } from './Logo';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'update-password';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string) => Promise<string | null>;
  onResetPassword: (email: string) => Promise<string | null>;
  onUpdatePassword?: (password: string) => Promise<string | null>;
  isRecoveryMode?: boolean;
}

export function AuthScreen({
  onSignIn, onSignUp, onResetPassword, onUpdatePassword, isRecoveryMode,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(isRecoveryMode ? 'update-password' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync to recovery mode arriving asynchronously (PASSWORD_RECOVERY event fires after mount).
  useEffect(() => {
    if (isRecoveryMode) {
      setMode('update-password');
      setError(null);
      setSuccessMsg(null);
    }
  }, [isRecoveryMode]);

  const reset = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'update-password') {
      if (!password) { setError('Please enter a new password.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      setLoading(true);
      const err = await onUpdatePassword?.(password);
      if (err) { setError(err); setLoading(false); }
      // On success, isRecoveryMode becomes false → App re-renders into dashboard.
      return;
    }

    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (mode !== 'forgot' && !password) { setError('Please enter your password.'); return; }

    setLoading(true);

    if (mode === 'signin') {
      const err = await onSignIn(email.trim(), password);
      if (err) { setError(err); setLoading(false); }
      // On success, auth state change handles navigation — do not setLoading(false).
    } else if (mode === 'signup') {
      const err = await onSignUp(email.trim(), password);
      if (!err) {
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
        reset('signin');
      } else {
        setError(err);
      }
      setLoading(false);
    } else {
      const err = await onResetPassword(email.trim());
      if (!err) {
        setSuccessMsg('Password reset email sent. Check your inbox.');
      } else {
        setError(err);
      }
      setLoading(false);
    }
  };

  const inputBase =
    'w-full bg-[#0d1526] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all';

  const subtitle: Record<AuthMode, string> = {
    signin: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
    'update-password': 'Set a new password',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, #0d1e3f 0%, #060b18 60%)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-6"
        style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <LogoWordmark iconSize={36} textSize="md" />
          <p className="text-xs text-slate-500 mt-1">{subtitle[mode]}</p>
        </div>

        {/* Success / Error */}
        {successMsg && (
          <div className="rounded-xl px-4 py-3 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="rounded-xl px-4 py-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-3">

          {/* Update-password mode: two password fields, no email */}
          {mode === 'update-password' ? (
            <>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputBase + ' pl-9 pr-10'}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={inputBase + ' pl-9'}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              {/* Email (all modes except update-password) */}
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputBase + ' pl-9'}
                  autoComplete={mode === 'signup' ? 'email' : 'username'}
                  disabled={loading}
                />
              </div>

              {/* Password (signin / signup only) */}
              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputBase + ' pl-9 pr-10'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}

              {/* Forgot link */}
              {mode === 'signin' && (
                <button
                  type="button"
                  className="text-xs text-blue-400 hover:text-blue-300 self-end -mt-1 transition-colors"
                  onClick={() => reset('forgot')}
                >
                  Forgot password?
                </button>
              )}
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 mt-1"
            style={{
              background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
            }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Email'}
            {mode === 'update-password' && 'Update Password'}
          </button>
        </form>

        {/* Mode switcher (not shown during password recovery) */}
        {mode !== 'update-password' && (
          <div className="flex flex-col items-center gap-3">
            {mode === 'forgot' ? (
              <button
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => reset('signin')}
              >
                <ArrowLeft size={13} /> Back to sign in
              </button>
            ) : (
              <p className="text-xs text-slate-500">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  onClick={() => reset(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
