'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

// Selektions-Button: aktiv = accent-Border + surface-sub (Spec-konform).
const optionCls = (active: boolean) =>
  cn(
    'focus-ring w-full rounded-md border px-4 py-3.5 text-left text-body transition-colors duration-150 ease-out',
    active ? 'border-accent bg-surface-sub text-text' : 'border-line text-text-2 hover:border-line-strong hover:text-text',
  );

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
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-body text-text-2">{t('loginRequired')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-h1 text-text">{t('profileTitle')}</h1>
        <p className="text-body text-text-2">{t('profileSubtitle')}</p>
      </div>

      <div className="space-y-6 rounded-lg border border-line bg-surface p-6">
        {/* Employment */}
        <div className="space-y-3">
          <p className="block text-sm text-text-2">{t('step2.title')}</p>
          <div className="grid grid-cols-1 gap-2">
            {EMPLOYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, employment: opt.value }))}
                className={optionCls(state.employment === opt.value)}
              >
                {t(opt.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Family status */}
        <div className="space-y-3">
          <p className="block text-sm text-text-2">{t('step3.title')}</p>
          <div className="grid grid-cols-1 gap-2">
            {FAMILY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, familyStatus: opt.value }))}
                className={optionCls(state.familyStatus === opt.value)}
              >
                {t(opt.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="space-y-3">
          <p className="block text-sm text-text-2">{t('step4.title')}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
              disabled={state.children === 0}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line text-text-2 transition-colors hover:border-line-strong hover:text-text disabled:opacity-40"
            >
              −
            </button>
            <span className="w-6 text-center text-data-md tabular text-text">{state.children}</span>
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, children: Math.min(10, prev.children + 1) }))}
              disabled={state.children >= 10}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line text-text-2 transition-colors hover:border-line-strong hover:text-text disabled:opacity-40"
            >
              +
            </button>
            <span className="ml-2 text-sm text-text-2">
              {state.children === 0 ? t('step4.none') : t('step4.count').replace('{n}', String(state.children))}
            </span>
          </div>
        </div>

        {/* KV */}
        <div className="space-y-3">
          <p className="block text-sm text-text-2">{t('step5.title')}</p>
          <div className="grid grid-cols-1 gap-3">
            {KV_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, kvType: opt.value }))}
                className={cn('focus-ring w-full rounded-md border px-4 py-4 text-left transition-colors', state.kvType === opt.value ? 'border-accent bg-surface-sub' : 'border-line hover:border-line-strong')}
              >
                <p className={cn('text-body', state.kvType === opt.value ? 'text-text' : 'text-text-2')}>
                  {t(opt.titleKey as Parameters<typeof t>[0])}
                </p>
                <p className="mt-1 text-caption text-text-3">
                  {t(opt.hintKey as Parameters<typeof t>[0])}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button type="button" onClick={handleSave} disabled={saving} className="w-full">
        {saved ? t('profileSaved') : saving ? '…' : t('profileSave')}
      </Button>
    </div>
  );
}
