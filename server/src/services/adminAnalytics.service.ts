import mongoose from 'mongoose';
import { Claim } from '../models';
import { LostItem } from '../models';
import { FoundItem } from '../models';
import { User } from '../models';
import { CLAIM_STATUS, ITEM_STATUS } from '../constants';

export interface AdminAnalytics {
  pendingClaims: number;
  recoveredItems: number;
  totalLostItems: number;
  totalFoundItems: number;
  claimsToday: number;
  averageResolutionTimeHours: number;
  topCategories: { category: string; count: number }[];
  trustScoreDistribution: { range: string; count: number }[];
}

export class AdminAnalyticsService {
  async getAnalytics(collegeId: string): Promise<AdminAnalytics> {
    const collegeFilter = { college: new mongoose.Types.ObjectId(collegeId) };

    const [
      pendingClaims,
      recoveredItems,
      totalLostItems,
      totalFoundItems,
      claimsToday,
      avgResolution,
      topCategories,
      trustDistribution,
    ] = await Promise.all([
      // Pending claims
      Claim.countDocuments({
        ...collegeFilter,
        status: { $in: [CLAIM_STATUS.PENDING, CLAIM_STATUS.UNDER_REVIEW] },
      }).exec(),

      // Recovered items (lost items marked RETURNED)
      LostItem.countDocuments({
        ...collegeFilter,
        status: ITEM_STATUS.LOST.RETURNED,
        isDeleted: false,
      }).exec(),

      // Total lost items
      LostItem.countDocuments({ ...collegeFilter, isDeleted: false }).exec(),

      // Total found items
      FoundItem.countDocuments({ ...collegeFilter, isDeleted: false }).exec(),

      // Claims today
      this.getClaimsToday(collegeId),

      // Average resolution time
      this.getAverageResolutionTime(collegeId),

      // Top categories
      this.getTopCategories(collegeId),

      // Trust score distribution
      this.getTrustScoreDistribution(collegeId),
    ]);

    return {
      pendingClaims,
      recoveredItems,
      totalLostItems,
      totalFoundItems,
      claimsToday,
      averageResolutionTimeHours: avgResolution,
      topCategories,
      trustScoreDistribution: trustDistribution,
    };
  }

  private async getClaimsToday(collegeId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return Claim.countDocuments({
      college: new mongoose.Types.ObjectId(collegeId),
      createdAt: { $gte: startOfDay },
    }).exec();
  }

  private async getAverageResolutionTime(collegeId: string): Promise<number> {
    const results = await Claim.aggregate([
      {
        $match: {
          college: new mongoose.Types.ObjectId(collegeId),
          reviewedAt: { $ne: null },
        },
      },
      {
        $project: {
          resolutionMs: { $subtract: ['$reviewedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: null,
          avgMs: { $avg: '$resolutionMs' },
        },
      },
    ]);

    if (results.length === 0) return 0;
    return Math.round(results[0].avgMs / (1000 * 60 * 60)); // hours
  }

  private async getTopCategories(
    collegeId: string
  ): Promise<{ category: string; count: number }[]> {
    const results = await LostItem.aggregate([
      {
        $match: {
          college: new mongoose.Types.ObjectId(collegeId),
          isDeleted: false,
        },
      },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return results.map((r) => ({ category: r._id, count: r.count }));
  }

  private async getTrustScoreDistribution(
    collegeId: string
  ): Promise<{ range: string; count: number }[]> {
    const results = await User.aggregate([
      { $match: { college: new mongoose.Types.ObjectId(collegeId) } },
      {
        $bucket: {
          groupBy: '$trustScore',
          boundaries: [0, 20, 40, 60, 80, 101],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const rangeLabels: Record<string, string> = {
      '0': '0-19',
      '20': '20-39',
      '40': '40-59',
      '60': '60-79',
      '80': '80-100',
    };

    return results.map((r) => ({
      range: rangeLabels[String(r._id)] || 'other',
      count: r.count,
    }));
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();

