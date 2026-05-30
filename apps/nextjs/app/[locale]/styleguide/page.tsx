import { setRequestLocale } from 'next-intl/server';
import { StyleguideClient } from '@/components/styleguide/StyleguideClient';

export const metadata = {
  title: 'Styleguide — paymap.io',
  robots: { index: false, follow: false },
};

export default function StyleguidePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <StyleguideClient />;
}
