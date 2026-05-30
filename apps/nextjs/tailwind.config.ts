import type { Config } from 'tailwindcss';

/**
 * paymap.io Design-System — Token-Mapping (Spec §4).
 * Komponenten verwenden NUR diese Token-Klassen (z.B. text-text-2,
 * border-line, rounded-lg, shadow-float). Keine Tailwind-Default-
 * Farben (text-gray-500, shadow-lg, rounded-2xl) im öffentlichen UI.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-sub': 'var(--surface-sub)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        'line-soft': 'var(--line-soft)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        focus: 'var(--focus)',
        pos: 'var(--pos)',
        neg: 'var(--neg)',
        warn: 'var(--warn)',

        // DEPRECATED: Salbei-/Brand-Grün aus dem alten Endkonzept.
        // Nur noch übergangsweise vorhanden, damit noch nicht migrierte
        // Feature-Seiten nicht farblos werden. Bei der Feature-Migration
        // (§11.6) ersatzlos entfernen.
        brand: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '14px',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
      },
      boxShadow: {
        float: 'var(--shadow)',
      },
      maxWidth: {
        content: '1120px',
        reading: '680px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      fontSize: {
        // Typo-Skala (§2): [Größe, line-height]
        display: ['44px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '300' }],
        h1: ['30px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '400' }],
        h2: ['22px', { lineHeight: '1.25', fontWeight: '400' }],
        h3: ['17px', { lineHeight: '1.35', fontWeight: '500' }],
        body: ['15px', { lineHeight: '1.55' }],
        sm: ['13px', { lineHeight: '1.5' }],
        caption: ['11px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'data-xl': ['34px', { lineHeight: '1.1' }],
        'data-md': ['18px', { lineHeight: '1.2' }],
        'data-sm': ['13px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};

export default config;
