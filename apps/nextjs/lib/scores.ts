import prisma from './prisma';
import type { ScoreValue } from './score-types';

export type { ScoreValue };

export async function getCityScores(cityId: string): Promise<ScoreValue[]> {
  const rows = await prisma.cityLifestyle.findMany({
    where: { cityId },
    orderBy: { category: 'asc' },
  });

  return rows.map((r) => ({
    category: r.category,
    score: r.score,
    confidence: r.confidence,
    source: r.source,
    footnote: r.sourceFootnote ?? null,
  }));
}

export async function getCityScore(cityId: string, category: string): Promise<ScoreValue | null> {
  const row = await prisma.cityLifestyle.findFirst({
    where: { cityId, category },
  });
  if (!row) return null;
  return {
    category: row.category,
    score: row.score,
    confidence: row.confidence,
    source: row.source,
    footnote: row.sourceFootnote ?? null,
  };
}
