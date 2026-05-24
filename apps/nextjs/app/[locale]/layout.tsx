import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AuthProvider } from '@/lib/auth';
import { AuthModal } from '@/components/auth/AuthModal';
import Nav from '@/components/nav/Nav';
import { Footer } from '@/components/nav/Footer';
import '../globals.css';

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://paymap.io').replace(/\/$/, '');

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PayMap',
  url: BASE,
  applicationCategory: 'FinanceApplication',
  description: 'Compare net salaries across cities after local taxes and social contributions.',
  operatingSystem: 'Web',
};

const locales = ['de', 'en'];

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://paymap.io'),
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Nav />
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
            <Footer />
            <AuthModal />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
