import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { calculateApproximate } from '@paymap/tax-engine';
import { prisma } from '@/lib/prisma';
import { toEUR, fromEUR } from '@/lib/exchange-rates';
import { TOP_PAIRS } from '@/lib/seo/top-pairs';
import { isPremiumCity } from '@/lib/premium-content';
import { toEnSlug } from '@/lib/city-guide-slugs';

export const revalidate = 86400;
export const dynamicParams = true;

const SALARY_LEVELS = [40_000, 60_000, 80_000, 120_000];
const LOCALES = ['de', 'en'] as const;

export function generateStaticParams() {
  return TOP_PAIRS.flatMap(({ from, to }) =>
    LOCALES.map((locale) => ({ locale, from, to })),
  );
}

type Props = { params: { locale: string; from: string; to: string } };

async function getPageData(fromSlug: string, toSlug: string, locale: string) {
  const year = new Date().getFullYear();

  const [fromCity, toCity] = await Promise.all([
    prisma.city.findUnique({
      where: { slug: fromSlug },
      include: { country: { select: { slug: true, nameDE: true, nameEN: true } } },
    }),
    prisma.city.findUnique({
      where: { slug: toSlug },
      include: { country: { select: { id: true, slug: true, nameDE: true, nameEN: true } } },
    }),
  ]);

  if (!fromCity || !toCity || !fromCity.country || !toCity.country) return null;

  const specialRegimes = await prisma.specialRegime.findMany({
    where: { countryId: toCity.country.id },
    select: { nameDE: true, nameEN: true, flatRate: true, durationYears: true, conditionsDE: true, conditionsEN: true },
  });

  const rows = await Promise.all(
    SALARY_LEVELS.map(async (eurGross) => {
      const [fromGross, toGross] = await Promise.all([
        fromEUR(eurGross, fromCity.currency ?? 'EUR'),
        fromEUR(eurGross, toCity.currency ?? 'EUR'),
      ]);

      let fromNetMonthly = 0;
      let toNetMonthly = 0;
      let fromRate = 0;
      let toRate = 0;

      try {
        const r = calculateApproximate(fromCity.country!.slug, fromGross, fromCity.currency ?? 'EUR', year, locale as 'de' | 'en');
        fromNetMonthly = await toEUR(r.netMonthly, fromCity.currency ?? 'EUR');
        fromRate = r.effectiveRate;
      } catch { /* unsupported country */ }

      try {
        const r = calculateApproximate(toCity.country!.slug, toGross, toCity.currency ?? 'EUR', year, locale as 'de' | 'en');
        toNetMonthly = await toEUR(r.netMonthly, toCity.currency ?? 'EUR');
        toRate = r.effectiveRate;
      } catch { /* unsupported country */ }

      return {
        eurGross,
        fromNetEUR: Math.round(fromNetMonthly),
        toNetEUR: Math.round(toNetMonthly),
        diffEUR: Math.round(toNetMonthly - fromNetMonthly),
        fromRate: Math.round(fromRate * 1000) / 10,
        toRate: Math.round(toRate * 1000) / 10,
      };
    }),
  );

  return { fromCity, toCity, rows, specialRegimes, year };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  setRequestLocale(params.locale);
  const data = await getPageData(params.from, params.to, params.locale);
  if (!data) return {};

  const { fromCity, toCity, rows, year } = data;
  const isDE = params.locale === 'de';
  const fromName = isDE ? (fromCity.nameDE ?? fromCity.slug) : (fromCity.nameEN ?? fromCity.slug);
  const toName = isDE ? (toCity.nameDE ?? toCity.slug) : (toCity.nameEN ?? toCity.slug);

  const row80k = rows.find((r) => r.eurGross === 80_000);
  const diff = row80k?.diffEUR ?? 0;
  const diffStr = diff >= 0 ? `+${diff.toLocaleString('de-DE')} €` : `${diff.toLocaleString('de-DE')} €`;

  const title = isDE
    ? `${fromName} → ${toName}: Netto-Vergleich ${year}`
    : `${fromName} → ${toName}: Net Salary Comparison ${year}`;

  const description = isDE
    ? `Netto-Vergleich ${fromName} vs. ${toName} – bei 80.000 € Brutto: ${diffStr} Unterschied/Monat. Effektiver Steuersatz in ${toName}: ${row80k?.toRate ?? 0} %. Daten ${year}.`
    : `Net salary comparison ${fromName} vs. ${toName} – at €80,000 gross: ${diffStr} difference/month. Effective tax rate in ${toName}: ${row80k?.toRate ?? 0}%. Data ${year}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/og/vergleich/${params.from}/${params.to}`, width: 1200, height: 630 }],
    },
  };
}

