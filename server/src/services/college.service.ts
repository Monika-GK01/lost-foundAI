import { collegeRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { ICollege } from '../models';
import { PAGINATION } from '../constants';

export interface CreateCollegeInput {
  name: string;
  collegeCode: string;
  email: string;
  phone?: string;
  logo?: string;
  address?: string;
  website?: string;
  status?: string;
}

export interface UpdateCollegeInput {
  name?: string;
  email?: string;
  phone?: string;
  logo?: string;
  address?: string;
  website?: string;
  status?: string;
}

export class CollegeService {
  async createCollege(input: CreateCollegeInput): Promise<ICollege> {
    const codeExists = await collegeRepository.codeExists(input.collegeCode);
    if (codeExists) {
      throw ApiError.conflict('College code already exists');
    }

    return collegeRepository.create(input);
  }

  async getAllColleges(page?: number, limit?: number) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { colleges, total } = await collegeRepository.findAll(p, l);

    return {
      data: colleges,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async getCollegeById(id: string): Promise<ICollege> {
    const college = await collegeRepository.findById(id);
    if (!college) {
      throw ApiError.notFound('College not found');
    }
    return college;
  }

  async updateCollege(id: string, input: UpdateCollegeInput): Promise<ICollege> {
    const college = await collegeRepository.findById(id);
    if (!college) {
      throw ApiError.notFound('College not found');
    }

    const updated = await collegeRepository.update(id, input);
    if (!updated) {
      throw ApiError.internal('Failed to update college');
    }
    return updated;
  }

  async deleteCollege(id: string): Promise<void> {
    const college = await collegeRepository.findById(id);
    if (!college) {
      throw ApiError.notFound('College not found');
    }

    await collegeRepository.delete(id);
  }
}

export const collegeService = new CollegeService();
