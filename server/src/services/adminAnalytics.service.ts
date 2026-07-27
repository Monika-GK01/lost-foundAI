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
  totalUsers: number;
  rejectedClaims: number;
  approvedClaims: number;
  averageMatchScore: number;
  recoveryRate: number;
  monthlyItems: { month: string; lost: number; found: number }[];
  categoryDistribution: { category: string; count: number }[];
  recentActivity: {
    _id: string;
    type: 'claim' | 'lost' | 'found';
    title: string;
    status: string;
    createdAt: Date;
  }[];
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
      totalUsers,
      rejectedClaims,
      approvedClaims,
      averageMatchScore,
      monthlyItems,
      recentActivity,
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

      // Total users
      User.countDocuments({ college: new mongoose.Types.ObjectId(collegeId) }).exec(),

      // Rejected claims
      Claim.countDocuments({ ...collegeFilter, status: CLAIM_STATUS.REJECTED }).exec(),

      // Approved claims
      Claim.countDocuments({ ...collegeFilter, status: CLAIM_STATUS.APPROVED }).exec(),

      // Average AI match score
      this.getAverageMatchScore(collegeId),

      // Monthly lost/found items (last 6 months)
      this.getMonthlyItems(collegeId),

      // Recent activity feed
      this.getRecentActivity(collegeId),
    ]);

    const recoveryRate =
      totalLostItems > 0 ? Math.round((recoveredItems / totalLostItems) * 100) : 0;

    return {
      pendingClaims,
      recoveredItems,
      totalLostItems,
      totalFoundItems,
      claimsToday,
      averageResolutionTimeHours: avgResolution,
      topCategories,
      trustScoreDistribution: trustDistribution,
      totalUsers,
      rejectedClaims,
      approvedClaims,
      averageMatchScore,
      recoveryRate,
      monthlyItems,
      categoryDistribution: topCategories,
      recentActivity,
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

  private async getAverageMatchScore(collegeId: string): Promise<number> {
    const results = await Claim.aggregate([
      {
        $match: {
          college: new mongoose.Types.ObjectId(collegeId),
          aiMatchScore: { $gt: 0 },
        },
      },
      { $group: { _id: null, avg: { $avg: '$aiMatchScore' } } },
    ]);
    if (results.length === 0) return 0;
    return Math.round(results[0].avg);
  }

  private async getMonthlyItems(
    collegeId: string
  ): Promise<{ month: string; lost: number; found: number }[]> {
    const collegeObj = new mongoose.Types.ObjectId(collegeId);
    const months: { key: string; label: string; start: Date; end: Date }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        start,
        end,
      });
    }

    const aggregateByMonth = async (model: typeof LostItem | typeof FoundItem, dateField: string) => {
      const results = await model.aggregate([
        {
          $match: {
            college: collegeObj,
            isDeleted: false,
            [dateField]: { $gte: months[0].start },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: `$${dateField}` },
              month: { $month: `$${dateField}` },
            },
            count: { $sum: 1 },
          },
        },
      ]);
      const map = new Map<string, number>();
      results.forEach((r) => map.set(`${r._id.year}-${r._id.month - 1}`, r.count));
      return map;
    };

    const [lostMap, foundMap] = await Promise.all([
      aggregateByMonth(LostItem, 'dateLost'),
      aggregateByMonth(FoundItem, 'dateFound'),
    ]);

    return months.map((m) => ({
      month: m.label,
      lost: lostMap.get(m.key) ?? 0,
      found: foundMap.get(m.key) ?? 0,
    }));
  }

  private async getRecentActivity(collegeId: string) {
    const collegeObj = new mongoose.Types.ObjectId(collegeId);
    const [claims, lost, found] = await Promise.all([
      Claim.find({ college: collegeObj })
        .select('status createdAt lostItem')
        .populate('lostItem', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
      LostItem.find({ college: collegeObj, isDeleted: false })
        .select('title status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
      FoundItem.find({ college: collegeObj, isDeleted: false })
        .select('title status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
    ]);

    const activity = [
      ...claims.map((c) => ({
        _id: String(c._id),
        type: 'claim' as const,
        title:
          (c.lostItem as { title?: string } | undefined)?.title ?? 'Ownership claim',
        status: c.status,
        createdAt: c.createdAt,
      })),
      ...lost.map((l) => ({
        _id: String(l._id),
        type: 'lost' as const,
        title: l.title,
        status: l.status,
        createdAt: l.createdAt,
      })),
      ...found.map((f) => ({
        _id: String(f._id),
        type: 'found' as const,
        title: f.title,
        status: f.status,
        createdAt: f.createdAt,
      })),
    ];

    return activity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();

