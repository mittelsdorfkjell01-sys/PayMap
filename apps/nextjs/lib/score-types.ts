import { SCORE_CAT } from './score-categories';

export const SCORE_CATEGORIES = Object.values(SCORE_CAT);
export type ScoreCategory = (typeof SCORE_CATEGORIES)[number];

export interface ScoreValue {
  category: string;
  score: number | null;
  confidence: number;
  source: string;
  footnote: string | null;
}
