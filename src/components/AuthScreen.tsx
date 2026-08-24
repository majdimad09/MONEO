import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2, ChevronLeft, User, Hash } from 'lucide-react';
import { LogoWordmark } from './Logo';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES, LangCode } from '../i18n/translations';
import type { SignupMeta } from '../hooks/useAuth';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'update-password';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string, meta?: SignupMeta) => Promise<string | null>;
  onResetPassword: (email: string) => Promise<string | null>;
  onUpdatePassword?: (password: string) => Promise<string | null>;
  isRecoveryMode?: boolean;
  onGoBack?: () => void;
}

export function AuthScreen({
  onSignIn, onSignUp, onResetPassword, onUpdatePassword, isRecoveryMode, onGoBack,
}: AuthScreenProps) {
  const { t, lang, setLanguage } = useLanguage();

  const [mode, setMode] = useState<AuthMode>(isRecoveryMode ? 'update-password' : 'signin');
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

  const inputBase =
    'w-full bg-[#0d1526] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all';

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
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'radial-gradient(ellipse at top, #0d1e3f 0%, #060b18 60%)' }}
    >
      {onGoBack && !isRecoveryMode && (
        <button
          onClick={onGoBack}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
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

          {/* ── Update-password mode ── */}
          {mode === 'update-password' ? (
            <>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                      <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                      className={inputBase}
                      disabled={loading}
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language picker */}
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">{t('chooseLanguage')}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => { setSignupLang(l.code); setLanguage(l.code); }}
                          disabled={loading}
                          className={`py-2 px-1 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer ${
                            signupLang === l.code
                              ? 'text-blue-300'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          style={signupLang === l.code
                            ? { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)' }
                            : { background: '#0a1424', border: '1px solid #1e2d4a' }
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
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}

              {/* Confirm password (signup only) */}
              {mode === 'signup' && (
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                  className="text-xs text-blue-400 hover:text-blue-300 self-end -mt-1 transition-colors"
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
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 mt-1"
            style={{
              background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
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
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => reset('signin')}
              >
                <ArrowLeft size={13} /> {t('backToSignIn')}
              </button>
            ) : (
              <p className="text-xs text-slate-500">
                {mode === 'signin' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
                <button
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
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