function fmt(n: number) {
  return n.toLocaleString('de-DE');
}

function DiffCell({ diff }: { diff: number }) {
  const pos = diff >= 0;
  return (
    <span className={`font-mono font-semibold ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? '+' : ''}{fmt(diff)} €
    </span>
  );
}

export default async function ComparisonPage({ params }: Props) {
  setRequestLocale(params.locale);
  const data = await getPageData(params.from, params.to, params.locale);
  if (!data) notFound();

  const { fromCity, toCity, rows, specialRegimes, year } = data;
  const isDE = params.locale === 'de';

  const fromName = isDE ? (fromCity.nameDE ?? fromCity.slug) : (fromCity.nameEN ?? fromCity.slug);
  const toName   = isDE ? (toCity.nameDE   ?? toCity.slug)   : (toCity.nameEN   ?? toCity.slug);
  const row80k   = rows.find((r) => r.eurGross === 80_000)!;
  const diff80k  = row80k.diffEUR;
  const diffStr  = diff80k >= 0 ? `+${fmt(diff80k)} €` : `${fmt(diff80k)} €`;

  const faqs = isDE
    ? [
        {
          q: `Was bleibt netto in ${toName} bei 80.000 € Brutto?`,
          a: `Bei 80.000 € Jahresbrutto (Standardannahmen: angestellt, ledig, keine Kinder) bleiben in ${toName} ca. ${fmt(row80k.toNetEUR)} €/Monat netto. In ${fromName} sind es ca. ${fmt(row80k.fromNetEUR)} €/Monat – eine monatliche Differenz von ${diffStr}.`,
        },
        {
          q: `Wie hoch ist der Steuersatz in ${toName}?`,
          a: `Der effektive Steuersatz in ${toName} liegt bei 80.000 € Brutto bei ca. ${row80k.toRate} %. In ${fromName} sind es ca. ${row80k.fromRate} % effektiv.`,
        },
        {
          q: `Lohnt sich ein Umzug von ${fromName} nach ${toName}?`,
          a: `Bei 80.000 € Brutto beträgt die monatliche Nettodifferenz ${diffStr}. Ob sich ein Umzug lohnt, hängt zusätzlich von Lebenshaltungskosten, Wohnkosten und persönlichen Umständen ab.`,
        },
        {
          q: `Welche Steuern zahlen Arbeitnehmer in ${toName}?`,
          a: `In ${toName} (${toCity.country!.nameDE ?? ''}) fallen Einkommensteuer und Sozialversicherungsbeiträge an. Die genaue Belastung hängt von Gehalt, Familienstand und weiteren Faktoren ab.`,
        },
      ]
    : [
        {
          q: `What is the net salary in ${toName} with €80,000 gross?`,
          a: `With €80,000 annual gross (employed, single, no children), you take home approx. €${fmt(row80k.toNetEUR)}/month in ${toName}. In ${fromName} it's approx. €${fmt(row80k.fromNetEUR)}/month – a monthly difference of ${diffStr}.`,
        },
        {
          q: `What is the effective tax rate in ${toName}?`,
          a: `The effective tax rate in ${toName} at €80,000 gross is approx. ${row80k.toRate}%. In ${fromName} it is approx. ${row80k.fromRate}%.`,
        },
        {
          q: `Is it financially worth moving from ${fromName} to ${toName}?`,
          a: `At €80,000 gross, the monthly net difference is ${diffStr}. Whether the move is worthwhile also depends on cost of living, housing costs, and personal circumstances.`,
        },
        {
          q: `What taxes do employees pay in ${toName}?`,
          a: `In ${toName} (${toCity.country!.nameEN ?? ''}), employees pay income tax plus social security contributions. The exact burden depends on salary, marital status, and other factors.`,
        },
      ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-3xl mx-auto space-y-10 py-6">
        {/* H1 */}
        <div>
          <h1 className="text-3xl font-bold text-on-background">
            {fromCity.flag} {fromName} → {toCity.flag} {toName}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 uppercase tracking-wider">
            {isDE ? `Netto-Vergleich ${year}` : `Net Salary Comparison ${year}`}
          </p>
        </div>

        {/* Intro */}
        <p className="text-base text-on-surface-variant leading-relaxed">
          {isDE
            ? `Bei 80.000 € Jahresbrutto beträgt die monatliche Nettodifferenz zwischen ${fromName} und ${toName}: ${diffStr}. ${fromCity.flag} ${fromName}: effektiv ${row80k.fromRate} % Steuerlast. ${toCity.flag} ${toName}: effektiv ${row80k.toRate} % Steuerlast. Alle Werte basieren auf dem Standardfall (angestellt, ledig, keine Kinder), ${year}.`
            : `At €80,000 annual gross, the monthly net difference between ${fromName} and ${toName} is ${diffStr}. ${fromCity.flag} ${fromName}: effective tax rate ${row80k.fromRate}%. ${toCity.flag} ${toName}: effective tax rate ${row80k.toRate}%. All values are based on the standard case (employed, single, no children), ${year}.`
          }
        </p>

        {/* Salary table */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            {isDE ? 'Gehaltsvergleich' : 'Salary Comparison'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-outline-variant rounded-xl overflow-hidden">
              <thead className="bg-surface-container text-on-surface-variant">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">
                    {isDE ? 'Brutto/Jahr' : 'Gross/Year'}
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    {fromCity.flag} {isDE ? 'Netto/Mo' : 'Net/Mo'}
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    {toCity.flag} {isDE ? 'Netto/Mo' : 'Net/Mo'}
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    {isDE ? 'Differenz' : 'Difference'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.eurGross} className={i % 2 === 1 ? 'bg-surface-container/30' : ''}>
                    <td className="px-4 py-3 font-mono">{fmt(row.eurGross)} €</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(row.fromNetEUR)} €</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(row.toNetEUR)} €</td>
                    <td className="px-4 py-3 text-right">
                      <DiffCell diff={row.diffEUR} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-on-surface-variant mt-2">
            {isDE
              ? `Alle Werte in EUR (gerundet). Annahmen: angestellt, ledig, keine Kinder. Quelle: offizielle Steuertabellen ${year}.`
              : `All values in EUR (rounded). Assumptions: employed, single, no children. Source: official tax tables ${year}.`
            }
          </p>
        </section>

        {/* Special regime */}
        {specialRegimes.length > 0 && (
          <section className="border border-primary/30 bg-primary/5 rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              {isDE ? 'Sondersteuerregime' : 'Special Tax Regime'}
            </h2>
            {specialRegimes.map((r) => (
              <div key={r.nameDE}>
                <p className="font-semibold text-on-background">
                  {isDE ? r.nameDE : r.nameEN}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {isDE ? r.conditionsDE : r.conditionsEN}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {isDE
                    ? `Pauschalsatz: ${r.flatRate} % · Dauer: bis zu ${r.durationYears} Jahre`
                    : `Flat rate: ${r.flatRate}% · Duration: up to ${r.durationYears} years`
                  }
                </p>
              </div>
            ))}
          </section>
        )}

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isDE ? 'Häufige Fragen' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-5">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-base font-semibold text-on-background">{faq.q}</h3>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="border border-outline-variant rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-semibold">
            {isDE ? 'Dein genaues Netto berechnen' : 'Calculate your exact net salary'}
          </p>
          <p className="text-sm text-on-surface-variant">
            {isDE
              ? 'Gib Familienstand und Beschäftigung ein für ein präzises Ergebnis.'
              : 'Enter your family status and employment type for a precise result.'
            }
          </p>
          <a href={`/${params.locale}`} className="inline-block btn-primary mt-2">
            {isDE ? 'Zum Rechner →' : 'Go to Calculator →'}
          </a>
        </div>

        {/* Premium guide cross-link for destination city */}
        {isPremiumCity(params.to) && (
          <div className="border border-primary/30 bg-primary/5 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-on-surface">
                {isDE
                  ? `Schritt-für-Schritt Guide: Auswandern nach ${toName}`
                  : `Step-by-step guide: Emigrate to ${toName}`}
              </p>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {isDE
                  ? 'Bürokratie, Steuern, Banking, Wohnen — alle Schritte geprüft.'
                  : 'Bureaucracy, taxes, banking, housing — all steps verified.'}
              </p>
            </div>
            <a
              href={isDE ? `/de/auswandern/${params.to}` : `/en/emigrate/${toEnSlug(params.to)}`}
              className="shrink-0 text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              {isDE ? 'Zum Guide →' : 'View Guide →'}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
