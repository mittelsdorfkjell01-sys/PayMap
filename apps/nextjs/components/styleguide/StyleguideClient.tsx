'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/Slider';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatusDot, confidenceTone, riskTone } from '@/components/ui/StatusDot';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12 first:border-t-0">
      <h2 className="mb-6 text-h2 text-text">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-6">
      <span className="text-caption uppercase tracking-[0.04em] text-text-3 sm:w-32 sm:shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const swatches: [string, string][] = [
  ['bg', 'var(--bg)'],
  ['surface', 'var(--surface)'],
  ['surface-sub', 'var(--surface-sub)'],
  ['text', 'var(--text)'],
  ['text-2', 'var(--text-2)'],
  ['text-3', 'var(--text-3)'],
  ['accent', 'var(--accent)'],
  ['focus', 'var(--focus)'],
  ['pos', 'var(--pos)'],
  ['warn', 'var(--warn)'],
  ['neg', 'var(--neg)'],
];

const rankingRows = [
  { city: 'Lissabon', country: 'Portugal', net: 4120, score: 88, conf: 92 },
  { city: 'Madrid', country: 'Spanien', net: 3980, score: 81, conf: 80 },
  { city: 'Budapest', country: 'Ungarn', net: 3760, score: 74, conf: 64 },
  { city: 'Zürich', country: 'Schweiz', net: 6240, score: 69, conf: 45 },
];

