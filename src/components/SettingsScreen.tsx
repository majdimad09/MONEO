import React, { useState } from 'react';
import {
  User, Mail, Hash, Briefcase, ChevronRight, Check, Globe,
  Bell, BellOff, Lock, LogOut, Download, RotateCcw,
  Sparkles, Info, MessageCircle, Trash2, Eye, EyeOff, Crown,
  Sun, Moon,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES, LangCode } from '../i18n/translations';
import { saveProfile } from '../lib/supabaseService';
import { useTheme } from '../context/ThemeContext';

interface SettingsScreenProps {
  transactionCount: number;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportCSV: () => void;
  userName: string;
  userEmail: string;
  userAge: number | null;
  userStatus: string;
  onSaveProfile: (data: { name: string; age: number | null; status: string }) => void;
  user?: SupabaseUser | null;
  onSignOut?: () => void;
  onChangePassword?: (newPassword: string) => Promise<string | null>;
  onDeleteAccount?: () => Promise<void>;
  isPremium?: boolean;
  membershipStartedAt?: string | null;
  onUpgrade?: () => void;
  onNavigatePremium?: () => void;
}

const STATUSES = ['School', 'University', 'Working', 'Unemployed'];

function SectionHeader({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2"
      style={{ color: colors.textMuted }}>
      {label}
    </p>
  );
}

