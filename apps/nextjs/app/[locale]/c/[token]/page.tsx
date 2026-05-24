import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { ApproximateResult } from '@/components/calculator/ApproximateResult';
import type { CalculateResponse } from '@/components/calculator/Calculator';

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://paymap.io').replace(/\/$/, '');

async function getCalculation(token: string) {
  return prisma.calculation.findFirst({
    where: { shareToken: token, isShared: true },
    include: {
      fromCity: { select: { nameDE: true, nameEN: true, flag: true } },
      toCity: { select: { nameDE: true, nameEN: true, flag: true } },
    },
  });
}

export async function generateMetadata({
  params: { token, locale },
}: {
  params: { token: string; locale: string };
}): Promise<Metadata> {
  const calc = await getCalculation(token);
  if (!calc) return {};

  const data = calc.outputData as unknown as CalculateResponse;
  const fromName = locale === 'de' ? calc.fromCity.nameDE : (calc.fromCity.nameEN ?? calc.fromCity.nameDE);
  const toName = locale === 'de' ? calc.toCity.nameDE : (calc.toCity.nameEN ?? calc.toCity.nameDE);
  const diff = data.monthlyDifference ?? 0;
  const sign = diff >= 0 ? '+' : '';
  const title = `${fromName} → ${toName} | PayMap`;
  const description = `Netto-Vergleich: ${sign}${Math.round(diff)} € / Monat`;
  const ogImage = `${BASE}/og/c/${token}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({
  params: { token, locale },
}: {
  params: { token: string; locale: string };
}) {
  setRequestLocale(locale);

  const calc = await getCalculation(token);
  if (!calc) notFound();

  const data = calc.outputData as unknown as CalculateResponse;
  const fromName = locale === 'de' ? calc.fromCity.nameDE : (calc.fromCity.nameEN ?? calc.fromCity.nameDE);
  const toName = locale === 'de' ? calc.toCity.nameDE : (calc.toCity.nameEN ?? calc.toCity.nameDE);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Vergleich</p>
        <h1 className="text-headline-xl-mobile font-bold text-on-background">
          {calc.fromCity.flag} {fromName} → {calc.toCity.flag} {toName}
        </h1>
      </div>

      {/* Read-only result */}
      <ApproximateResult result={data} />

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Link
          href={`/${locale}`}
          className="btn-primary px-8"
        >
          Eigene Werte vergleichen →
        </Link>
        <p className="text-label-sm text-on-surface-variant">
          Berechne deinen persönlichen Netto-Vergleich auf paymap.io
        </p>
      </div>
    </div>
  );
}
