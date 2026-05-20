import { setRequestLocale } from 'next-intl/server';
import SteuerGuidePage from '@/components/steuer-guide/SteuerGuidePage';

export default function SteuerGuide({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <SteuerGuidePage />;
}
