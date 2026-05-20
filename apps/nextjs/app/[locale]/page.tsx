import { setRequestLocale } from 'next-intl/server';
import Calculator from '@/components/calculator/Calculator';

export default function CalculatorPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <Calculator />;
}