function RowButton({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  desc,
  onClick,
  disabled,
  danger,
  rightEl,
  noBorder,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  desc?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  rightEl?: React.ReactNode;
  noBorder?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer disabled:opacity-40"
      style={{ borderBottom: noBorder ? 'none' : `1px solid ${colors.divider}` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}>
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: danger ? '#f87171' : colors.textPrimary }}>{label}</p>
        {desc && <p className="text-xs mt-0.5 truncate" style={{ color: colors.textSecondary }}>{desc}</p>}
      </div>
      {rightEl ?? <ChevronRight size={15} className="flex-shrink-0" style={{ color: colors.textMuted }} />}
    </button>
  );
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  transactionCount, onLoadSampleData, onClearAllData, onExportCSV,
  userName, userEmail, userAge, userStatus,
  onSaveProfile, user, onSignOut, onChangePassword, onDeleteAccount,
  isPremium = false, membershipStartedAt, onNavigatePremium,
}) => {
  const { t, lang, setLanguage } = useLanguage();
  const { colors, isDark, toggleTheme } = useTheme();

  // ── Account state ──────────────────────────────────────────────────────
  const [nameInput, setNameInput] = useState(userName);
  const [ageInput, setAgeInput] = useState(userAge != null ? String(userAge) : '');
  const [statusInput, setStatusInput] = useState(userStatus || STATUSES[0]);
  const [profileSaved, setProfileSaved] = useState(false);

  // ── Preferences state ──────────────────────────────────────────────────
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [appNotifs, setAppNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

  // ── Security state ─────────────────────────────────────────────────────
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // ── Privacy state ──────────────────────────────────────────────────────
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ── Support state ──────────────────────────────────────────────────────
  const [showAbout, setShowAbout] = useState(false);

  // ── Danger zone state ──────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    const age = ageInput.trim() ? Number(ageInput) : null;
    onSaveProfile({ name: nameInput.trim(), age, status: statusInput });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleLanguageChange = (code: LangCode) => {
    setLanguage(code);
    setShowLangPicker(false);
    if (user) saveProfile(user.id, { language: code }).catch(() => {});
  };

  const handleChangePassword = async () => {
    setPwdError('');
    if (newPwd.length < 8) { setPwdError(t('errPasswordLength')); return; }
    if (newPwd !== confirmPwd) { setPwdError(t('errPasswordsMatch')); return; }
    if (!onChangePassword) return;
    setPwdLoading(true);
    const err = await onChangePassword(newPwd);
    setPwdLoading(false);
    if (err) { setPwdError(err); return; }
    setPwdSuccess(true);
    setNewPwd(''); setConfirmPwd('');
    setTimeout(() => { setPwdSuccess(false); setShowChangePwd(false); }, 2500);
  };

  const handleDeleteAccount = async () => {
    if (!onDeleteAccount) return;
    setDeleting(true);
    await onDeleteAccount();
    setDeleting(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang);

  // ── Avatar initials ────────────────────────────────────────────────────
  const initials = (nameInput.trim() || userEmail || '?')
    .split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

  // ── Toggle pill ────────────────────────────────────────────────────────
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 cursor-pointer transition-all"
      style={{ width: 44, height: 26 }}
    >
      <div className="absolute inset-0 rounded-full transition-all"
        style={{ background: on ? colors.accent : colors.bgHover, border: '1px solid ' + (on ? colors.accent + '80' : colors.border) }} />
      <div className="absolute top-1 transition-all rounded-full bg-white"
        style={{ width: 18, height: 18, left: on ? 22 : 4, transition: 'left 0.18s ease' }} />
    </button>
  );

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      {/* ── ACCOUNT ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader label={t('settingsAccount')} />
        <div className="card-dark rounded-2xl overflow-hidden">

          {/* Avatar + email header */}
          <div className="flex items-center gap-3.5 px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${colors.divider}` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-base"
              style={{ background: colors.accentSoft, border: `1px solid ${colors.accent}30`, color: colors.accent, letterSpacing: 0.5 }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: colors.textPrimary }}>{nameInput.trim() || t('nameField')}</p>
              <p className="text-xs truncate" style={{ color: colors.textSecondary }}>{userEmail}</p>
            </div>
          </div>

          {/* Name */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.divider}` }}>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textSecondary }}>{t('nameField')}</label>
            <div className="flex items-center gap-2">
              <User size={14} className="flex-shrink-0" style={{ color: colors.textSecondary }} />
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="input-dark flex-1 px-3 py-2 rounded-xl text-sm"
                placeholder={t('yourFirstName')}
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.divider}` }}>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textSecondary }}>{t('emailField')}</label>
            <div className="flex items-center gap-2">
              <Mail size={14} className="flex-shrink-0" style={{ color: colors.textSecondary }} />
              <input
                type="email"
                value={userEmail}
                readOnly
                className="flex-1 px-3 py-2 rounded-xl text-sm cursor-not-allowed"
                style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textSecondary }}
              />
            </div>
            <p className="text-[10px] mt-1 ml-5" style={{ color: colors.textSecondary }}>{t('emailCannotChange')}</p>
          </div>

          {/* Age */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.divider}` }}>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textSecondary }}>{t('ageField')}</label>
            <div className="flex items-center gap-2">
              <Hash size={14} className="flex-shrink-0" style={{ color: colors.textSecondary }} />
              <input
                type="number"
                min={13} max={120}
                value={ageInput}
                onChange={e => setAgeInput(e.target.value)}
                className="input-dark w-24 px-3 py-2 rounded-xl text-sm"
                placeholder="—"
              />
            </div>
          </div>

          {/* Status */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.divider}` }}>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textSecondary }}>{t('statusField')}</label>
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="flex-shrink-0" style={{ color: colors.textSecondary }} />
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusInput(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    style={statusInput === s
                      ? { background: colors.accentSoft, border: `1px solid ${colors.accent}40`, color: colors.accent }
                      : { background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}`, color: colors.textSecondary }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="px-4 py-3">
            <button
              onClick={handleSaveProfile}
              className={`w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all ${
                profileSaved ? '' : 'btn-primary'
              }`}
              style={profileSaved ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' } : {}}
            >
              {profileSaved ? <><Check size={15} /> {t('changesSaved')}</> : t('saveChanges')}
            </button>
          </div>
        </div>
      </div>

      {/* ── PREFERENCES ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader label={t('settingsPreferences')} />
        <div className="card-dark rounded-2xl overflow-hidden">

          {/* Language */}
          <button
            onClick={() => setShowLangPicker(v => !v)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Globe size={17} style={{ color: '#818cf8' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('language')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{currentLang?.nativeName ?? 'English'}</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted, transform: showLangPicker ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
          </button>

          {showLangPicker && (
            <div className="px-4 pb-3 pt-2 grid grid-cols-2 gap-2" style={{ borderBottom: `1px solid ${colors.divider}` }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={lang === l.code
                    ? { background: colors.accentSoft, border: `1px solid ${colors.accent}40`, color: colors.accent }
                    : { background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}`, color: colors.textSecondary }}
                >
                  {lang === l.code && <Check size={13} style={{ color: colors.accent }} className="flex-shrink-0" />}
                  <span className="truncate">{l.nativeName}</span>
                </button>
              ))}
            </div>
          )}

          {/* Theme toggle */}
          <div className="flex items-center gap-3.5 px-4 py-3.5" style={{ borderBottom: `1px solid ${colors.divider}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${isDark ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.2)'}` }}>
              {isDark
                ? <Sun size={17} style={{ color: '#fbbf24' }} />
                : <Moon size={17} style={{ color: '#818cf8' }} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{isDark ? t('darkMode') : t('lightMode')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</p>
            </div>
            <Toggle on={isDark} onToggle={toggleTheme} />
          </div>

          {/* App notifications */}
          <div className="flex items-center gap-3.5 px-4 py-3.5" style={{ borderBottom: `1px solid ${colors.divider}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
              {appNotifs ? <Bell size={17} style={{ color: '#fbbf24' }} /> : <BellOff size={17} style={{ color: colors.textMuted }} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('appNotifications')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('appNotificationsDesc')}</p>
            </div>
            <Toggle on={appNotifs} onToggle={() => setAppNotifs(v => !v)} />
          </div>

          {/* Email notifications */}
          <div className="flex items-center gap-3.5 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)' }}>
              <Mail size={17} style={{ color: '#22c55e' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('emailNotifications')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('emailNotificationsDesc')}</p>
            </div>
            <Toggle on={emailNotifs} onToggle={() => setEmailNotifs(v => !v)} />
          </div>
        </div>
      </div>

      {/* ── SECURITY ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader label={t('settingsSecurity')} />
        <div className="card-dark rounded-2xl overflow-hidden">

          {/* Change password */}
          <button
            onClick={() => { setShowChangePwd(v => !v); setPwdError(''); setPwdSuccess(false); }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: colors.brandSoft, border: `1px solid ${colors.brand}25` }}>
              <Lock size={17} style={{ color: colors.brand }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('changePassword')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('changePasswordDesc')}</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted, transform: showChangePwd ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
          </button>

          {showChangePwd && (
            <div className="px-4 py-3 space-y-2.5" style={{ borderBottom: `1px solid ${colors.divider}` }}>
              {pwdSuccess ? (
                <p className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
                  <Check size={15} /> {t('passwordChangedOk')}
                </p>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      placeholder={t('newPasswordLabel')}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      className="input-dark w-full px-3 py-2.5 pr-10 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer"
                      onClick={() => setShowNewPwd(v => !v)}
                    >
                      {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder={t('confirmPasswordLabel')}
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                  />
                  {pwdError && <p className="text-xs text-red-400">{pwdError}</p>}
                  <button
                    onClick={handleChangePassword}
                    disabled={pwdLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-bold btn-primary cursor-pointer disabled:opacity-50"
                  >
                    {pwdLoading ? '…' : t('updatePasswordBtnShort')}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <LogOut size={17} style={{ color: '#f87171' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#f87171' }}>{t('signOut')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('signOutDesc')}</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted }} />
          </button>
        </div>
      </div>

      {/* ── SUBSCRIPTION ─────────────────────────────────────────────── */}
      <div>
        <SectionHeader label={t('subscriptionSection')} />
        <div className="card-dark rounded-2xl overflow-hidden">
          <button
            onClick={onNavigatePremium}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isPremium ? 'rgba(139,92,246,0.15)' : 'rgba(100,116,139,0.1)', border: `1px solid ${isPremium ? 'rgba(139,92,246,0.3)' : colors.borderStrong}` }}>
              <Crown size={17} style={{ color: isPremium ? '#a78bfa' : colors.textSecondary }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                {isPremium ? 'Moneo Premium' : 'Moneo Free'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                {isPremium
                  ? membershipStartedAt
                    ? `Active since ${new Date(membershipStartedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                    : t('allFeaturesUnlocked')
                  : t('upgradePriceTag')}
              </p>
            </div>
            <ChevronRight size={15} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* ── PRIVACY & DATA ────────────────────────────────────────────── */}
      <div>
        <SectionHeader label={t('settingsPrivacyData')} />
        <div className="card-dark rounded-2xl overflow-hidden">

          <RowButton
            icon={Sparkles}
            iconColor="#818cf8"
            iconBg="rgba(129,140,248,0.1)"
            label={t('loadDemo')}
            desc={t('loadDemoDesc')}
            onClick={onLoadSampleData}
            disabled={transactionCount > 0}
          />

          <RowButton
            icon={Download}
            iconColor="#22c55e"
            iconBg="rgba(34,197,94,0.12)"
            label={t('exportCsv')}
            desc={t('exportDesc').replace('{n}', String(transactionCount))}
            onClick={onExportCSV}
            disabled={transactionCount === 0}
          />

          {/* Reset all data */}
          {!showResetConfirm ? (
            <RowButton
              icon={RotateCcw}
              iconColor="#f87171"
              iconBg="rgba(239,68,68,0.1)"
              label={t('resetAllData')}
              desc={t('resetAllDataDesc')}
              onClick={() => setShowResetConfirm(true)}
              disabled={transactionCount === 0}
              danger
              noBorder
            />
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>{t('areYouSure')}</p>
              <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                {t('resetConfirmMsg').replace('{n}', String(transactionCount))}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 font-semibold cursor-pointer"
                  style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => { onClearAllData(); setShowResetConfirm(false); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-900 cursor-pointer"
                  style={{ background: '#dc2626' }}
                >
                  {t('yesReset')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SUPPORT ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader label={t('settingsSupport')} />
        <div className="card-dark rounded-2xl overflow-hidden">

          {/* About */}
          <button
            onClick={() => setShowAbout(v => !v)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Info size={17} style={{ color: '#818cf8' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('aboutMoneo')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('aboutMoneoDesc')}</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted, transform: showAbout ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
          </button>

          {showAbout && (
            <div className="px-4 py-3 space-y-1" style={{ borderBottom: `1px solid ${colors.divider}` }}>
              <p className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{t('appVersion')}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>{t('appInfoText')}</p>
              <p className="text-[10px] pt-1" style={{ color: colors.textMuted }}>{t('moneoBrand')}</p>
            </div>
          )}

          {/* Contact support */}
          <button
            onClick={() => window.open('mailto:support@moneo.app', '_blank')}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)' }}>
              <MessageCircle size={17} style={{ color: '#22c55e' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('contactSupport')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('contactSupportDesc')}</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted }} />
          </button>
        </div>
      </div>

      {/* ── DANGER ZONE ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader label={t('settingsDangerZone')} />
        <div className="card-dark rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(239,68,68,0.15)' }}>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <Trash2 size={17} style={{ color: '#f87171' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#f87171' }}>{t('deleteAccount')}</p>
                <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('deleteAccountDesc')}</p>
              </div>
              <ChevronRight size={15} style={{ color: 'rgba(239,68,68,0.5)' }} />
            </button>
          ) : (
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-start gap-2">
                <Trash2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: '#f87171' }}>{t('areYouSure')}</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{t('deleteAccountWarning')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 font-semibold cursor-pointer"
                  style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-900 cursor-pointer disabled:opacity-60"
                  style={{ background: '#dc2626' }}
                >
                  {deleting ? '…' : t('deleteAccountBtn')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] pb-2" style={{ color: colors.textMuted }}>
        {transactionCount} {t('navStats').toLowerCase()} · {t('moneoBrand')} · {t('appVersion')}
      </p>

    </div>
  );
};
