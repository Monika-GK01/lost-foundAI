import { userRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { IUser } from '../models';
import { PAGINATION } from '../constants';

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  department?: string;
  year?: number;
  rollNumber?: string;
  profileImage?: string;
}

export interface AdminUpdateUserInput extends UpdateUserInput {
  role?: string;
  isActive?: boolean;
  trustScore?: number;
}

export class UserService {
  async getProfile(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async getAllUsers(
    collegeId: string | null,
    page?: number,
    limit?: number
  ) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const filter: Record<string, unknown> = {};
    if (collegeId) {
      filter.college = collegeId;
    }

    const { users, total } = await userRepository.findAll(filter, p, l);

    return {
      data: users,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await userRepository.update(userId, input);
    if (!updated) {
      throw ApiError.internal('Failed to update user');
    }
    return updated;
  }

  async adminUpdateUser(userId: string, input: AdminUpdateUserInput): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await userRepository.update(userId, input);
    if (!updated) {
      throw ApiError.internal('Failed to update user');
    }
    return updated;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await userRepository.delete(userId);
  }
}

export const userService = new UserService();
