'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type Employment = 'employed' | 'freelancer' | 'founder' | 'passive';
type FamilyStatus = 'single' | 'married' | 'divorced';
type KvType = 'statutory' | 'private';

interface ProfileState {
  employment: Employment;
  familyStatus: FamilyStatus;
  children: number;
  kvType: KvType;
}

const EMPLOYMENT_OPTIONS: { value: Employment; labelKey: string }[] = [
  { value: 'employed',   labelKey: 'step2.employed'   },
  { value: 'freelancer', labelKey: 'step2.freelancer' },
  { value: 'founder',    labelKey: 'step2.founder'    },
  { value: 'passive',    labelKey: 'step2.passive'    },
];

const FAMILY_OPTIONS: { value: FamilyStatus; labelKey: string }[] = [
  { value: 'single',   labelKey: 'step3.single'   },
  { value: 'married',  labelKey: 'step3.married'  },
  { value: 'divorced', labelKey: 'step3.divorced' },
];

const KV_OPTIONS: { value: KvType; titleKey: string; hintKey: string }[] = [
  { value: 'statutory', titleKey: 'step5.statutory', hintKey: 'step5.statutoryHint' },
  { value: 'private',   titleKey: 'step5.private',   hintKey: 'step5.privateHint'   },
];

export function OnboardingWizard() {
  const t = useTranslations('onboarding');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();

  const [state, setState] = useState<ProfileState>({
    employment: 'employed',
    familyStatus: 'single',
    children: 0,
    kvType: 'statutory',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Redirect anonymous users
  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal('login');
      router.replace(`/${locale}`);
    }
  }, [authLoading, user, router, locale, openAuthModal]);

  // Pre-fill from existing profile
  useEffect(() => {
    if (!user) return;
    fetch('/api/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setState({
          employment: data.employment ?? 'employed',
          familyStatus: data.familyStatus ?? 'single',
          children: data.childrenCount ?? 0,
          kvType: data.kvType ?? 'statutory',
        });
      })
      .catch(() => {});
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employment: state.employment,
          familyStatus: state.familyStatus,
          childrenCount: state.children,
          kvType: state.kvType,
          onboardingDone: true,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <p className="text-on-surface-variant text-body-md">{t('loginRequired')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-headline-xl-mobile font-bold text-on-background">{t('profileTitle')}</h1>
        <p className="text-body-lg text-on-surface-variant">{t('profileSubtitle')}</p>
      </div>

      <div className="glass-card p-6 space-y-6 shadow-sm">
        {/* Employment */}
        <div className="space-y-3">
          <p className="label-field">{t('step2.title')}</p>
          <div className="grid grid-cols-1 gap-2">
            {EMPLOYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, employment: opt.value }))}
                className={cn(
                  'w-full text-left px-4 py-3.5 border rounded-xl text-body-md font-medium transition-all',
                  state.employment === opt.value
                    ? 'border-primary bg-primary/8 text-on-surface'
                    : 'border-outline-variant hover:border-outline text-on-surface-variant hover:text-on-surface',
                )}
              >
                {t(opt.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Family status */}
        <div className="space-y-3">
          <p className="label-field">{t('step3.title')}</p>
          <div className="grid grid-cols-1 gap-2">
            {FAMILY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, familyStatus: opt.value }))}
                className={cn(
                  'w-full text-left px-4 py-3.5 border rounded-xl text-body-md font-medium transition-all',
                  state.familyStatus === opt.value
                    ? 'border-primary bg-primary/8 text-on-surface'
                    : 'border-outline-variant hover:border-outline text-on-surface-variant hover:text-on-surface',
                )}
              >
                {t(opt.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="space-y-3">
          <p className="label-field">{t('step4.title')}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
              disabled={state.children === 0}
              className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-outline hover:text-on-surface disabled:opacity-40 transition-all"
            >
              −
            </button>
            <span className="text-body-md font-semibold text-on-surface w-6 text-center">{state.children}</span>
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, children: Math.min(10, prev.children + 1) }))}
              disabled={state.children >= 10}
              className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-outline hover:text-on-surface disabled:opacity-40 transition-all"
            >
              +
            </button>
            <span className="text-body-sm text-on-surface-variant ml-2">
              {state.children === 0 ? t('step4.none') : t('step4.count').replace('{n}', String(state.children))}
            </span>
          </div>
        </div>

        {/* KV */}
        <div className="space-y-3">
          <p className="label-field">{t('step5.title')}</p>
          <div className="grid grid-cols-1 gap-3">
            {KV_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, kvType: opt.value }))}
                className={cn(
                  'w-full text-left px-4 py-4 border rounded-xl transition-all',
                  state.kvType === opt.value
                    ? 'border-primary bg-primary/8'
                    : 'border-outline-variant hover:border-outline',
                )}
              >
                <p className={cn('text-body-md font-semibold', state.kvType === opt.value ? 'text-on-surface' : 'text-on-surface-variant')}>
                  {t(opt.titleKey as Parameters<typeof t>[0])}
                </p>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  {t(opt.hintKey as Parameters<typeof t>[0])}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full btn-primary"
      >
        {saved ? t('profileSaved') : saving ? '…' : t('profileSave')}
      </button>
    </div>
  );
}
