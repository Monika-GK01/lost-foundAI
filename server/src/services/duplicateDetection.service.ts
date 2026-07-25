import { LostItem } from '../models/LostItem';
import { FoundItem } from '../models/FoundItem';
import { logger } from '../utils/logger';

export interface DuplicateCandidate {
  id: string;
  title: string;
  category: string;
  similarity: number;
  reasons: string[];
}

/**
 * Simple text similarity using normalized Levenshtein distance.
 */
function textSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;

  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Check if two dates are within a given number of days.
 */
function dateProximity(d1: Date, d2: Date, maxDays: number): boolean {
  const diffMs = Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
  return diffMs <= maxDays * 24 * 60 * 60 * 1000;
}

interface DuplicateCheckInput {
  title: string;
  category: string;
  brand?: string;
  color?: string;
  date?: string;
  collegeId: string;
}

/**
 * Detects potential duplicate lost items in the same college.
 */
export async function checkLostItemDuplicates(input: DuplicateCheckInput): Promise<DuplicateCandidate[]> {
  const candidates: DuplicateCandidate[] = [];

  const existingItems = await LostItem.find({
    college: input.collegeId,
    isDeleted: false,
    category: input.category,
  })
    .select('title category brand color dateLost')
    .limit(50)
    .lean();

  for (const item of existingItems) {
    const reasons: string[] = [];
    let score = 0;

    // Title similarity (weight: 0.4)
    const titleSim = textSimilarity(input.title, item.title);
    if (titleSim > 0.5) {
      score += titleSim * 0.4;
      reasons.push(`Similar title (${Math.round(titleSim * 100)}% match)`);
    }

    // Category match (weight: 0.25)
    if (input.category === item.category) {
      score += 0.25;
      reasons.push('Same category');
    }

    // Brand match (weight: 0.15)
    if (input.brand && item.brand && input.brand.toLowerCase() === item.brand.toLowerCase()) {
      score += 0.15;
      reasons.push('Same brand');
    }

    // Color match (weight: 0.1)
    if (input.color && item.color && input.color.toLowerCase() === item.color.toLowerCase()) {
      score += 0.1;
      reasons.push('Same color');
    }

    // Date proximity (weight: 0.1)
    if (input.date && item.dateLost && dateProximity(new Date(input.date), item.dateLost, 7)) {
      score += 0.1;
      reasons.push('Reported within 7 days');
    }

    if (score >= 0.4) {
      candidates.push({
        id: (item._id as any).toString(),
        title: item.title,
        category: item.category,
        similarity: Math.round(score * 100) / 100,
        reasons,
      });
    }
  }

  candidates.sort((a, b) => b.similarity - a.similarity);
  logger.debug(`Duplicate check (lost): ${candidates.length} candidates found for "${input.title}"`);
  return candidates.slice(0, 5);
}

/**
 * Detects potential duplicate found items in the same college.
 */
export async function checkFoundItemDuplicates(input: DuplicateCheckInput): Promise<DuplicateCandidate[]> {
  const candidates: DuplicateCandidate[] = [];

  const existingItems = await FoundItem.find({
    college: input.collegeId,
    isDeleted: false,
    category: input.category,
  })
    .select('title category brand color dateFound')
    .limit(50)
    .lean();

  for (const item of existingItems) {
    const reasons: string[] = [];
    let score = 0;

    const titleSim = textSimilarity(input.title, item.title);
    if (titleSim > 0.5) {
      score += titleSim * 0.4;
      reasons.push(`Similar title (${Math.round(titleSim * 100)}% match)`);
    }

    if (input.category === item.category) {
      score += 0.25;
      reasons.push('Same category');
    }

    if (input.brand && item.brand && input.brand.toLowerCase() === item.brand.toLowerCase()) {
      score += 0.15;
      reasons.push('Same brand');
    }

    if (input.color && item.color && input.color.toLowerCase() === item.color.toLowerCase()) {
      score += 0.1;
      reasons.push('Same color');
    }

    if (input.date && item.dateFound && dateProximity(new Date(input.date), item.dateFound, 7)) {
      score += 0.1;
      reasons.push('Reported within 7 days');
    }

    if (score >= 0.4) {
      candidates.push({
        id: (item._id as any).toString(),
        title: item.title,
        category: item.category,
        similarity: Math.round(score * 100) / 100,
        reasons,
      });
    }
  }

  candidates.sort((a, b) => b.similarity - a.similarity);
  logger.debug(`Duplicate check (found): ${candidates.length} candidates found for "${input.title}"`);
  return candidates.slice(0, 5);
}

