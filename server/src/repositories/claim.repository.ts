import { Claim, IClaim } from '../models';
import { PAGINATION, CLAIM_STATUS } from '../constants';

export interface ClaimFilter {
  college?: string;
  student?: string;
  status?: string;
  lostItem?: string;
  foundItem?: string;
}

export class ClaimRepository {
  async create(data: Partial<IClaim>): Promise<IClaim> {
    return Claim.create(data);
  }

  async findById(id: string): Promise<IClaim | null> {
    return Claim.findById(id)
      .populate('student', 'name email trustScore profileImage')
      .populate('lostItem', 'title description category brand color images')
      .populate('foundItem', 'title description category brand color images location')
      .populate('reviewedBy', 'name email')
      .populate('college', 'name collegeCode')
      .exec();
  }

  async update(id: string, data: Partial<IClaim>): Promise<IClaim | null> {
    return Claim.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async findAll(
    filter: ClaimFilter,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT
  ): Promise<{ claims: IClaim[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.college) query.college = filter.college;
    if (filter.student) query.student = filter.student;
    if (filter.status) query.status = filter.status;
    if (filter.lostItem) query.lostItem = filter.lostItem;
    if (filter.foundItem) query.foundItem = filter.foundItem;

    const skip = (page - 1) * limit;

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate('student', 'name email trustScore')
        .populate('lostItem', 'title category brand color images')
        .populate('foundItem', 'title category brand color images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Claim.countDocuments(query).exec(),
    ]);

    return { claims, total };
  }

  async findPendingByCollege(collegeId: string, page: number, limit: number) {
    return this.findAll(
      { college: collegeId, status: CLAIM_STATUS.PENDING },
      page,
      limit
    );
  }

  async findByStudent(studentId: string, page: number, limit: number) {
    return this.findAll({ student: studentId }, page, limit);
  }

  async existsForItems(lostItemId: string, foundItemId: string): Promise<boolean> {
    const existing = await Claim.findOne({
      lostItem: lostItemId,
      foundItem: foundItemId,
      status: { $in: [CLAIM_STATUS.PENDING, CLAIM_STATUS.UNDER_REVIEW, CLAIM_STATUS.APPROVED] },
    }).exec();
    return !!existing;
  }

  async countByStatus(collegeId: string): Promise<Record<string, number>> {
    const results = await Claim.aggregate([
      { $match: { college: new (await import('mongoose')).default.Types.ObjectId(collegeId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts: Record<string, number> = {};
    results.forEach((r) => { counts[r._id] = r.count; });
    return counts;
  }

  async getClaimsToday(collegeId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return Claim.countDocuments({
      college: collegeId,
      createdAt: { $gte: startOfDay },
    }).exec();
  }

  async getAverageResolutionTime(collegeId: string): Promise<number> {
    const results = await Claim.aggregate([
      {
        $match: {
          college: new (await import('mongoose')).default.Types.ObjectId(collegeId),
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
}

export const claimRepository = new ClaimRepository();
