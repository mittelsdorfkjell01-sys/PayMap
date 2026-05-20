import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AuthProvider } from '@/lib/auth';
import { AuthModal } from '@/components/auth/AuthModal';
import Nav from '@/components/nav/Nav';
import '../globals.css';

const locales = ['de', 'en'];

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
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Nav />
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
            <AuthModal />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
