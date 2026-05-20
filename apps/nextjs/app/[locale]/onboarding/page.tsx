import { setRequestLocale } from 'next-intl/server';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <OnboardingWizard />;
}
