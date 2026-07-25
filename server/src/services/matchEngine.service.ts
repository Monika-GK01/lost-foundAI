import { MATCH_WEIGHTS, MATCH_CONFIG } from '../constants';
import { IFoundItem } from '../models';
import { logger } from '../utils/logger';

export interface MatchScoreBreakdown {
  imageScore: number;
  brandScore: number;
  colorScore: number;
  categoryScore: number;
  locationScore: number;
  dateScore: number;
  overallScore: number;
  explanation: string[];
}

export interface RankedMatch {
  foundItem: IFoundItem;
  scores: MatchScoreBreakdown;
}

export interface LostItemData {
  category: string;
  brand: string;
  color: string;
  location: string;
  dateLost: Date;
  embedding: number[];
}

/**
 * Match Engine Service
 * Calculates weighted similarity scores between a lost item and found items.
 */
export class MatchEngineService {
  /**
   * Calculate the full weighted match score between a lost item and a found item.
   */
  calculateMatchScore(
    lostItem: LostItemData,
    foundItem: IFoundItem,
    imageSimilarity: number
  ): MatchScoreBreakdown {
    const brandScore = this.calculateBrandScore(lostItem.brand, foundItem.brand);
    const colorScore = this.calculateColorScore(lostItem.color, foundItem.color);
    const categoryScore = this.calculateCategoryScore(lostItem.category, foundItem.category);
    const locationScore = this.calculateLocationScore(lostItem.location, foundItem.location);
    const dateScore = this.calculateDateProximityScore(lostItem.dateLost, foundItem.dateFound);

    const overallScore =
      imageSimilarity * MATCH_WEIGHTS.IMAGE_SIMILARITY +
      brandScore * MATCH_WEIGHTS.BRAND_MATCH +
      colorScore * MATCH_WEIGHTS.COLOR_MATCH +
      categoryScore * MATCH_WEIGHTS.CATEGORY_MATCH +
      locationScore * MATCH_WEIGHTS.LOCATION_MATCH +
      dateScore * MATCH_WEIGHTS.DATE_PROXIMITY;

    const explanation = this.buildExplanation(
      imageSimilarity,
      brandScore,
      colorScore,
      categoryScore,
      locationScore,
      dateScore
    );

    return {
      imageScore: Math.round(imageSimilarity * 100) / 100,
      brandScore: Math.round(brandScore * 100) / 100,
      colorScore: Math.round(colorScore * 100) / 100,
      categoryScore: Math.round(categoryScore * 100) / 100,
      locationScore: Math.round(locationScore * 100) / 100,
      dateScore: Math.round(dateScore * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
      explanation,
    };
  }

  /**
   * Rank found items against a lost item using pre-computed image similarities.
   */
  rankMatches(
    lostItem: LostItemData,
    foundItems: IFoundItem[],
    imageSimilarities: Map<string, number>
  ): RankedMatch[] {
    const ranked: RankedMatch[] = foundItems.map((foundItem) => {
      const imageSim = imageSimilarities.get(foundItem._id.toString()) || 0;
      const scores = this.calculateMatchScore(lostItem, foundItem, imageSim);
      return { foundItem, scores };
    });

    ranked.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
    return ranked.slice(0, MATCH_CONFIG.DEFAULT_TOP_K);
  }

  private calculateBrandScore(lostBrand: string, foundBrand: string): number {
    if (!lostBrand || !foundBrand) return 0;
    const a = lostBrand.toLowerCase().trim();
    const b = foundBrand.toLowerCase().trim();
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.7;
    return 0;
  }

  private calculateColorScore(lostColor: string, foundColor: string): number {
    if (!lostColor || !foundColor) return 0;
    const a = lostColor.toLowerCase().trim();
    const b = foundColor.toLowerCase().trim();
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.7;
    // Check partial word overlap
    const wordsA = a.split(/\s+/);
    const wordsB = b.split(/\s+/);
    const overlap = wordsA.filter((w) => wordsB.includes(w));
    if (overlap.length > 0) return 0.5;
    return 0;
  }

  private calculateCategoryScore(lostCategory: string, foundCategory: string): number {
    if (!lostCategory || !foundCategory) return 0;
    return lostCategory.toUpperCase().trim() === foundCategory.toUpperCase().trim() ? 1 : 0;
  }

  private calculateLocationScore(lostLocation: string, foundLocation: string): number {
    if (!lostLocation || !foundLocation) return 0;
    const a = lostLocation.toLowerCase().trim();
    const b = foundLocation.toLowerCase().trim();
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.7;
    const wordsA = a.split(/\s+/);
    const wordsB = b.split(/\s+/);
    const overlap = wordsA.filter((w) => wordsB.includes(w));
    if (overlap.length > 0) return 0.4;
    return 0;
  }

  private calculateDateProximityScore(dateLost: Date, dateFound: Date): number {
    if (!dateLost || !dateFound) return 0;
    const diffMs = Math.abs(new Date(dateFound).getTime() - new Date(dateLost).getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) return 1;
    if (diffDays <= 3) return 0.9;
    if (diffDays <= 7) return 0.7;
    if (diffDays <= 14) return 0.5;
    if (diffDays <= MATCH_CONFIG.DATE_PROXIMITY_DAYS) return 0.3;
    return 0.1;
  }

  private buildExplanation(
    imageScore: number,
    brandScore: number,
    colorScore: number,
    categoryScore: number,
    locationScore: number,
    dateScore: number
  ): string[] {
    const parts: string[] = [];

    if (imageScore > 0.7) parts.push('Strong visual similarity');
    else if (imageScore > 0.4) parts.push('Moderate visual similarity');
    else parts.push('Low visual similarity');

    if (brandScore === 1) parts.push('Exact brand match');
    else if (brandScore > 0) parts.push('Partial brand match');

    if (colorScore === 1) parts.push('Exact color match');
    else if (colorScore > 0) parts.push('Similar color');

    if (categoryScore === 1) parts.push('Same category');

    if (locationScore > 0.5) parts.push('Same or nearby location');
    else if (locationScore > 0) parts.push('Related location');

    if (dateScore > 0.7) parts.push('Very close dates');
    else if (dateScore > 0.3) parts.push('Reasonable date proximity');

    return parts;
  }
}

export const matchEngineService = new MatchEngineService();
