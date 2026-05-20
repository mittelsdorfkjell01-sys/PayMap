import { setRequestLocale } from 'next-intl/server';
import GuidePage from '@/components/guide/GuidePage';

export default function Guide({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <GuidePage />;
}
