import { College, ICollege } from '../models';

export class CollegeRepository {
  async findById(id: string): Promise<ICollege | null> {
    return College.findById(id).exec();
  }

  async findByCode(collegeCode: string): Promise<ICollege | null> {
    return College.findOne({ collegeCode: collegeCode.toUpperCase() }).exec();
  }

  async create(data: Partial<ICollege>): Promise<ICollege> {
    return College.create(data);
  }

  async update(id: string, data: Partial<ICollege>): Promise<ICollege | null> {
    return College.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<ICollege | null> {
    return College.findByIdAndDelete(id).exec();
  }

  async findAll(
    page: number,
    limit: number
  ): Promise<{ colleges: ICollege[]; total: number }> {
    const skip = (page - 1) * limit;
    const [colleges, total] = await Promise.all([
      College.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      College.countDocuments().exec(),
    ]);
    return { colleges, total };
  }

  async codeExists(collegeCode: string): Promise<boolean> {
    const college = await College.findOne({
      collegeCode: collegeCode.toUpperCase(),
    }).exec();
    return !!college;
  }
}

export const collegeRepository = new CollegeRepository();
