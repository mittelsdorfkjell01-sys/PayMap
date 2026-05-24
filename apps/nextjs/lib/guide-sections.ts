export const GUIDE_SECTIONS = [
  'bureaucracy',
  'tax_planning',
  'banking',
  'insurance',
  'housing',
  'practical',
  'social',
] as const;

export type GuideSection = (typeof GUIDE_SECTIONS)[number];

export const SECTION_LABELS: Record<GuideSection, { de: string; en: string }> = {
  bureaucracy:  { de: 'Bürokratie & Anmeldung',  en: 'Bureaucracy & Registration' },
  tax_planning: { de: 'Steuerplanung',            en: 'Tax Planning' },
  banking:      { de: 'Banking & Konto',          en: 'Banking & Account' },
  insurance:    { de: 'Versicherungen',           en: 'Insurance' },
  housing:      { de: 'Wohnen',                   en: 'Housing' },
  practical:    { de: 'Praktisches',              en: 'Practical Matters' },
  social:       { de: 'Soziales Leben',           en: 'Social Life' },
};

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];
