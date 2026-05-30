'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AuthModal() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { authModalOpen, authModalMode, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [authModalMode, authModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAuthModal();
    }
    if (authModalOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'register' && password !== confirmPassword) {
      setError(t('passwordMismatch') || 'Passwörter stimmen nicht überein');
      return;
    }
    setLoading(true);
    const result =
      mode === 'login'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(mode === 'login' ? t('loginSuccess') : t('registerSuccess'));
      setTimeout(closeAuthModal, 1200);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signInWithGoogle();
    // Redirects away, so no cleanup needed
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(14,14,14,0.4)' }}
      onClick={(e) => { if (e.target === overlayRef.current) closeAuthModal(); }}
    >
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-xl border border-line bg-surface shadow-float">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-h3 text-text">
            {mode === 'login' ? t('login') : t('register')}
          </h2>
          <button
            onClick={closeAuthModal}
            className="focus-ring rounded-md p-1 text-text-3 transition-colors hover:text-text"
            aria-label={tCommon('close')}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {success ? (
            <p className="py-4 text-center text-pos">{success}</p>
          ) : (
            <>
              {/* Google */}
              <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading} className="w-full">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                {t('continueWithGoogle')}
              </Button>

              <div className="flex items-center gap-3 text-caption text-text-3">
                <div className="flex-1 border-t border-line" />
                {t('or') || 'oder'}
                <div className="flex-1 border-t border-line" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-text-2">
                    {t('email')}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-2">
                    {t('password')}
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                    minLength={8}
                  />
                </div>
                {mode === 'register' && (
                  <div>
                    <label className="mb-1 block text-sm text-text-2">
                      {t('confirmPassword')}
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      required
                      minLength={8}
                    />
                  </div>
                )}

                {error && (
                  <p className="rounded-md border border-line bg-surface-sub px-3 py-2 text-sm text-neg">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? '…' : mode === 'login' ? t('login') : t('register')}
                </Button>
              </form>

              {/* Toggle */}
              <p className="text-center text-sm text-text-2">
                {mode === 'login' ? t('noAccount') : t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                  className="focus-ring rounded-sm text-focus hover:underline"
                >
                  {mode === 'login' ? t('register') : t('login')}
                </button>
              </p>

              {mode === 'register' && (
                <p className="text-center text-caption text-text-3">{t('privacyNote')}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
