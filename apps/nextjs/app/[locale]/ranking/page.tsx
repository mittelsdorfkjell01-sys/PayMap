import { setRequestLocale } from 'next-intl/server';
import RankingPage from '@/components/ranking/RankingPage';

export default function Ranking({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <RankingPage />;
}
