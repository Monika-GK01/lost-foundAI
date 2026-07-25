import { User, IUser } from '../models';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).populate('college', 'name collegeCode').exec();
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select('+password +refreshToken').exec();
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id).exec();
  }

  async findAll(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('college', 'name collegeCode')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      User.countDocuments(filter).exec(),
    ]);
    return { users, total };
  }

  async findByCollege(
    collegeId: string,
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    return this.findAll({ college: collegeId }, page, limit);
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() }).exec();
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email }).exec();
    return !!user;
  }
}

export const userRepository = new UserRepository();
