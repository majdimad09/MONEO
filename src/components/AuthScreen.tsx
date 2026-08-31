import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2, ChevronLeft, User, Hash } from 'lucide-react';
import { LogoWordmark } from './Logo';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES, LangCode } from '../i18n/translations';
import type { SignupMeta } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'update-password';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string, meta?: SignupMeta) => Promise<string | null>;
  onResetPassword: (email: string) => Promise<string | null>;
  onUpdatePassword?: (password: string) => Promise<string | null>;
  isRecoveryMode?: boolean;
  initialMode?: 'signin' | 'signup';
  onGoBack?: () => void;
}

export function AuthScreen({
  onSignIn, onSignUp, onResetPassword, onUpdatePassword, isRecoveryMode, initialMode, onGoBack,
}: AuthScreenProps) {
  const { t, lang, setLanguage } = useLanguage();
  const { isDark, colors } = useTheme();

  const [mode, setMode] = useState<AuthMode>(isRecoveryMode ? 'update-password' : (initialMode ?? 'signin'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Signup-only fields
  const [signupName, setSignupName] = useState('');
  const [signupAge, setSignupAge] = useState('');
  const [signupStatus, setSignupStatus] = useState('School');
  const [signupLang, setSignupLang] = useState<LangCode>(lang);

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
      if (!password) { setError(t('errEnterNewPassword')); return; }
      if (password.length < 8) { setError(t('errPasswordLength')); return; }
      if (password !== confirmPassword) { setError(t('errPasswordsMatch')); return; }
      setLoading(true);
      const err = await onUpdatePassword?.(password);
      if (err) { setError(err); setLoading(false); }
      return;
    }

    if (!email.trim()) { setError(t('errEnterEmail')); return; }
    if (mode !== 'forgot' && !password) { setError(t('errEnterPassword')); return; }

    if (mode === 'signup') {
      if (!signupName.trim()) { setError(t('errEnterName')); return; }
      const ageNum = parseInt(signupAge, 10);
      if (!signupAge || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        setError(t('errEnterAge')); return;
      }
      if (password.length < 8) { setError(t('errPasswordLength')); return; }
      if (password !== confirmPassword) { setError(t('errPasswordsMatch')); return; }
    }

    setLoading(true);

    if (mode === 'signin') {
      const err = await onSignIn(email.trim(), password);
      if (err) { setError(err); setLoading(false); }
      // On success, auth state change handles navigation.
    } else if (mode === 'signup') {
      // Apply the language selected during signup immediately.
      setLanguage(signupLang);
      const err = await onSignUp(email.trim(), password, {
        name: signupName.trim(),
        age: parseInt(signupAge, 10),
        status: signupStatus,
        language: signupLang,
      });
      if (!err) {
        setSuccessMsg(t('msgAccountCreated'));
        reset('signin');
      } else {
        setError(err);
      }
      setLoading(false);
    } else {
      const err = await onResetPassword(email.trim());
      if (!err) {
        setSuccessMsg(t('msgResetSent'));
      } else {
        setError(err);
      }
      setLoading(false);
    }
  };

  const inputBase = 'input-dark w-full rounded-2xl px-4 py-3.5 text-sm focus:outline-none transition-all';

  const subtitle: Record<AuthMode, string> = {
    signin: t('welcomeBack'),
    signup: t('createYourAccount'),
    forgot: t('resetYourPassword'),
    'update-password': t('setNewPassword'),
  };

  const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'School',      label: t('statusSchool') },
    { value: 'University',  label: t('statusUniversity') },
    { value: 'Working',     label: t('statusWorking') },
    { value: 'Unemployed',  label: t('statusUnemployed') },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{
        background: isDark ? '#141517' : '#f4f5f9',
      }}
    >
      {/* Background glows */}
      {isDark && <>
        <div style={{ position: 'absolute', top: -100, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
      </>}
      {!isDark && <>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
      </>}

      {onGoBack && !isRecoveryMode && (
        <button
          onClick={onGoBack}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm transition-colors cursor-pointer z-10"
          style={{ color: colors.textSecondary }}
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}
      <div
        className="w-full max-w-md rounded-3xl flex flex-col gap-5 relative z-10"
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset' : '0 20px 60px rgba(0,0,0,0.10)',
          padding: '32px 28px 28px',
        }}
      >
        {/* Logo + Subtitle */}
        <div className="flex flex-col items-center gap-2.5 pb-1">
          <LogoWordmark iconSize={42} textSize="lg" />
          <p className="text-sm font-semibold mt-0.5 text-center" style={{ color: colors.textSecondary }}>{subtitle[mode]}</p>
        </div>

        {/* Success / Error */}
        {successMsg && (
          <div className="rounded-xl px-4 py-3 text-xs" style={{ color: isDark ? '#22c55e' : '#065f46', background: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(16,185,129,0.08)', border: isDark ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(16,185,129,0.2)' }}>
            {successMsg}
          </div>
        )}
        {error && (
          <div className="rounded-xl px-4 py-3 text-xs" style={{ color: '#991b1b', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-3">

          {/* ── Update-password mode ── */}
          {mode === 'update-password' ? (
            <>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('newPassword')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputBase + ' pl-9 pr-10'}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: colors.textMuted }}
                  onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('confirmNewPassword')}
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
              {/* ── Signup extra fields ── */}
              {mode === 'signup' && (
                <>
                  {/* Name */}
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                    <input
                      type="text"
                      placeholder={t('fullName')}
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      className={inputBase + ' pl-9'}
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>

                  {/* Age + Status (side by side) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                      <input
                        type="number"
                        placeholder={t('age')}
                        value={signupAge}
                        onChange={e => setSignupAge(e.target.value)}
                        min={13} max={120}
                        className={inputBase + ' pl-9'}
                        disabled={loading}
                      />
                    </div>
                    <select
                      value={signupStatus}
                      onChange={e => setSignupStatus(e.target.value)}
                      className={inputBase + ' appearance-none'}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        backgroundSize: '16px',
                        paddingRight: '2rem',
                      }}
                      disabled={loading}
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language picker */}
                  <div>
                    <p className="text-[11px] mb-1.5 font-medium" style={{ color: colors.textSecondary }}>{t('chooseLanguage')}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => { setSignupLang(l.code); setLanguage(l.code); }}
                          disabled={loading}
                          className="py-2 px-1 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer"
                          style={signupLang === l.code
                            ? { background: colors.accentSoft, border: `1px solid ${colors.accent}40`, color: colors.accent }
                            : { background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textSecondary }
                          }
                        >
                          {l.nativeName}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Email (all modes except update-password) */}
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                <input
                  type="email"
                  placeholder={t('email')}
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
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={t('password')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputBase + ' pl-9 pr-10'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    disabled={loading}
                  />
                  <button type="button" tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: colors.textMuted }}
                    onClick={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}

              {/* Confirm password (signup only) */}
              {mode === 'signup' && (
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={t('confirmNewPassword')}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={inputBase + ' pl-9'}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Forgot link */}
              {mode === 'signin' && (
                <button type="button"
                  className="text-xs self-end -mt-1 transition-colors cursor-pointer"
                  style={{ color: colors.accent }}
                  onClick={() => reset('forgot')}>
                  {t('forgotPassword')}
                </button>
              )}
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60"
            style={{
              background: loading ? `${colors.accent}80` : colors.accent,
              boxShadow: loading ? 'none' : `0 6px 24px ${colors.accent}45`,
              letterSpacing: '0.01em',
            }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === 'signin' && t('signIn')}
            {mode === 'signup' && t('createAccount')}
            {mode === 'forgot' && t('sendResetEmail')}
            {mode === 'update-password' && t('updatePasswordBtn')}
          </button>
        </form>

        {/* Mode switcher */}
        {mode !== 'update-password' && (
          <div className="flex flex-col items-center gap-3">
            {mode === 'forgot' ? (
              <button
                className="flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                style={{ color: colors.textMuted }}
                onClick={() => reset('signin')}
              >
                <ArrowLeft size={13} /> {t('backToSignIn')}
              </button>
            ) : (
              <p className="text-xs" style={{ color: colors.textMuted }}>
                {mode === 'signin' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
                <button
                  className="font-semibold transition-colors cursor-pointer"
                  style={{ color: colors.accent }}
                  onClick={() => reset(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' ? t('signUpLink') : t('signInLink')}
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
