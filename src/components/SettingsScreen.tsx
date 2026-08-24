import React, { useState } from 'react';
import { Download, RotateCcw, Sparkles, ChevronRight, User, Check, LogOut, Globe } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES, LangCode } from '../i18n/translations';
import { saveProfile } from '../lib/supabaseService';

interface SettingsScreenProps {
  transactionCount: number;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportCSV: () => void;
  userName: string;
  onSaveUserName: (name: string) => void;
  user?: SupabaseUser | null;
  onSignOut?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  transactionCount, onLoadSampleData, onClearAllData, onExportCSV,
  userName, onSaveUserName, user, onSignOut,
}) => {
  const { t, lang, setLanguage } = useLanguage();

  const [nameInput, setNameInput] = useState(userName);
  const [nameSaved, setNameSaved] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveName = () => {
    onSaveUserName(nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleLanguageChange = (newLang: LangCode) => {
    setLanguage(newLang);
    setShowLangPicker(false);
    if (user) saveProfile(user.id, { language: newLang }).catch(() => {});
  };

  const currentLang = LANGUAGES.find(l => l.code === lang);

  return (
    <div className="page-enter px-4 pt-3 pb-6 space-y-4">

      {/* Profile */}
      <div className="card-dark rounded-2xl p-4 card-float-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <User size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">{t('profile')}</p>
            <p className="text-xs text-slate-500">{t('profileDesc')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('yourFirstName')}
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            className="input-dark flex-1 px-3 py-2 rounded-xl text-sm"
          />
          <button
            onClick={handleSaveName}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer flex items-center gap-1.5 transition-all ${nameSaved ? 'text-green-400' : 'btn-blue'}`}
            style={nameSaved ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' } : {}}
          >
            {nameSaved ? <><Check size={14} /> {t('saved')}</> : t('save')}
          </button>
        </div>
      </div>

      {/* Account (signed-in users only) */}
      {user && (
        <div className="card-dark rounded-2xl p-4 card-float-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">{t('signedInAs')}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{user.email}</p>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <LogOut size={13} />
                {t('signOut')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Language */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowLangPicker(v => !v)}
          className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Globe size={18} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200">{t('language')}</p>
            <p className="text-xs text-slate-500 mt-0.5">{currentLang?.nativeName ?? 'English'}</p>
          </div>
          <ChevronRight size={16} className="text-slate-600" style={{ transform: showLangPicker ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
        </button>

        {showLangPicker && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2" style={{ borderTop: '1px solid #0f1e38' }}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  lang === l.code ? 'text-blue-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={lang === l.code
                  ? { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }
                  : { background: '#0a1424', border: '1px solid #1e2d4a' }
                }
              >
                {lang === l.code && <Check size={13} className="text-blue-400 flex-shrink-0" />}
                <span className="truncate">{l.nativeName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data */}
      <div className="card-dark rounded-2xl overflow-hidden">
        {[
          {
            label: t('loadDemo'),
            desc: t('loadDemoDesc'),
            icon: Sparkles,
            color: '#60a5fa',
            onClick: onLoadSampleData,
            disabled: transactionCount > 0,
          },
          {
            label: t('exportCsv'),
            desc: t('exportDesc').replace('{n}', String(transactionCount)),
            icon: Download,
            color: '#34d399',
            onClick: onExportCSV,
            disabled: transactionCount === 0,
          },
        ].map(({ label, desc, icon: Icon, color, onClick, disabled }, i) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors cursor-pointer disabled:opacity-40"
            style={{ borderBottom: i === 0 ? '1px solid #0f1e38' : 'none' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        ))}
      </div>

      {/* Reset */}
      <div className="card-dark rounded-2xl overflow-hidden">
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={transactionCount === 0}
            className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors cursor-pointer disabled:opacity-40"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <RotateCcw size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">{t('resetAllData')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('resetAllDataDesc')}</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm font-bold text-slate-100 mb-1">{t('areYouSure')}</p>
            <p className="text-xs text-slate-500 mb-3">
              {t('resetConfirmMsg').replace('{n}', String(transactionCount))}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl text-sm text-slate-400 cursor-pointer" style={{ background: '#111d35' }}>
                {t('cancel')}
              </button>
              <button onClick={() => { onClearAllData(); setShowClearConfirm(false); }}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 cursor-pointer">
                {t('yesReset')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card-dark rounded-2xl p-4 text-center">
        <p className="text-xs text-slate-500">{t('appInfo')}</p>
        <p className="text-[10px] text-slate-600 mt-2">{transactionCount} transactions · {t('moneoBrand')}</p>
      </div>
    </div>
  );
};
