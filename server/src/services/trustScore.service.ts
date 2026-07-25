import { userRepository } from '../repositories/user.repository';
import { TRUST_SCORE } from '../constants';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export type TrustScoreAction =
  | 'APPROVED_CLAIM'
  | 'SUCCESSFUL_FOUND_SUBMISSION'
  | 'FALSE_CLAIM'
  | 'REJECTED_SPAM'
  | 'DUPLICATE_REPORT';

const TRUST_DELTAS: Record<TrustScoreAction, number> = {
  APPROVED_CLAIM: TRUST_SCORE.APPROVED_CLAIM,
  SUCCESSFUL_FOUND_SUBMISSION: TRUST_SCORE.SUCCESSFUL_FOUND_SUBMISSION,
  FALSE_CLAIM: TRUST_SCORE.FALSE_CLAIM,
  REJECTED_SPAM: TRUST_SCORE.REJECTED_SPAM,
  DUPLICATE_REPORT: TRUST_SCORE.DUPLICATE_REPORT,
};

export class TrustScoreService {
  /**
   * Adjust a user's trust score by a defined action.
   * Clamps result between TRUST_SCORE.MIN and TRUST_SCORE.MAX.
   */
  async adjustScore(
    userId: string,
    action: TrustScoreAction
  ): Promise<{ oldScore: number; newScore: number; delta: number }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found for trust score update');
    }

    const delta = TRUST_DELTAS[action];
    const oldScore = user.trustScore;
    const newScore = Math.min(
      TRUST_SCORE.MAX,
      Math.max(TRUST_SCORE.MIN, oldScore + delta)
    );

    await userRepository.update(userId, { trustScore: newScore });

    logger.info(
      `Trust score updated for user ${userId}: ${oldScore} → ${newScore} (${action}: ${delta > 0 ? '+' : ''}${delta})`
    );

    return { oldScore, newScore, delta };
  }

  /**
   * Get the current trust score for a user.
   */
  async getScore(userId: string): Promise<number> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user.trustScore;
  }
}

export const trustScoreService = new TrustScoreService();
