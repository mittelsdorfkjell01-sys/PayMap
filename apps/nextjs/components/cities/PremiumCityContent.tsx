'use client';

import { useState } from 'react';
import { DistrictMapGeneric } from '@/components/cities/_shared/DistrictMapGeneric';
import { RentComparisonChart } from '@/components/cities/_shared/RentComparisonChart';
import { FeedbackButton } from '@/components/community/FeedbackButton';
import { QnA } from '@/components/community/QnA';
import { FirstMonthBudgetCalculator } from '@/components/tools/FirstMonthBudgetCalculator';
import { IFICIEligibilityChecker } from '@/components/tools/IFICIEligibilityChecker';
import { BeckhamLawEligibilityChecker } from '@/components/tools/BeckhamLawEligibilityChecker';
import type { PremiumCityData, DistrictWithCoL } from '@/lib/premium-city-data';

type Props = {
  data: PremiumCityData;
  citySlug: string;
  locale?: string;
};

const NARRATIVE_LABELS: Record<string, { de: string; en: string }> = {
  intro:               { de: 'Überblick', en: 'Overview' },
  for_freelancers:     { de: 'Freelancer', en: 'Freelancers' },
  for_families:        { de: 'Familien', en: 'Families' },
  for_retirees:        { de: 'Rentner', en: 'Retirees' },
  for_employees:       { de: 'Angestellte', en: 'Employees' },
  for_tech_workers:    { de: 'Tech-Worker', en: 'Tech Workers' },
  for_crypto_investors: { de: 'Crypto-Investoren', en: 'Crypto Investors' },
};

const RESOURCE_TYPE_ICONS: Record<string, string> = {
  checklist: '✓',
  glossary:  '📖',
  template:  '📄',
  directory: '📋',
  cheatsheet: '⚡',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-outline-variant/40 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-surface-container/50 hover:bg-surface-container transition-colors text-left"
      >
        <span className="flex-1 text-label-lg font-bold text-on-surface uppercase tracking-wider">{title}</span>
        <span className="text-on-surface-variant text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 py-5 bg-surface space-y-4">{children}</div>}
    </div>
  );
}

