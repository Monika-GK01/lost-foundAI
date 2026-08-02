import { FoundItem, IFoundItem } from '../models';
import { PAGINATION } from '../constants';

export interface FoundItemFilter {
  college?: string;
  finder?: string;
  category?: string;
  brand?: string;
  color?: string;
  status?: string;
  keyword?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class FoundItemRepository {
  async create(data: Partial<IFoundItem>): Promise<IFoundItem> {
    return FoundItem.create(data);
  }

  async findById(id: string): Promise<IFoundItem | null> {
    return FoundItem.findOne({ _id: id, isDeleted: false })
      .populate('finder', 'name email profileImage')
      .populate('college', 'name collegeCode')
      .exec();
  }

  async findByIdWithEmbedding(id: string): Promise<IFoundItem | null> {
    return FoundItem.findOne({ _id: id, isDeleted: false })
      .select('+embedding')
      .exec();
  }

  async update(id: string, data: Partial<IFoundItem>): Promise<IFoundItem | null> {
    return FoundItem.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true, runValidators: true }
    ).exec();
  }

  async softDelete(id: string): Promise<IFoundItem | null> {
    return FoundItem.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).exec();
  }

  async findAll(
    filter: FoundItemFilter,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ items: IFoundItem[]; total: number }> {
    const query: Record<string, unknown> = { isDeleted: false };

    if (filter.college) query.college = filter.college;
    if (filter.finder) query.finder = filter.finder;
    if (filter.category) query.category = filter.category;
    if (filter.brand) query.brand = { $regex: filter.brand, $options: 'i' };
    if (filter.color) query.color = { $regex: filter.color, $options: 'i' };
    if (filter.status) query.status = filter.status;

    if (filter.keyword) {
      const words = filter.keyword.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        const conditions = words.map((word) => {
          const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = { $regex: escaped, $options: 'i' };
          return {
            $or: [
              { title: regex },
              { description: regex },
              { brand: regex },
              { color: regex },
              { category: regex },
            ],
          };
        });
        query.$and = conditions;
      }
    }

    if (filter.dateFrom || filter.dateTo) {
      query.dateFound = {};
      if (filter.dateFrom) (query.dateFound as Record<string, unknown>).$gte = filter.dateFrom;
      if (filter.dateTo) (query.dateFound as Record<string, unknown>).$lte = filter.dateTo;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      FoundItem.find(query)
        .populate('finder', 'name email profileImage')
        .populate('college', 'name collegeCode')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      FoundItem.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async findOpenWithEmbeddings(collegeId: string): Promise<IFoundItem[]> {
    return FoundItem.find({
      college: collegeId,
      isDeleted: false,
      status: 'OPEN',
    })
      .select('+embedding')
      .exec();
  }
}

export const foundItemRepository = new FoundItemRepository();