export function StyleguideClient() {
  const [weight, setWeight] = React.useState(60);
  const [regime, setRegime] = React.useState<'standard' | 'special'>('standard');
  const [tab, setTab] = React.useState<'overview' | 'tax' | 'cost'>('overview');
  const [open, setOpen] = React.useState(false);

  return (
    <div className="py-8">
      <header className="mb-4">
        <p className="text-caption uppercase tracking-[0.04em] text-text-3">paymap.io</p>
        <h1 className="mt-2 text-h1 text-text">Styleguide</h1>
        <p className="mt-2 max-w-reading text-body text-text-2">
          Visuelle Abnahme aller Primitive (Spec §11). Theme-Toggle oben rechts in der
          Navigation für Light/Dark.
        </p>
      </header>

      {/* Typografie */}
      <Section title="Typografie — Geist">
        <div className="space-y-4">
          <p className="text-display text-text">Display 44 / 300</p>
          <p className="text-h1 text-text">Heading 1 — 30 / 400</p>
          <p className="text-h2 text-text">Heading 2 — 22 / 400</p>
          <p className="text-h3 text-text">Heading 3 — 17 / 500</p>
          <p className="text-body text-text">
            Body 15 / 400 — Fließtext für Guides und Erklärungen. Ruhig, lesbar, dünn.
          </p>
          <p className="text-sm text-text-2">Small 13 — Sekundärtext, Hints</p>
          <p className="text-caption text-text-3">Caption 11 — Fußnoten, Quellen</p>
          <div className="flex items-baseline gap-6 pt-2">
            <span className="text-data-xl tabular text-text">4.120 €</span>
            <span className="text-data-md tabular text-text">3.980 €</span>
            <span className="text-data-sm tabular text-text-2">+140 €</span>
          </div>
        </div>
      </Section>

      {/* Farben */}
      <Section title="Tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {swatches.map(([name, value]) => (
            <div key={name} className="overflow-hidden rounded-md border border-line">
              <div className="h-14" style={{ background: value }} />
              <div className="bg-surface px-2 py-1.5">
                <p className="text-caption text-text">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <Row label="Variants">
          <Button>Primary</Button>
          <Button variant="outline">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destruktiv</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="Sizes">
          <Button size="sm">Small 32</Button>
          <Button size="md">Medium 40</Button>
          <Button size="lg">Large 48</Button>
        </Row>
        <Row label="Disabled">
          <Button disabled>Primary</Button>
          <Button variant="outline" disabled>
            Secondary
          </Button>
        </Row>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <div className="grid max-w-reading gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-text-2">Bruttogehalt</span>
            <Input placeholder="z. B. 75.000 €" />
            <span className="mt-1.5 block text-caption text-text-3">Jahresbrutto in EUR</span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text-2">Deaktiviert</span>
            <Input placeholder="nicht editierbar" disabled />
          </label>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-h3 text-text">Statische Card</h3>
            <p className="mt-2 text-body text-text-2">
              Hairline-Border, kein Schatten im Fluss.
            </p>
          </Card>
          <Card className="cursor-pointer p-6 transition-colors duration-150 ease-out hover:border-line-strong hover:bg-surface-sub">
            <h3 className="text-h3 text-text">Interaktive Card</h3>
            <p className="mt-2 text-body text-text-2">
              Hover hebt nur Border + Hintergrund an — keine Bewegung.
            </p>
          </Card>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <Row label="Varianten">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="pos">Ersparnis</Badge>
          <Badge variant="warn">Mittel</Badge>
          <Badge variant="neg">Risiko</Badge>
        </Row>
      </Section>

      {/* Status / Confidence / Risk */}
      <Section title="Confidence & Risiko (§3.3)">
        <div className="space-y-3">
          {[95, 82, 60, 30].map((s) => {
            const { tone, label } = confidenceTone(s);
            return (
              <div key={s} className="flex items-center gap-3">
                <span className="text-data-sm tabular w-8 text-text-2">{s}</span>
                <StatusDot tone={tone} label={label} />
              </div>
            );
          })}
          <div className="flex gap-6 pt-2">
            <StatusDot tone={riskTone('low')} label="low" />
            <StatusDot tone={riskTone('medium')} label="medium" />
            <StatusDot tone={riskTone('high')} label="high" />
          </div>
        </div>
      </Section>

      {/* ScoreBar */}
      <Section title="ScoreBar">
        <div className="max-w-reading space-y-4">
          <ScoreBar value={88} aria-label="Score Lissabon" trailing={<StatusDot tone="pos" />} />
          <ScoreBar value={74} aria-label="Score Budapest" trailing={<StatusDot tone="warn" />} />
          <ScoreBar value={45} aria-label="Score Zürich" trailing={<StatusDot tone="neg" />} />
        </div>
      </Section>

      {/* Slider */}
      <Section title="Slider (Gewichtung)">
        <div className="max-w-reading">
          <Slider label="Netto-Gehalt" value={weight} onChange={setWeight} />
        </div>
      </Section>

      {/* SegmentedControl */}
      <Section title="Segmented Control">
        <SegmentedControl
          aria-label="Steuerregime"
          value={regime}
          onChange={setRegime}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'special', label: 'Sonderregime' },
          ]}
        />
      </Section>

      {/* Tabs */}
      <Section title="Tabs">
        <Tabs
          aria-label="Stadtdetails"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'overview', label: 'Überblick' },
            { value: 'tax', label: 'Steuern' },
            { value: 'cost', label: 'Lebenshaltung' },
          ]}
        />
        <p className="mt-4 text-body text-text-2">Aktiv: {tab}</p>
      </Section>

      {/* Tabelle */}
      <Section title="Tabelle (Ranking)">
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line-strong">
                <th className="px-4 py-2.5 text-caption uppercase tracking-[0.04em] text-text-3">
                  Stadt
                </th>
                <th className="px-4 py-2.5 text-right text-caption uppercase tracking-[0.04em] text-text-3">
                  Netto / Monat
                </th>
                <th className="px-4 py-2.5 text-right text-caption uppercase tracking-[0.04em] text-text-3">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {rankingRows.map((r, i) => (
                <tr key={r.city} className={i % 2 ? 'bg-surface-sub' : ''}>
                  <td className="px-4 py-3">
                    <div className="text-body text-text">{r.city}</div>
                    <div className="text-sm text-text-3">{r.country}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-data-md tabular text-text">
                    {r.net.toLocaleString('de-DE')} €
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-data-sm tabular text-text">{r.score}</span>
                      <StatusDot tone={confidenceTone(r.conf).tone} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Modal */}
      <Section title="Modal / Bottom-Sheet">
        <Button onClick={() => setOpen(true)}>Stadtdetails öffnen</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Lissabon">
          <div className="space-y-4">
            <p className="text-body text-text-2">
              Desktop zentriertes Modal, mobil Bottom-Sheet mit Drag-Handle. Fokus-Trap,
              ESC schließt, Backdrop ohne Blur.
            </p>
            <div className="flex items-baseline gap-3 border-t border-line pt-4">
              <span className="text-data-xl tabular text-text">4.120 €</span>
              <span className="text-data-sm tabular text-pos">+140 €</span>
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Schließen
              </Button>
              <Button onClick={() => setOpen(false)}>Übernehmen</Button>
            </div>
          </div>
        </Modal>
      </Section>
    </div>
  );
}