function DistrictsSection({ districts, locale }: { districts: DistrictWithCoL[]; locale: string }) {
  const rentRows = districts.map(d => {
    const col = d.costOfLiving;
    const get = (cat: string) => col.find(c => c.category === cat)?.value ?? 0;
    return {
      nameDE: d.nameDE,
      nameEN: d.nameEN,
      rent1BR: get('rent_1br_center'),
      rent2BR: get('rent_2br_center'),
      rent3BR: get('rent_3br_center') || undefined,
    };
  }).filter(r => r.rent1BR > 0);

  const mapDistricts = districts.map(d => ({
    slug: d.slug,
    nameDE: d.nameDE,
    nameEN: d.nameEN,
    priceLevel: d.priceLevel,
    vibe: d.vibe,
    descriptionDE: d.descriptionDE,
    descriptionEN: d.descriptionEN,
    latitude: d.latitude,
    longitude: d.longitude,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
          {locale === 'de' ? 'Stadtteil-Karte' : 'District Map'}
        </p>
        <DistrictMapGeneric districts={mapDistricts} locale={locale} />
      </div>
      {rentRows.length > 0 && (
        <div>
          <p className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            {locale === 'de' ? 'Mietpreise im Vergleich' : 'Rent Comparison'}
          </p>
          <RentComparisonChart rows={rentRows} currency="EUR" locale={locale} source="Idealista Q1 2026" />
        </div>
      )}
    </div>
  );
}

function NarrativesSection({ narratives, locale }: { narratives: PremiumCityData['narratives']; locale: string }) {
  const [activeSection, setActiveSection] = useState(narratives[0]?.section ?? '');
  const active = narratives.find(n => n.section === activeSection);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {narratives.map(n => {
          const label = NARRATIVE_LABELS[n.section] ?? { de: n.section, en: n.section };
          return (
            <button key={n.section} onClick={() => setActiveSection(n.section)}
              className={`px-3.5 py-1.5 rounded-full text-label-sm font-semibold transition-colors ${activeSection === n.section ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
              {locale === 'de' ? label.de : label.en}
            </button>
          );
        })}
      </div>
      {active && (
        <div className="space-y-3">
          <h3 className="font-bold text-on-surface text-lg">
            {locale === 'de' ? active.titleDE : active.titleEN}
          </h3>
          <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed whitespace-pre-line">
            {locale === 'de' ? active.contentDE : active.contentEN}
          </div>
          {active.sourceUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {active.sourceUrls.map((url, i) => {
                try {
                  const host = new URL(url).hostname.replace('www.', '');
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-label-sm text-primary underline underline-offset-2 hover:text-primary/80">
                      🔗 {host}
                    </a>
                  );
                } catch {
                  return null;
                }
              })}
            </div>
          )}
          {active.lastVerified && (
            <p className="text-label-sm text-on-surface-variant">
              {locale === 'de' ? 'Geprüft' : 'Verified'}: {new Date(active.lastVerified).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ToolsSection({ tools, citySlug, locale }: { tools: PremiumCityData['tools']; citySlug: string; locale: string }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tools.map(tool => (
          <button key={tool.toolType} onClick={() => setActiveTool(activeTool === tool.toolType ? null : tool.toolType)}
            className={`px-3.5 py-1.5 rounded-full text-label-sm font-semibold transition-colors ${activeTool === tool.toolType ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
            {locale === 'de' ? tool.nameDE : tool.nameEN}
          </button>
        ))}
      </div>
      {tools.map(tool => {
        if (activeTool !== tool.toolType) return null;
        const config = tool.config as Record<string, unknown>;
        if (tool.toolType === 'first_month_budget') {
          return (
            <FirstMonthBudgetCalculator
              key={tool.toolType}
              config={config as Parameters<typeof FirstMonthBudgetCalculator>[0]['config']}
              locale={locale}
            />
          );
        }
        if (tool.toolType === 'visa_eligibility') {
          const regime = (config.regime as string | undefined) ?? '';
          if (regime === 'IFICI' || citySlug === 'lissabon' || citySlug === 'porto') {
            return <IFICIEligibilityChecker key={tool.toolType} locale={locale} />;
          }
          if (regime === 'BeckhamLaw' || citySlug === 'madrid' || citySlug === 'barcelona') {
            return <BeckhamLawEligibilityChecker key={tool.toolType} locale={locale} />;
          }
        }
        return (
          <div key={tool.toolType} className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
            <p className="font-medium mb-1">{locale === 'de' ? tool.nameDE : tool.nameEN}</p>
            <p>{locale === 'de' ? tool.descriptionDE : tool.descriptionEN}</p>
          </div>
        );
      })}
    </div>
  );
}

function ResourcesSection({ resources, locale }: { resources: PremiumCityData['resources']; locale: string }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {resources.map(r => {
        const isOpen = openId === r.id;
        const icon = RESOURCE_TYPE_ICONS[r.resourceType] ?? '📎';
        const content = r.content as Record<string, unknown>;
        return (
          <div key={r.id} className="rounded-xl border border-outline-variant/40 overflow-hidden">
            <button onClick={() => setOpenId(isOpen ? null : r.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-container/50 transition-colors">
              <span className="text-lg">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-on-surface">{locale === 'de' ? r.titleDE : r.titleEN}</p>
                {(r.descriptionDE || r.descriptionEN) && (
                  <p className="text-xs text-on-surface-variant truncate">
                    {locale === 'de' ? r.descriptionDE : r.descriptionEN}
                  </p>
                )}
              </div>
              <span className="text-on-surface-variant text-sm shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-outline-variant/20 space-y-3">
                <ResourceContent content={content} resourceType={r.resourceType} locale={locale} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResourceContent({ content, resourceType, locale }: { content: Record<string, unknown>; resourceType: string; locale: string }) {
  const t = (de: string, en: string) => locale === 'de' ? de : en;

  if (resourceType === 'checklist' && Array.isArray((content as { sections?: unknown[] }).sections)) {
    const sections = (content as { sections: { titleDE: string; titleEN: string; items: { de: string; en: string }[] }[] }).sections;
    return (
      <div className="space-y-4">
        {sections.map((sec, si) => (
          <div key={si}>
            <p className="font-semibold text-sm text-on-surface mb-2">{t(sec.titleDE, sec.titleEN)}</p>
            <ul className="space-y-1.5">
              {sec.items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2 text-sm text-on-surface-variant">
                  <span className="text-primary mt-0.5 shrink-0">□</span>
                  <span>{t(item.de, item.en)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (resourceType === 'glossary' && Array.isArray((content as { entries?: unknown[] }).entries)) {
    const entries = (content as { entries: { de: string; en: string; es?: string; note?: string }[] }).entries;
    return (
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div key={i} className="text-sm">
            <span className="font-semibold text-on-surface">{t(e.de, e.en)}</span>
            {e.es && <span className="text-primary ml-2">→ {e.es}</span>}
            {e.note && <span className="text-on-surface-variant ml-2 text-xs">({e.note})</span>}
          </div>
        ))}
      </div>
    );
  }

  if (resourceType === 'directory' && Array.isArray((content as { entries?: unknown[] }).entries)) {
    const entries = (content as { entries: { name: string; description: string; url?: string; address?: string }[] }).entries;
    return (
      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="text-sm">
            <p className="font-semibold text-on-surface">{e.name}</p>
            <p className="text-on-surface-variant text-xs">{e.description}</p>
            {e.address && <p className="text-xs text-on-surface-variant">{e.address}</p>}
            {e.url && (
              <a href={e.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary underline underline-offset-2 hover:text-primary/80">
                {e.url.replace('https://', '').replace('http://', '')}
              </a>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (resourceType === 'template' && (content as { template?: unknown }).template) {
    const tmpl = (content as { template: { de: string; en: string }; note?: string });
    return (
      <div className="space-y-2">
        <pre className="text-xs bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-gray-700 leading-relaxed overflow-auto">
          {t(tmpl.template.de, tmpl.template.en)}
        </pre>
        {tmpl.note && <p className="text-xs text-on-surface-variant">{tmpl.note}</p>}
      </div>
    );
  }

  return (
    <pre className="text-xs text-on-surface-variant whitespace-pre-wrap overflow-auto max-h-64">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

function TestimonialsSection({ testimonials, locale }: { testimonials: PremiumCityData['testimonials']; locale: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const t = (de: string, en: string) => locale === 'de' ? de : en;

  return (
    <div className="space-y-3">
      {testimonials.map(test => {
        const isOpen = openId === test.id;
        const preview = (locale === 'de' ? test.contentDE : test.contentEN).slice(0, 160) + '…';
        return (
          <div key={test.id} className="rounded-xl border border-outline-variant/40 overflow-hidden">
            <button onClick={() => setOpenId(isOpen ? null : test.id)}
              className="w-full px-4 py-3.5 text-left hover:bg-surface-container/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-on-surface">{test.authorName}</span>
                    {test.authorAge && <span className="text-xs text-on-surface-variant">{test.authorAge} J.</span>}
                    {test.authorProfession && <span className="text-xs text-on-surface-variant">· {test.authorProfession}</span>}
                    <span className="text-xs text-on-surface-variant">· {t('seit', 'since')} {test.yearMoved}</span>
                    {!test.isVerified && (
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        {t('konstruierte Persona', 'constructed persona')}
                      </span>
                    )}
                  </div>
                  {!isOpen && <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{preview}</p>}
                </div>
                <span className="text-on-surface-variant text-sm shrink-0 mt-0.5">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-outline-variant/20 pt-3">
                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {locale === 'de' ? test.contentDE : test.contentEN}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const MADRID_QNA = [
  {
    questionDE: 'Wie lange dauert der NIE-Termin in Madrid?',
    questionEN: 'How long does the NIE appointment take in Madrid?',
    answerDE: 'Die Wartezeit für einen NIE-Termin in Madrid liegt typischerweise bei 4–8 Wochen. Termin buchbar über sede.administracion.gob.es. Tipp: Buche den Termin bereits von Deutschland aus, bevor du umziehst.',
    answerEN: 'The waiting time for a NIE appointment in Madrid is typically 4–8 weeks. Appointments bookable via sede.administracion.gob.es. Tip: Book the appointment from Germany before you move.',
  },
  {
    questionDE: 'Kann ich das Beckham-Gesetz auch als Freelancer nutzen?',
    questionEN: 'Can I use the Beckham Law as a freelancer?',
    answerDE: 'Seit der Reform 2023 können auch Autónomos das Beckham-Regime nutzen, sofern sie mind. 80% ihrer Einkünfte aus ausländischen Quellen beziehen. Der Antrag muss innerhalb von 6 Monaten nach Wohnsitznahme bei der Agencia Tributaria gestellt werden.',
    answerEN: 'Since the 2023 reform, Autónomos can also use the Beckham Law, provided they earn at least 80% of their income from foreign sources. The application must be submitted within 6 months of taking up residence at the Agencia Tributaria.',
  },
  {
    questionDE: 'Welche spanische Bank eignet sich am besten für Neuankömmlinge?',
    questionEN: 'Which Spanish bank is best suited for newcomers?',
    answerDE: 'BBVA und Santander haben gut zugängliche Konten für Neuresident*innen — sie akzeptieren ausländische Einkommensnachweise. N26 oder Revolut als Übergangslösung, bis der NIE vorliegt. Ein Konto ist ohne NIE schwierig zu eröffnen.',
    answerEN: 'BBVA and Santander have well-accessible accounts for new residents — they accept foreign income documents. N26 or Revolut as a bridging solution until the NIE is available. A regular bank account is difficult to open without a NIE.',
  },
  {
    questionDE: 'Wie angespannt ist der Wohnungsmarkt in Madrid wirklich?',
    questionEN: 'How tight is the Madrid housing market really?',
    answerDE: 'Die Nachfrage übersteigt das Angebot erheblich. Realistische Vorlaufzeit: 4–8 Wochen für die Wohnungssuche. Viele Vermieter verlangen Gehaltsabrechnungen der letzten 3 Monate — für Neuankömmlinge oft ein Problem. Lösung: Gesicherter Mietvorschuss (2–3 Monate) oder ein Bürge.',
    answerEN: 'Demand significantly exceeds supply. Realistic lead time: 4–8 weeks for the apartment search. Many landlords require the last 3 months\' payslips — often a problem for newcomers. Solution: secured rent advance (2–3 months) or a guarantor.',
  },
];

const CITY_QNA: Record<string, typeof MADRID_QNA> = {
  madrid: MADRID_QNA,
};

export function PremiumCityContent({ data, citySlug, locale = 'de' }: Props) {
  const t = (de: string, en: string) => locale === 'de' ? de : en;
  const qna = CITY_QNA[citySlug] ?? [];

  return (
    <div className="space-y-6">
      {/* Divider */}
      <div className="border-t border-outline-variant/30 pt-2">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
          {t('Premium-Inhalte', 'Premium Content')}
        </p>
      </div>

      {/* Districts */}
      {data.districts.length > 0 && (
        <Section title={t('Stadtteile', 'Neighbourhoods')}>
          <DistrictsSection districts={data.districts} locale={locale} />
        </Section>
      )}

      {/* Narratives */}
      {data.narratives.length > 0 && (
        <Section title={t('Tiefe Guides', 'In-Depth Guides')}>
          <NarrativesSection narratives={data.narratives} locale={locale} />
        </Section>
      )}

      {/* Tools */}
      {data.tools.length > 0 && (
        <Section title={t('Interaktive Tools', 'Interactive Tools')}>
          <ToolsSection tools={data.tools} citySlug={citySlug} locale={locale} />
        </Section>
      )}

      {/* Resources */}
      {data.resources.length > 0 && (
        <Section title={t('Ressourcen-Bibliothek', 'Resource Library')}>
          <ResourcesSection resources={data.resources} locale={locale} />
        </Section>
      )}

      {/* Testimonials */}
      {data.testimonials.length > 0 && (
        <Section title={t('Erfahrungsberichte', 'Testimonials')}>
          <TestimonialsSection testimonials={data.testimonials} locale={locale} />
        </Section>
      )}

      {/* Q&A */}
      {qna.length > 0 && (
        <Section title={t('Häufige Fragen', 'Frequently Asked Questions')}>
          <QnA items={qna} locale={locale} />
        </Section>
      )}

      {/* Feedback */}
      <div className="flex justify-end">
        <FeedbackButton citySlug={citySlug} locale={locale} />
      </div>
    </div>
  );
}
